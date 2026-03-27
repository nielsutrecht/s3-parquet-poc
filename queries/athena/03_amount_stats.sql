-- Query 3: Overall min / max / avg transaction amount
-- amount sign convention: positive = credit (salary), negative = debit (spend)
-- Expected: min is negative (largest debit), max is positive (largest salary credit)

SELECT
    MIN(amount)  AS min_amount,
    MAX(amount)  AS max_amount,
    AVG(amount)  AS avg_amount
FROM "s3_parquet_poc"."transactions";
