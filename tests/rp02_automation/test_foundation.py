from __future__ import annotations

import unittest
from unittest.mock import patch

from tools.rp02_automation.authority import authorize
from tools.rp02_automation.canonical import effect_key, intent_identity, request_key
from tools.rp02_automation.errors import Classification, GatewayError
from tools.rp02_automation.idempotency import IdempotencyRegistry
from tools.rp02_automation.jules import JulesReadOnlyClient
from tools.rp02_automation.reconciliation import ReconciliationState, classify_authoritative_poststate, retry_permitted
from tools.rp02_automation.redaction import redact
from tools.rp02_automation.schema import normalize_request


def base_request(**updates):
    value = {
        "schema_version": "1.0",
        "request_id": "RP02-AUTO-REQ-0001",
        "project_id": "RP02",
        "controller_id": "RP02_CENTRAL_CONTROLLER",
        "logical_task_id": "RP02-AUTO-FOUNDATION-001",
        "action": "inspect_sessions",
        "repository": "hamad933/Enterprise-Operations-Control",
        "starting_branch": "main",
        "expected_sha": "caaa01e20461858c9aba7e404afa5385c8bbe6bb",
        "lane": "AUTOMATION",
    }
    value.update(updates)
    return value


class DummyResponse:
    def __init__(self, body: bytes):
        self.body = body

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def read(self) -> bytes:
        return self.body


class SchemaTests(unittest.TestCase):
    def test_valid_read_request(self):
        request = normalize_request(base_request())
        self.assertEqual(request["project_id"], "RP02")

    def test_source_inspection_is_read_only_contract(self):
        request = normalize_request(base_request(action="inspect_sources"))
        self.assertEqual(request["action"], "inspect_sources")
        self.assertNotIn("write_domain", request)

    def test_unknown_field_fails_closed(self):
        with self.assertRaises(GatewayError) as ctx:
            normalize_request(base_request(arbitrary_shell="rm -rf /"))
        self.assertEqual(ctx.exception.classification, Classification.INVALID_REQUEST)

    def test_wrong_repository_denied(self):
        with self.assertRaises(GatewayError) as ctx:
            normalize_request(base_request(repository="other/repo"))
        self.assertEqual(ctx.exception.classification, Classification.AUTHORITY_DENIED)

    def test_malformed_sha_rejected(self):
        with self.assertRaises(GatewayError):
            normalize_request(base_request(expected_sha="deadbeef"))

    def test_session_action_requires_session_id(self):
        with self.assertRaises(GatewayError):
            normalize_request(base_request(action="inspect_session"))

    def test_irrelevant_field_is_rejected_per_action(self):
        with self.assertRaises(GatewayError) as ctx:
            normalize_request(base_request(session_id="123"))
        self.assertEqual(ctx.exception.classification, Classification.INVALID_REQUEST)


class AuthorityTests(unittest.TestCase):
    def test_owner_transport_passes(self):
        authorize(normalize_request(base_request()), actor="hamad933")

    def test_non_owner_transport_denied(self):
        with self.assertRaises(GatewayError):
            authorize(normalize_request(base_request()), actor="fork-user")

    def test_reviewer_cannot_request_mutation(self):
        request = base_request(
            controller_id="RP02_INDEPENDENT_REVIEWER",
            action="send_message", write_domain="docs/automation", session_id="123",
            expected_session_state="PAUSED", expected_session_update_time="2026-08-30T00:00:00Z",
        )
        with self.assertRaises(GatewayError) as ctx:
            authorize(normalize_request(request), actor="hamad933")
        self.assertEqual(ctx.exception.classification, Classification.AUTHORITY_DENIED)


