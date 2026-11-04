#!/usr/bin/env bash
cd "$(dirname "$0")"
pip install -r requirements.txt || true
python3 server.py
