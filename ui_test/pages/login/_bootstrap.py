"""
Local bootstrap for direct test execution in this folder.

When a test here is run as a standalone script (python test_*.py),
ensure the repository root is on sys.path so imports like `from ui_test...`
work across Windows, Linux, and macOS.
"""
import sys
from pathlib import Path


def _add_repo_root():
    here = Path(__file__).resolve()
    # Walk up to the repository root (folder that contains 'ui_test')
    repo_root = None
    for parent in here.parents:
        if (parent / "ui_test").is_dir():
            repo_root = parent
            break
    if repo_root is None:
        return

    repo_root_str = str(repo_root)
    if repo_root_str not in sys.path:
        sys.path.insert(0, repo_root_str)


_add_repo_root()
