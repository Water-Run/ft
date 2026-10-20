@echo off
chcp 65001 >nul
call "C:\Program Files\Microsoft Visual Studio\18\Insiders\VC\Auxiliary\Build\vcvars64.bat" >nul
set PATH=C:\SoftWare\lua\lua-5.5.0_Win64_bin;%PATH%
cd /d C:\Users\user\luai-video-lab
if exist luai rmdir /s /q luai
echo $ lua55 tools\install.lua --prefix luai
lua55 luainstaller\tools\install.lua --prefix C:\Users\user\luai-video-lab\luai
echo [exit %errorlevel%]
dir /b luai luai\bin
set PATH=C:\Users\user\luai-video-lab\luai\bin;%PATH%
echo $ luai -v
call luai -v
cd moon
if exist build rmdir /s /q build
echo $ lua55 main.lua 2026-10-01
lua55 main.lua 2026-10-01
echo $ luai -a main.lua
call luai -a main.lua
echo [exit %errorlevel%]
echo $ luai -b main.lua -o build\moon
call luai -b main.lua -o build\moon
echo [exit %errorlevel%]
dir /s /b build 2>nul
