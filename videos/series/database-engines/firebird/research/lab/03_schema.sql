-- 与系列前几集同一张示例表、同一批数据：users(id, name, age) 与 notes(id, body)
-- MyISAM 一集用的是 MySQL 的 TINYINT；Firebird 无 TINYINT，等价用 SMALLINT
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
CREATE TABLE notes (
  id   INT NOT NULL,
  body VARCHAR(200) NOT NULL,
  CONSTRAINT pk_notes PRIMARY KEY (id)
);
INSERT INTO notes VALUES (1,'hello');
INSERT INTO notes VALUES (2,'Firebird keeps row versions in the data page');
INSERT INTO notes VALUES (3,'short');
COMMIT;
SELECT COUNT(*) AS USERS_ROWS FROM users;
SELECT COUNT(*) AS NOTES_ROWS FROM notes;
SELECT * FROM users ORDER BY id;
SELECT MON$PAGE_SIZE AS PAGE_SIZE, MON$PAGES AS PAGES FROM MON$DATABASE;
SELECT RDB$INDEX_NAME AS IDX, RDB$UNIQUE_FLAG AS UNIQUE, RDB$INDEX_TYPE AS TYPE FROM RDB$INDICES WHERE RDB$SYSTEM_FLAG = 0;
QUIT;
