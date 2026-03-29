-- Total absolute spend per category per month.
-- Useful for identifying which categories drive the December peak.
SELECT
    year,
    month,
    category,
    ROUND(SUM(ABS(amount)), 2) AS total_spend,
    COUNT(*)                    AS tx_count
FROM read_parquet('s3://{bucket}/transactions/year=*/month=*/part-0.parquet', hive_partitioning = true)
WHERE amount < 0
GROUP BY year, month, category
ORDER BY year ASC, CAST(month AS INTEGER) ASC, total_spend DESC
