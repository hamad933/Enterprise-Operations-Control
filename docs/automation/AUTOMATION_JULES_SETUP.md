# RP02 Jules Setup

## Repository-local setup
The automation foundation has no third-party Python dependency. Required runtime: Python 3.12 plus the standard library. `tools/rp02_automation/setup.sh` compiles the package and runs the deterministic unit suite; it performs no network call and installs nothing.

## Jules project/source binding
The live read gateway expects Jules to expose the RP02 repository source corresponding to `hamad933/Enterprise-Operations-Control`. The foundation does not infer or create that provider-side source. A live shadow canary must first inspect the complete paginated Sources inventory and prove `githubRepo.owner=hamad933`, `githubRepo.repo=Enterprise-Operations-Control`, and the expected default branch before any future mutation design relies on that binding.

Current Jules list endpoints are paginated. Source, session, and activity inventory therefore fail closed when a continuation token remains after the configured page bound or when pagination tokens repeat. Provider reference implementations are not treated as timeless API authority; current Jules documentation must be re-verified when provider behavior is material.

For session paths, RP02 uses the canonical resource-name segment from `sessions/{session}`. The provider's separate `id` field is treated as metadata and is not assumed to equal the resource-name segment or to be numeric.

## Secret provisioning
Create repository secret `JULES_API_KEY` in `hamad933/Enterprise-Operations-Control`. Do not place the value in repository files, Drive, issues, workflow inputs, artifacts, screenshots, or chat. Rotation requires replacing the repository secret, then running a read-only canary and confirming no leakage in logs/artifacts.

## Clean-environment validation
Run `bash tools/rp02_automation/setup.sh` on a clean checkout using Python 3.12. No Docker, database, Node package installation, or generated dependency directory is required for the automation foundation itself. Product/browser workflows remain separate.
