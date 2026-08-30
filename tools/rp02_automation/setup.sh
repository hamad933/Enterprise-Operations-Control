#!/usr/bin/env bash
set -euo pipefail
python --version
python -m compileall -q tools/rp02_automation tests/rp02_automation
python -m unittest discover -s tests/rp02_automation -p 'test_*.py' -v
echo "RP02 automation foundation setup/validation complete."
