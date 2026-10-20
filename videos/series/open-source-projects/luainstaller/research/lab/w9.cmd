@echo off
chcp 65001 >nul
call "C:\Program Files\Microsoft Visual Studio\18\Insiders\VC\Auxiliary\Build\vcvars64.bat" >nul
set PATH=C:\Users\user\luai-video-lab\luai\bin;C:\SoftWare\lua\lua-5.5.0_Win64_bin;%PATH%
if exist C:\luai-demo rmdir /s /q C:\luai-demo
mkdir C:\luai-demo\moon\moon C:\luai-demo\lua55\include
copy /y C:\Users\user\luai-video-lab\moon\main.lua C:\luai-demo\moon\ >nul
copy /y C:\Users\user\luai-video-lab\moon\moon\*.lua C:\luai-demo\moon\moon\ >nul
copy /y C:\Users\user\luai-video-lab\lua55\include\*.h C:\luai-demo\lua55\include\ >nul
copy /y C:\Users\user\luai-video-lab\lua55\lua55.dll C:\luai-demo\lua55\ >nul
ver
cl 2>&1 | findstr /c:"Version"
lua55 -v
cd /d C:\luai-demo\moon
echo $ set LUAI_LUA_PREFIX=C:\luai-demo\lua55
set LUAI_LUA_PREFIX=C:\luai-demo\lua55
echo [exit 0]
echo $ luai -v
call luai -v
echo [exit %errorlevel%]
echo $ luai -a main.lua
call luai -a main.lua
echo [exit %errorlevel%]
echo $ luai -b main.lua -o build\moon
call luai -b main.lua -o build\moon
echo [exit %errorlevel%]
echo $ dir /b build\moon
dir /b /a build\moon
echo [exit 0]
dir build\moon
set PATH=C:\Windows\System32
set LUA_PATH=
set LUA_CPATH=
echo $ build\moon\moon.exe 2026-10-01
build\moon\moon.exe 2026-10-01
echo [exit %errorlevel%]
echo ### done
