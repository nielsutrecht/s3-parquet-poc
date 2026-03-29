-- Per-user salary vs spend summary and spend rate (total debits / total salary).
-- Users with a spend_rate close to 1.0 are spending almost all their income.
SELECT
    user_id,
    ROUND(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 2)        AS total_salary,
    ROUND(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 2)   AS total_spend,
    ROUND(
        SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) /
        NULLIF(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0),
        3
    )                                                                   AS spend_rate
FROM read_parquet('s3://{bucket}/transactions/year=*/month=*/part-0.parquet')
GROUP BY user_id
ORDER BY spend_rate DESC
