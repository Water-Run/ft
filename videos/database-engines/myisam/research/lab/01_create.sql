DROP DATABASE IF EXISTS myisam_demo;
CREATE DATABASE myisam_demo DEFAULT CHARACTER SET latin1;
USE myisam_demo;
CREATE TABLE users (
  id   INT      NOT NULL,
  name CHAR(10) NOT NULL,
  age  TINYINT  NOT NULL,
  PRIMARY KEY (id),
  KEY idx_name (name)
) ENGINE=MyISAM;
INSERT INTO users VALUES
 (1,'alice',30),(2,'bob',25),(3,'carol',41),(4,'dave',19),
 (5,'erin',33),(6,'frank',52),(7,'grace',28),(8,'heidi',36);
CREATE TABLE notes (
  id   INT NOT NULL,
  body VARCHAR(200) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=MyISAM;
INSERT INTO notes VALUES (1,'hello'),(2,'MyISAM stores rows in a .MYD file'),(3,'short');
CREATE TABLE nul (
  id   INT NOT NULL,
  a    CHAR(4) NULL,
  b    INT NULL,
  PRIMARY KEY (id)
) ENGINE=MyISAM;
INSERT INTO nul VALUES (1,'abcd',7),(2,NULL,7),(3,'abcd',NULL),(4,NULL,NULL);
SHOW TABLE STATUS;
SELECT * FROM users;
SHOW CREATE TABLE users;
SHOW ENGINES;
SHOW VARIABLES LIKE 'myisam%';
SHOW VARIABLES LIKE 'key_%';
SHOW VARIABLES LIKE 'concurrent_insert';
SHOW VARIABLES LIKE 'version%';
EXPLAIN SELECT * FROM users WHERE id = 5;
FLUSH TABLES;
