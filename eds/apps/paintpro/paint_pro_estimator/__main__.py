import sys
from pathlib import Path

# Add package to path if running as frozen exe
if getattr(sys, 'frozen', False):
    import os
    bundle_dir = Path(sys._MEIPASS)
else:
    bundle_dir = Path(__file__).parent

from paint_pro_estimator.cli import main

if __name__ == "__main__":
    main()
