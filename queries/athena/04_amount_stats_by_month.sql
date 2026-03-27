-- Query 4: Min / max / avg amount per year/month, ordered chronologically
-- Expected result with Jan 2024 – Dec 2025 data: exactly 24 rows

SELECT
    year,
    month,
    MIN(amount) AS min_amount,
    MAX(amount) AS max_amount,
    AVG(amount) AS avg_amount
FROM "s3_parquet_poc"."transactions"
GROUP BY year, month
ORDER BY year ASC, month ASC;
