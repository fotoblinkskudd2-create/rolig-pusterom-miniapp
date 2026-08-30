#!/usr/bin/env python3
"""Entry point for Pusterom CLI. Run with: python3 main.py <kommando>

See CLI_README.md for full usage. Try `python3 main.py --help` to start.
"""
import sys

from pusterom_cli.cli import main

if __name__ == "__main__":
    sys.exit(main())
