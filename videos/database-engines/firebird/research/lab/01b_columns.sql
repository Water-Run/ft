-- 列名发现 + 真实运行参数
SELECT * FROM MON$DATABASE;
SELECT * FROM RDB$DATABASE;
SELECT rdb$field_name AS FLD, rdb$field_type AS TYPE, rdb$null_flag AS NULLABLE
  FROM rdb$relation_fields
 WHERE rdb$relation_name IN ('MON$DATABASE','RDB$DATABASE')
 ORDER BY rdb$relation_name, rdb$field_position;
QUIT;
