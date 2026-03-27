-- Query 1: Total distinct users
-- Expected result with default config (numUsers=100): 100

SELECT COUNT(DISTINCT user_id) AS distinct_users
FROM "s3_parquet_poc"."transactions";
