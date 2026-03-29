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


def load_sql(name: str, bucket: str) -> str:
    path = os.path.join(os.path.dirname(__file__), "duckdb", name)
    with open(path) as f:
        return f.read().format(bucket=bucket)


def main() -> None:
    bucket = os.environ.get("BUCKET_NAME")
    if not bucket:
        print("Error: BUCKET_NAME environment variable is not set.", file=sys.stderr)
        print("Usage: BUCKET_NAME=<bucket> python queries/duckdb.py", file=sys.stderr)
        sys.exit(1)

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
    con.sql(load_sql("01_distinct_users.sql", bucket)).show()

    # Query 2 — accounts per user distribution
    print()
    print("=" * 60)
    print("Query 2: Accounts per user — distribution + top 5")
    print("=" * 60)
    sql2 = load_sql("02_accounts_per_user.sql", bucket)
    stmt1, stmt2 = [s.strip() for s in sql2.split(";") if s.strip()]
    print("Distribution:")
    con.sql(stmt1).show()
    print("Top 5 users by account count:")
    con.sql(stmt2).show()

    # Query 3 — overall amount statistics
    print()
    print("=" * 60)
    print("Query 3: Overall amount statistics")
    print("=" * 60)
    con.sql(load_sql("03_amount_stats.sql", bucket)).show()

    # Query 4 — amount statistics per month
    print()
    print("=" * 60)
    print("Query 4: Amount statistics per year/month (chronological)")
    print("=" * 60)
    con.sql(load_sql("04_amount_stats_by_month.sql", bucket)).show()

    # Query 5 — archetype spend by category
    print()
    print("=" * 60)
    print("Query 5: Average spend by category × archetype")
    print("=" * 60)
    con.sql(load_sql("05_archetype_spend.sql", bucket)).show()

    # Query 6 — salary-to-spend ratio per user
    print()
    print("=" * 60)
    print("Query 6: Salary-to-spend ratio per user")
    print("=" * 60)
    con.sql(load_sql("06_salary_to_spend_ratio.sql", bucket)).show()

    # Query 7 — seasonal transaction counts
    print()
    print("=" * 60)
    print("Query 7: Transaction counts by month (seasonal pattern)")
    print("=" * 60)
    con.sql(load_sql("07_seasonal_tx_counts.sql", bucket)).show()

    # Query 8 — category spend by month
    print()
    print("=" * 60)
    print("Query 8: Spend by category per month")
    print("=" * 60)
    con.sql(load_sql("08_category_by_month.sql", bucket)).show()

    # Query 9 — recurring vs variable spend
    print()
    print("=" * 60)
    print("Query 9: Recurring vs variable spend per user")
    print("=" * 60)
    con.sql(load_sql("09_recurring_vs_variable.sql", bucket)).show()

    # Query 10 — amount outliers
    print()
    print("=" * 60)
    print("Query 10: Amount outliers by category (p99 tail)")
    print("=" * 60)
    con.sql(load_sql("10_amount_outliers.sql", bucket)).show()


if __name__ == "__main__":
    main()
