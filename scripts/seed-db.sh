#!/bin/bash
set -e

echo "Seeding Company OS database..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -z "$DATABASE_URL" ]; then
  if command -v psql &> /dev/null; then
    echo "DATABASE_URL not set. Attempting local PostgreSQL..."
    psql -U postgres -d company_os -f "$SCRIPT_DIR/../database/seed.sql"
  else
    echo "Error: DATABASE_URL not set and psql not found."
    exit 1
  fi
else
  psql "$DATABASE_URL" -f "$SCRIPT_DIR/../database/seed.sql"
fi

echo "Database seeded successfully."
