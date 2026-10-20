@echo off
setlocal
set M=C:\LegacyDev\MySQL55\bin
set D=C:\LegacyDev\MySQL55\data\myisam_demo
set W=C:\Users\Administrator\claude\myisam
cd /d %W%
rem 口令从环境变量 SIM_MYSQL_PW 读取，不写在脚本里
set PW=%SIM_MYSQL_PW%
"%M%\mysql.exe" -uroot -p%PW% -t -vvv < 06a.sql > 06a.out 2>&1
copy /y "%D%\users.MYI" "%D%\users_crashed.MYI"
copy /y "%D%\users.frm" "%D%\users_crashed.frm"
"%M%\mysql.exe" -uroot -p%PW% -t -vvv < 06b.sql > 06b.out 2>&1
copy /y "%D%\users.MYD" "%D%\users_crashed.MYD"
if not exist snap_06_crash mkdir snap_06_crash
copy /y "%D%\users_crashed.*" snap_06_crash\ > nul
"%M%\mysql.exe" -uroot -p%PW% -t -vvv < 06c.sql > 06c.out 2>&1
type 06c.out
