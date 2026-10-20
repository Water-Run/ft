@echo off
chcp 65001 >nul
call "C:\Program Files\Microsoft Visual Studio\18\Insiders\VC\Auxiliary\Build\vcvars64.bat" >nul
set PATH=C:\Users\user\luai-video-lab\luai\bin;C:\SoftWare\lua\lua-5.5.0_Win64_bin;%PATH%
set LUAI_LUA_PREFIX=C:\Users\user\luai-video-lab\lua55
cd /d C:\Users\user\luai-video-lab\moon
if exist build rmdir /s /q build
echo ### env: LUAI_LUA_PREFIX=%LUAI_LUA_PREFIX%
cl 2>&1 | findstr /c:"Version"
lua55 -v
echo $ luai -v
call luai -v
echo $ luai -a main.lua
call luai -a main.lua
echo [%time%] $ luai -b main.lua -o build\moon
call luai -b main.lua -o build\moon
echo [exit %errorlevel%] [%time%]
echo $ dir build\moon
dir build\moon
echo [%time%] $ luai -b --file main.lua -o build\moon-onefile
call luai -b --file main.lua -o build\moon-onefile
echo [exit %errorlevel%] [%time%]
dir build
set PATH=C:\Windows\System32
set LUA_PATH=
set LUA_CPATH=
echo $ build\moon\moon.exe 2026-10-01
build\moon\moon.exe 2026-10-01
echo [exit %errorlevel%]
for %%f in (build\moon-onefile*) do (echo $ %%f 2026-10-01 & %%f 2026-10-01)
echo [exit %errorlevel%]
echo ### done
