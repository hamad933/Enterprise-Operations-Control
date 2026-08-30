from __future__ import annotations

import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
INSPECT = ROOT / ".github" / "workflows" / "rp02-automation-inspect.yml"
TESTS = ROOT / ".github" / "workflows" / "rp02-automation-tests.yml"
SHA_PIN = re.compile(r"^\s*uses:\s+actions/[A-Za-z0-9_.-]+@[0-9a-f]{40}(?:\s+#.*)?$")
ACTION_USE = re.compile(r"^\s*uses:\s+actions/.*$", re.MULTILINE)
JULES_SECRET_MAPPING = re.compile(
    r"^\s+JULES_API_KEY:\s+\$\{\{\s*secrets\.JULES_API_KEY\s*\}\}\s*$",
    re.MULTILINE,
)


class WorkflowSecurityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.inspect = INSPECT.read_text(encoding="utf-8")
        cls.tests = TESTS.read_text(encoding="utf-8")

    def test_all_github_owned_actions_are_immutable_sha_pins(self):
        for text in (self.inspect, self.tests):
            action_lines = ACTION_USE.findall(text)
            self.assertTrue(action_lines)
            for line in action_lines:
                self.assertRegex(line, SHA_PIN)

    def test_shadow_workflow_has_no_untrusted_secret_trigger(self):
        self.assertIn("workflow_dispatch:", self.inspect)
        self.assertNotIn("pull_request_target:", self.inspect)
        self.assertNotIn("pull_request:", self.inspect)
        self.assertNotIn("workflow_run:", self.inspect)

    def test_shadow_transport_is_bound_to_canonical_repository(self):
        self.assertIn("REPOSITORY: ${{ github.repository }}", self.inspect)
        self.assertIn('test "$REPOSITORY" = "hamad933/Enterprise-Operations-Control"', self.inspect)
        self.assertIn('test "$REF" = "refs/heads/main"', self.inspect)

    def test_jules_secret_is_scoped_only_to_provider_step(self):
        marker = "- name: Execute GET-only shadow inspection"
        self.assertIn(marker, self.inspect)
        before, after = self.inspect.split(marker, 1)
        self.assertNotIn("JULES_API_KEY", before)
        self.assertEqual(len(JULES_SECRET_MAPPING.findall(after)), 1)
        upload = after.split("- name: Upload machine-readable shadow evidence", 1)[1]
        self.assertNotIn("JULES_API_KEY", upload)

    def test_checkout_credentials_are_not_persisted(self):
        self.assertIn("persist-credentials: false", self.inspect)
        self.assertIn("persist-credentials: false", self.tests)

    def test_shadow_permissions_are_read_only(self):
        permissions = self.inspect.split("permissions:", 1)[1].split("concurrency:", 1)[0]
        self.assertIn("contents: read", permissions)
        self.assertIn("actions: read", permissions)
        self.assertNotRegex(permissions, r":\s*write\b")

    def test_test_workflow_permissions_are_read_only(self):
        permissions = self.tests.split("permissions:", 1)[1].split("jobs:", 1)[0]
        self.assertIn("contents: read", permissions)
        self.assertNotRegex(permissions, r":\s*write\b")


if __name__ == "__main__":
    unittest.main()
