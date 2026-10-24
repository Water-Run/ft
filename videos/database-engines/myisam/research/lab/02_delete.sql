USE myisam_demo;
DELETE FROM users WHERE id = 3;
DELETE FROM users WHERE id = 6;
UPDATE notes SET body='hello, this row just grew longer than its old slot' WHERE id=1;
SHOW TABLE STATUS;
FLUSH TABLES;
