# RP02 Jules Setup

## Repository-local setup
The automation foundation has no third-party Python dependency. Required runtime: Python 3.12 plus the standard library. `tools/rp02_automation/setup.sh` compiles the package and runs the deterministic unit suite; it performs no network call and installs nothing.

## Jules project/source binding
The live read gateway expects Jules to expose the RP02 repository source corresponding to `hamad933/Enterprise-Operations-Control`. The foundation does not infer or create that provider-side source. A live shadow canary must first inspect sources/sessions and prove the binding directly before any future mutation design relies on it.

## Secret provisioning
Create repository secret `JULES_API_KEY` in `hamad933/Enterprise-Operations-Control`. Do not place the value in repository files, Drive, issues, workflow inputs, artifacts, screenshots, or chat. Rotation requires replacing the repository secret, then running a read-only canary and confirming no leakage in logs/artifacts.

## Clean-environment validation
Run `bash tools/rp02_automation/setup.sh` on a clean checkout using Python 3.12. No Docker, database, Node package installation, or generated dependency directory is required for the automation foundation itself. Product/browser workflows remain separate.
