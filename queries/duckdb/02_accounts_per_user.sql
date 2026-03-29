-- Distribution summary
WITH accounts_per_user AS (
    SELECT user_id, COUNT(DISTINCT account_id) AS num_accounts
    FROM read_parquet('s3://{bucket}/transactions/year=*/month=*/part-0.parquet')
    GROUP BY user_id
)
SELECT
    MIN(num_accounts) AS min_accounts,
    MAX(num_accounts) AS max_accounts,
    ROUND(AVG(num_accounts), 2) AS avg_accounts
FROM accounts_per_user;

-- Top 5 users by account count
SELECT user_id, COUNT(DISTINCT account_id) AS num_accounts
FROM read_parquet('s3://{bucket}/transactions/year=*/month=*/part-0.parquet')
GROUP BY user_id
ORDER BY num_accounts DESC
LIMIT 5
