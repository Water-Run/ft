USE myisam_demo;
SELECT COUNT(*) FROM users_crashed;
SELECT * FROM users_crashed WHERE id = 13;
CHECK TABLE users_crashed;
REPAIR TABLE users_crashed;
CHECK TABLE users_crashed;
SELECT COUNT(*) FROM users_crashed;
SELECT * FROM users_crashed WHERE id = 13;
FLUSH TABLES;
