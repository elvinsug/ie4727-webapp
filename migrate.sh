#!/bin/bash

MIGRATIONS_DIR="./backend/migrations"
MYSQL_BIN="/opt/lampp/bin/mysql"
DB_NAME="${DB_NAME:-miona_app}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-}"

echo "Running migrations for database: $DB_NAME"

if [ -z "$DB_PASSWORD" ]; then
    $MYSQL_BIN -u $DB_USER -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
else
    $MYSQL_BIN -u $DB_USER -p$DB_PASSWORD -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
fi

for migration in $MIGRATIONS_DIR/*.sql; do
    if [ -f "$migration" ]; then
        echo "Applying migration: $(basename $migration)"
        if [ -z "$DB_PASSWORD" ]; then
            $MYSQL_BIN -u $DB_USER $DB_NAME < "$migration"
        else
            $MYSQL_BIN -u $DB_USER -p$DB_PASSWORD $DB_NAME < "$migration"
        fi

        if [ $? -eq 0 ]; then
            echo "✓ Successfully applied: $(basename $migration)"
        else
            echo "✗ Failed to apply: $(basename $migration)"
            exit 1
        fi
    fi
done

echo "All migrations completed successfully!"
