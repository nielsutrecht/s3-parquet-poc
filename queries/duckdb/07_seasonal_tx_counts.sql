-- Total transaction count per calendar month.
-- The seasonal multiplier (0.8× Jan → 1.3× Dec) should be clearly visible.
SELECT
    year,
    month,
    COUNT(*) AS tx_count
FROM read_parquet('s3://{bucket}/transactions/year=*/month=*/part-0.parquet', hive_partitioning = true)
GROUP BY year, month
ORDER BY year ASC, CAST(month AS INTEGER) ASC
