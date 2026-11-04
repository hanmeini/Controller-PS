@echo off
title Controller-PS Laptop Server
echo Menyiapkan dependensi Python...
pip install -r requirements.txt
cls
python server.py
pause
