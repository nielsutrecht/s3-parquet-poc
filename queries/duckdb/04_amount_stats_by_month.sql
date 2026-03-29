SELECT
    year,
    month,
    ROUND(MIN(amount), 2) AS min_amount,
    ROUND(MAX(amount), 2) AS max_amount,
    ROUND(AVG(amount), 2) AS avg_amount
FROM read_parquet('s3://{bucket}/transactions/year=*/month=*/part-0.parquet', hive_partitioning = true)
GROUP BY year, month
ORDER BY year ASC, month ASC
