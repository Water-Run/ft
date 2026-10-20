@echo off
chcp 65001 >nul
call "C:\Program Files\Microsoft Visual Studio\18\Insiders\VC\Auxiliary\Build\vcvars64.bat" >nul
set PATH=C:\Users\user\luai-video-lab\luai\bin;C:\SoftWare\lua\lua-5.5.0_Win64_bin;%PATH%
cd /d C:\Users\user\luai-video-lab\moon
echo $ luai -b --file main.lua -o build\moon-onefile.exe
call luai -b --file main.lua -o build\moon-onefile.exe --lua-prefix C:\Users\user\luai-video-lab\lua55
echo [exit %errorlevel%]
dir build
set PATH=C:\Windows\System32
echo $ build\moon-onefile.exe 2026-10-01
build\moon-onefile.exe 2026-10-01
echo [exit %errorlevel%]
