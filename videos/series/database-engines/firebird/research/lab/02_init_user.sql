-- 安全库初始化：Firebird 5.0 的 security5.fdb 没有任何预置用户
-- 这一步必须用「嵌入式」连接完成（本地文件路径，引擎在 isql 进程内）
-- 见 doc/README.security_database.txt
CREATE DATABASE 'D:\Coding\ft\videos\series\database-engines\firebird\out\lab\embedded.fdb'
  DEFAULT CHARACTER SET UTF8;

CREATE USER SYSDBA PASSWORD 'ftlab2026fb' USING PLUGIN Srp256;
COMMIT;

SELECT SEC$USER_NAME AS USER_NAME, SEC$PLUGIN AS PLUGIN FROM SEC$USERS;
SELECT COUNT(*) AS SYS_TABLES FROM RDB$RELATIONS WHERE RDB$SYSTEM_FLAG = 1;
QUIT;
