@echo off
setlocal
set M=C:\LegacyDev\MySQL55\bin
set D=C:\LegacyDev\MySQL55\data\myisam_demo
set W=C:\Users\Administrator\claude\myisam
cd /d %W%
rem 口令从环境变量 SIM_MYSQL_PW 读取，不写在脚本里
set PW=%SIM_MYSQL_PW%
for %%s in (01_create 02_delete 03_reuse 04_reuse2 05_big) do (
  echo ===== %%s =====
  "%M%\mysql.exe" -uroot -p%PW% -t -vvv < %%s.sql > %%s.out 2>&1
  if not exist snap_%%s mkdir snap_%%s
  copy /y "%D%\*.*" snap_%%s\ > nul
  dir snap_%%s
)
echo ===== myisamchk =====
"%M%\myisamchk.exe" -dvv "%D%\users.MYI" > chk_users.out 2>&1
"%M%\myisamchk.exe" -dvv "%D%\notes.MYI" > chk_notes.out 2>&1
"%M%\myisamchk.exe" -dvv "%D%\users_big.MYI" > chk_big.out 2>&1
"%M%\myisamchk.exe" -dvv "%D%\nul.MYI" > chk_nul.out 2>&1
"%M%\mysql.exe" -uroot -p%PW% -e "status" > banner.out 2>&1
echo done
