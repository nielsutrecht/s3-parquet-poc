-- Query 2: Number of distinct accounts per user, ordered descending
-- Expected result with default config (accountsPerUser=10): every user has 10 accounts

SELECT
    user_id,
    COUNT(DISTINCT account_id) AS num_accounts
FROM "s3_parquet_poc"."transactions"
GROUP BY user_id
ORDER BY num_accounts DESC;
