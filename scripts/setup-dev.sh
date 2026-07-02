#!/bin/bash
set -e

echo "Setting up Company OS development environment..."

# Backend setup
echo "Setting up backend..."
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements/dev.txt
cp .env.example .env

# Frontend setup
echo "Setting up frontend..."
cd ../frontend
npm install
cp .env.example .env

# Docker setup
echo "Starting services..."
cd ../docker
docker-compose up -d db redis

echo "Running migrations..."
cd ../backend
alembic upgrade head

echo "Seeding database..."
cd ../database
psql $DATABASE_URL -f seed.sql

echo "Done! Run 'docker-compose up' to start all services."
