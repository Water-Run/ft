-- 安全库初始化：Firebird 5.0 出厂的 security5.fdb 没有任何预置用户。
-- 这一步必须用「嵌入式」连接完成（本地文件路径，引擎在 isql 进程内），
-- 见安装包里的 doc/README.security_database.txt：
--   「For an embedded connection, an authentication password is not required
--     and will be ignored if you provide one.」
-- 库文件用相对路径：run_lab.ps1 把工作目录切到 out/lab/，入库文件里不留本机绝对路径。
-- 口令由 run_lab.ps1 现场生成并替换下面的占位符，入库的脚本里不写真值。
CREATE DATABASE 'security_init.fdb'
  DEFAULT CHARACTER SET UTF8;

CREATE USER SYSDBA PASSWORD '__FTLAB_PASSWORD__';
COMMIT;

SELECT SEC$USER_NAME AS USER_NAME, SEC$PLUGIN AS PLUGIN FROM SEC$USERS;
QUIT;
