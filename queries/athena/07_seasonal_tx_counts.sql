-- Total transaction count per calendar month.
-- The seasonal multiplier (0.8× Jan → 1.3× Dec) should be clearly visible.
SELECT
    year,
    month,
    COUNT(*) AS tx_count
FROM "s3_parquet_poc"."transactions"
GROUP BY year, month
ORDER BY year ASC, CAST(month AS INTEGER) ASC
