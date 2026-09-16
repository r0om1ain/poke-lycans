import sys
from pathlib import Path

SCRIPTS_FOLDER = Path(__file__).resolve().parent.parent / "scripts"
if str(SCRIPTS_FOLDER) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_FOLDER))
