@echo off
title SatQuery AI - Public Sharing Tunnel
echo ======================================================================
echo           SATQUERY AI - GENERATE PUBLIC SHARING URL
echo ======================================================================
echo.
echo Make sure SatQuery AI is running (python start_app.py) on port 8000!
echo.
echo Launching public HTTPS tunnel...
echo.
npx localtunnel --port 8000
pause
