-- Transactions whose absolute amount exceeds the 99th percentile for their category.
-- Reveals the log-normal tail — occasional large spend amounts per category.
WITH category_p99 AS (
    SELECT
        category,
        APPROX_PERCENTILE(ABS(amount), 0.99) AS p99_threshold
    FROM "s3_parquet_poc"."transactions"
    WHERE amount < 0
    GROUP BY category
)
SELECT
    t.transaction_id,
    t.user_id,
    t.category,
    ROUND(ABS(t.amount), 2)   AS abs_amount,
    ROUND(p.p99_threshold, 2) AS p99_threshold,
    ROUND(ABS(t.amount) / p.p99_threshold, 2) AS multiple_of_p99,
    t.date
FROM "s3_parquet_poc"."transactions" t
JOIN category_p99 p ON t.category = p.category
WHERE t.amount < 0
  AND ABS(t.amount) > p.p99_threshold
ORDER BY multiple_of_p99 DESC
LIMIT 100
