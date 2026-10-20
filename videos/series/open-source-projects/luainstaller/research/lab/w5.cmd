@echo off
chcp 65001 >nul
call "C:\Program Files\Microsoft Visual Studio\18\Insiders\VC\Auxiliary\Build\vcvars64.bat" >nul
set PATH=C:\Users\user\luai-video-lab\luai\bin;C:\SoftWare\lua\lua-5.5.0_Win64_bin;%PATH%
cd /d C:\Users\user\luai-video-lab
if not exist lua55\include mkdir lua55\include
copy /y C:\SoftWare\lua\lua-5.5.0_Win64_dllw6_lib\include\*.h lua55\include\ >nul
copy /y C:\SoftWare\lua\lua-5.5.0_Win64_bin\lua55.dll lua55\ >nul
cd moon
if exist build rmdir /s /q build
echo $ luai -b main.lua -o build\moon --lua-prefix ..\lua55
call luai -b main.lua -o build\moon --lua-prefix C:\Users\user\luai-video-lab\lua55
echo [exit %errorlevel%]
echo $ dir build\moon
dir /a /s /b build 2>nul
set PATH=C:\Windows\System32
set LUA_PATH=
set LUA_CPATH=
echo $ build\moon\moon.exe 2026-10-01   (PATH=System32 only)
build\moon\moon.exe 2026-10-01
echo [exit %errorlevel%]
