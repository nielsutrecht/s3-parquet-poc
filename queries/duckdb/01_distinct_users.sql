SELECT COUNT(DISTINCT user_id) AS distinct_users
FROM read_parquet('s3://{bucket}/transactions/year=*/month=*/part-0.parquet')
