CREATE TABLE users (
  id integer PRIMARY KEY,
  name character(10) NOT NULL,
  age smallint NOT NULL CHECK (age BETWEEN 0 AND 150)
) WITH (fillfactor=70);
CREATE INDEX users_name_idx ON users(name);
INSERT INTO users VALUES
 (1,'alice',30),(2,'bob',25),(3,'carol',41),(4,'dave',19),
 (5,'erin',33),(6,'frank',52),(7,'grace',28),(8,'heidi',36);
CREATE TABLE notes (id integer PRIMARY KEY, body text NOT NULL);
INSERT INTO notes VALUES (1,'hello'),(2,'synthetic note'),(3,'short');
CREATE TABLE users_many (LIKE users INCLUDING ALL);
INSERT INTO users_many SELECT * FROM users;
INSERT INTO users_many SELECT i, ('u'||lpad(i::text,8,'0'))::character(10), (18+i%60)::smallint FROM generate_series(9,20000) AS i;
ANALYZE users;
ANALYZE users_many;
