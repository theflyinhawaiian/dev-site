#!/bin/bash

# Read password from secret file if using Docker secrets
if [ -f "$MYSQL_ROOT_PASSWORD_FILE" ]; then
    ROOT_PASSWORD=$(cat "$MYSQL_ROOT_PASSWORD_FILE")
else
    ROOT_PASSWORD="$MYSQL_ROOT_PASSWORD"
fi

docker-entrypoint.sh mysqld &
MYSQL_PID=$!

# Wait for MySQL AND the database to be ready (not just the temp init server)
echo "Waiting for MySQL and database to be ready..."
while true; do
    if mysql -u root -p"$ROOT_PASSWORD" "$MYSQL_DATABASE" -e "SELECT 1" &>/dev/null; then
        # Wait and check again to ensure we're past the temporary server phase
        sleep 2
        if mysql -u root -p"$ROOT_PASSWORD" "$MYSQL_DATABASE" -e "SELECT 1" &>/dev/null; then
            break
        fi
    fi
    sleep 1
done
echo "MySQL is ready."

MIGRATIONS_DIR="/migrations"
MIGRATIONS_TABLE="schema_migrations"

mysql_run() {
    mysql -u root -p"$ROOT_PASSWORD" "$MYSQL_DATABASE" "$@"
}

# Create migrations tracking table if it doesn't exist
mysql_run -e "
CREATE TABLE IF NOT EXISTS $MIGRATIONS_TABLE (
    id INT NOT NULL AUTO_INCREMENT,
    filename VARCHAR(255) NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE (filename)
);
"

# Run each migration file if not already applied
for migration in "$MIGRATIONS_DIR"/*.sql; do
    if [ -f "$migration" ]; then
        filename=$(basename "$migration")

        # Check if migration has already been applied
        already_applied=$(mysql_run -N -e "SELECT COUNT(*) FROM $MIGRATIONS_TABLE WHERE filename = '$filename';")

        if [ "$already_applied" -eq 0 ]; then
            echo "Applying migration: $filename"
            mysql_run < "$migration"
            mysql_run -e "INSERT INTO $MIGRATIONS_TABLE (filename) VALUES ('$filename');"
            echo "Migration applied: $filename"
        else
            echo "Skipping already applied migration: $filename"
        fi
    fi
done

echo "All migrations complete."

# Bring MySQL back to foreground
wait $MYSQL_PID
