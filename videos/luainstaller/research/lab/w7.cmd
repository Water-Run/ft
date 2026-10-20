@echo off
chcp 65001 >nul
cd /d C:\Users\user\luai-video-lab\moon
set PATH=C:\Windows\System32
set LUA_PATH=
set LUA_CPATH=
echo $ build\moon\moon.exe 2026-10-01   (PATH=System32 only)
build\moon\moon.exe 2026-10-01
echo [exit %errorlevel%]
dir build\moon
