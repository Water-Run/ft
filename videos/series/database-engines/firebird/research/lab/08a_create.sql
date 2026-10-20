-- 干净实验用的库：新建空库、建表、插系列标准的 8 行
CREATE DATABASE 'inet://127.0.0.1:3051/lab/clean2.fdb'
  USER 'SYSDBA' PASSWORD 'ftlab2026fb'
  DEFAULT CHARACTER SET UTF8;
CREATE TABLE users (
  id   INT      NOT NULL,
  name CHAR(10) NOT NULL,
  age  SMALLINT NOT NULL,
  CONSTRAINT pk_users PRIMARY KEY (id)
);
CREATE INDEX idx_users_name ON users (name);
INSERT INTO users VALUES (1,'alice',30);
INSERT INTO users VALUES (2,'bob',25);
INSERT INTO users VALUES (3,'carol',41);
INSERT INTO users VALUES (4,'dave',19);
INSERT INTO users VALUES (5,'erin',33);
INSERT INTO users VALUES (6,'frank',52);
INSERT INTO users VALUES (7,'grace',28);
INSERT INTO users VALUES (8,'heidi',36);
COMMIT;
SELECT COUNT(*) AS USERS_ROWS FROM users;
SELECT MON$PAGE_SIZE, MON$PAGES FROM MON$DATABASE;
QUIT;