class IdempotencyTests(unittest.TestCase):
    def test_exact_replay_is_not_new(self):
        registry = IdempotencyRegistry()
        request = normalize_request(base_request())
        _, first = registry.register(request)
        _, second = registry.register(request)
        self.assertTrue(first)
        self.assertFalse(second)

    def test_changed_replay_fails(self):
        registry = IdempotencyRegistry()
        registry.register(normalize_request(base_request()))
        with self.assertRaises(GatewayError) as ctx:
            registry.register(normalize_request(base_request(logical_task_id="RP02-AUTO-FOUNDATION-002")))
        self.assertEqual(ctx.exception.classification, Classification.CONFLICTING_REQUEST_ID)

    def test_request_and_effect_identity_are_separate(self):
        request = normalize_request(base_request())
        self.assertNotEqual(request_key(request["request_id"]), effect_key(
            repository=request["repository"], write_domain="docs/automation", logical_task_id=request["logical_task_id"]
        ))
        self.assertEqual(len(intent_identity(request)), 64)


class ReconciliationTests(unittest.TestCase):
    def test_applied_is_not_retryable(self):
        state = classify_authoritative_poststate(effect_present=True)
        self.assertEqual(state, ReconciliationState.APPLIED)
        self.assertFalse(retry_permitted(state))

    def test_not_applied_is_retryable_only_after_proof(self):
        state = classify_authoritative_poststate(effect_present=False)
        self.assertTrue(retry_permitted(state))

    def test_unknown_never_blind_retries(self):
        state = classify_authoritative_poststate(effect_present=None)
        self.assertEqual(state, ReconciliationState.RECONCILIATION_REQUIRED)
        self.assertFalse(retry_permitted(state))


class ProviderReadTests(unittest.TestCase):
    def test_session_inventory_truncation_fails_closed(self):
        client = JulesReadOnlyClient("dummy", read_attempts=1)
        pages = [
            {"sessions": [{"id": "1"}], "nextPageToken": "next-1"},
            {"sessions": [{"id": "2"}], "nextPageToken": "next-2"},
        ]
        with patch.object(client, "_get", side_effect=pages):
            with self.assertRaises(GatewayError) as ctx:
                client.list_sessions(max_pages=2)
        self.assertEqual(ctx.exception.classification, Classification.INVENTORY_INCOMPLETE)

    def test_repeated_pagination_token_is_protocol_failure(self):
        client = JulesReadOnlyClient("dummy", read_attempts=1)
        pages = [
            {"sessions": [{"id": "1"}], "nextPageToken": "same"},
            {"sessions": [{"id": "2"}], "nextPageToken": "same"},
        ]
        with patch.object(client, "_get", side_effect=pages):
            with self.assertRaises(GatewayError) as ctx:
                client.list_sessions(max_pages=3)
        self.assertEqual(ctx.exception.classification, Classification.PROVIDER_PROTOCOL_FAILED)

    def test_nested_activity_suffix_is_rejected(self):
        client = JulesReadOnlyClient("dummy", read_attempts=1)
        with patch.object(client, "_get", return_value={
            "activities": [{"name": "sessions/123/activities/a/extra"}],
        }):
            with self.assertRaises(GatewayError) as ctx:
                client.list_activities("123")
        self.assertEqual(ctx.exception.classification, Classification.PROVIDER_PROTOCOL_FAILED)

    def test_malformed_provider_json_is_protocol_failure(self):
        client = JulesReadOnlyClient("dummy", read_attempts=1)
        with patch("urllib.request.urlopen", return_value=DummyResponse(b"{bad-json")):
            with self.assertRaises(GatewayError) as ctx:
                client.list_sources()
        self.assertEqual(ctx.exception.classification, Classification.PROVIDER_PROTOCOL_FAILED)


class SecretTests(unittest.TestCase):
    def test_redaction_by_key_and_value(self):
        secret = "super-secret-value"
        safe = redact({"jules_api_key": secret, "message": f"x={secret}"}, secret_values=(secret,))
        self.assertEqual(safe["jules_api_key"], "[REDACTED]")
        self.assertNotIn(secret, safe["message"])

    def test_client_has_source_read_but_no_mutation_api(self):
        names = set(dir(JulesReadOnlyClient))
        self.assertIn("list_sources", names)
        self.assertNotIn("create_session", names)
        self.assertNotIn("send_message", names)
        self.assertNotIn("approve_plan", names)


if __name__ == "__main__":
    unittest.main()
