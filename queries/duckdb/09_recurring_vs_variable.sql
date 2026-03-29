-- Per-user monthly average fixed costs (rent + subscriptions) vs variable spend,
-- and the ratio of fixed to total spend across the full date range.
WITH monthly_spend AS (
    SELECT
        user_id,
        year,
        month,
        SUM(CASE WHEN category IN ('rent', 'subscriptions') THEN ABS(amount) ELSE 0 END) AS fixed,
        SUM(CASE WHEN category NOT IN ('rent', 'subscriptions', 'salary') AND amount < 0
                 THEN ABS(amount) ELSE 0 END)                                              AS variable
    FROM read_parquet('s3://{bucket}/transactions/year=*/month=*/part-0.parquet', hive_partitioning = true)
    GROUP BY user_id, year, month
)
SELECT
    user_id,
    ROUND(AVG(fixed), 2)                                    AS avg_fixed_monthly,
    ROUND(AVG(variable), 2)                                 AS avg_variable_monthly,
    ROUND(AVG(fixed) / NULLIF(AVG(fixed + variable), 0), 3) AS fixed_ratio
FROM monthly_spend
GROUP BY user_id
ORDER BY fixed_ratio DESC
