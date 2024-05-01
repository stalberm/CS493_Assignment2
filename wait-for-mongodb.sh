#!/bin/bash


MONGODB_HOST="database"
MONGODB_PORT="27017"

# Maximum number of retries
MAX_RETRIES=30

# Delay between retries (in seconds)
RETRY_DELAY=5

# Counter for retries
RETRIES=0

# Function to check MongoDB availability
check_mongodb() {
    curl -sSf "http://$MONGODB_HOST:$MONGODB_PORT" >/dev/null
}

# Loop until MongoDB is available or maximum retries reached
until check_mongodb || [ $RETRIES -eq $MAX_RETRIES ]; do
    >&2 echo "MongoDB is unavailable - waiting..."
    sleep $RETRY_DELAY
    ((RETRIES++))
done

if [ $RETRIES -eq $MAX_RETRIES ]; then
    >&2 echo "MongoDB connection timed out"
    exit 1
fi

>&2 echo "MongoDB is available - starting application"

$*

>&2 echo "All done"

