UPDATE users SET age = 30 WHERE id = 1;
SELECT id, name, age FROM users WHERE id = 1;
COMMIT;
SELECT id, name, age FROM users WHERE id = 1;
QUIT;
