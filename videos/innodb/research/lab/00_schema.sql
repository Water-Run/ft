-- Synthetic data shared with the MyISAM episode; no real user records.
CREATE DATABASE innodb_demo DEFAULT CHARACTER SET latin1;
USE innodb_demo;
CREATE TABLE users (
  id INT NOT NULL,
  name CHAR(10) NOT NULL,
  age TINYINT NOT NULL,
  PRIMARY KEY (id),
  KEY idx_name (name)
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC;
INSERT INTO users VALUES
 (1,'alice',30),(2,'bob',25),(3,'carol',41),(4,'dave',19),
 (5,'erin',33),(6,'frank',52),(7,'grace',28),(8,'heidi',36);
CREATE TABLE notes (
 id INT NOT NULL,
 body VARCHAR(200) NOT NULL,
 PRIMARY KEY (id)
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC;
INSERT INTO notes VALUES (1,'hello'),(2,'MyISAM stores rows in a .MYD file'),(3,'short');
CREATE TABLE users_myisam LIKE users;
ALTER TABLE users_myisam ENGINE=MyISAM ROW_FORMAT=FIXED;
INSERT INTO users_myisam SELECT * FROM users;
CREATE TABLE users_gap LIKE users;
INSERT INTO users_gap VALUES (10,'alice',30),(20,'bob',25),(30,'carol',41);
