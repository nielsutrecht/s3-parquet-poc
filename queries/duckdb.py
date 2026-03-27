#!/usr/bin/env python3
"""
DuckDB query script — reads Parquet partitions directly from S3 via httpfs.

Usage:
    BUCKET_NAME=transactions-037bac4 python queries/duckdb.py

Requires:
    pip install duckdb
    AWS credentials in environment or ~/.aws/credentials
"""

import os
import sys

# Remove this file's directory from sys.path so 'import duckdb' resolves to
# the installed package rather than this script itself.
_this_dir = os.path.dirname(os.path.abspath(__file__))
if _this_dir in sys.path:
    sys.path.remove(_this_dir)

import duckdb


def main() -> None:
    bucket = os.environ.get("BUCKET_NAME")
    if not bucket:
        print("Error: BUCKET_NAME environment variable is not set.", file=sys.stderr)
        print("Usage: BUCKET_NAME=<bucket> python queries/duckdb.py", file=sys.stderr)
        sys.exit(1)

    glob = f"s3://{bucket}/transactions/year=*/month=*/part-0.parquet"

    con = duckdb.connect()

    con.sql("INSTALL httpfs")
    con.sql("LOAD httpfs")
    con.sql("""
        CREATE SECRET s3_creds (
            TYPE S3,
            PROVIDER CREDENTIAL_CHAIN
        )
    """)

    # Query 1 — distinct users
    print("=" * 60)
    print("Query 1: Distinct users")
    print("=" * 60)
    result = con.sql(f"SELECT COUNT(DISTINCT user_id) AS distinct_users FROM read_parquet('{glob}')")
    result.show()

    # Query 2 — accounts per user distribution
    print()
    print("=" * 60)
    print("Query 2: Accounts per user — distribution + top 5")
    print("=" * 60)
    dist = con.sql(f"""
        WITH accounts_per_user AS (
            SELECT user_id, COUNT(DISTINCT account_id) AS num_accounts
            FROM read_parquet('{glob}')
            GROUP BY user_id
        )
        SELECT
            MIN(num_accounts) AS min_accounts,
            MAX(num_accounts) AS max_accounts,
            ROUND(AVG(num_accounts), 2) AS avg_accounts
        FROM accounts_per_user
    """)
    print("Distribution:")
    dist.show()
    top5 = con.sql(f"""
        SELECT user_id, COUNT(DISTINCT account_id) AS num_accounts
        FROM read_parquet('{glob}')
        GROUP BY user_id
        ORDER BY num_accounts DESC
        LIMIT 5
    """)
    print("Top 5 users by account count:")
    top5.show()

    # Query 3 — overall amount statistics
    print()
    print("=" * 60)
    print("Query 3: Overall amount statistics")
    print("=" * 60)
    result = con.sql(f"""
        SELECT
            ROUND(MIN(amount), 2) AS min_amount,
            ROUND(MAX(amount), 2) AS max_amount,
            ROUND(AVG(amount), 2) AS avg_amount
        FROM read_parquet('{glob}')
    """)
    result.show()

    # Query 4 — amount statistics per month
    print()
    print("=" * 60)
    print("Query 4: Amount statistics per year/month (chronological)")
    print("=" * 60)
    result = con.sql(f"""
        SELECT
            year,
            month,
            ROUND(MIN(amount), 2) AS min_amount,
            ROUND(MAX(amount), 2) AS max_amount,
            ROUND(AVG(amount), 2) AS avg_amount
        FROM read_parquet('{glob}', hive_partitioning = true)
        GROUP BY year, month
        ORDER BY year ASC, month ASC
    """)
    result.show()


if __name__ == "__main__":
    main()
