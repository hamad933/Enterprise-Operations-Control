# RP02 Automation Secret Provisioning Checklist

Owner-only / repository-settings step for live Jules shadow inspection:

- [ ] Add repository Actions secret named `JULES_API_KEY`.
- [ ] Use the current Jules API key for the RP02-authorized account/project only.
- [ ] Do not put the value in variables, issue bodies, Drive plaintext, workflow inputs, repository files, screenshots, or handoff prose.
- [ ] After the foundation is independently accepted and integrated, run one read-only canary pinned to exact `main` SHA.
- [ ] Inspect the complete workflow log and artifact and confirm the secret value is absent.
- [ ] Record only the canary run ID/result as evidence; never record the secret itself.
- [ ] Rotation: replace the secret value, re-run the bounded read-only canary, and verify evidence again.

No live Jules mutation is authorized by completing this checklist.
