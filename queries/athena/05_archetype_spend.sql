-- Average absolute spend per category broken down by derived archetype.
-- Archetype is inferred from the user's salary amount (non-overlapping ranges).
WITH user_archetypes AS (
    SELECT
        user_id,
        CASE
            WHEN MAX(amount) BETWEEN 1200 AND 2000  THEN 'low'
            WHEN MAX(amount) BETWEEN 3000 AND 5000  THEN 'mid'
            WHEN MAX(amount) BETWEEN 8000 AND 15000 THEN 'high'
        END AS archetype
    FROM "s3_parquet_poc"."transactions"
    WHERE category = 'salary'
    GROUP BY user_id
),
spend AS (
    SELECT t.user_id, t.category, ABS(t.amount) AS abs_amount
    FROM "s3_parquet_poc"."transactions" t
    WHERE t.amount < 0
      AND t.category NOT IN ('rent')
)
SELECT
    a.archetype,
    s.category,
    ROUND(AVG(s.abs_amount), 2) AS avg_spend,
    COUNT(*) AS tx_count
FROM spend s
JOIN user_archetypes a ON s.user_id = a.user_id
GROUP BY a.archetype, s.category
ORDER BY a.archetype, avg_spend DESC
