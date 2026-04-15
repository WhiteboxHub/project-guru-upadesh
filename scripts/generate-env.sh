#!/bin/bash

# Generate secure random secrets for environment variables

echo "Generating secure environment variables..."
echo ""

JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
REFRESH_TOKEN_SECRET=$(openssl rand -base64 64 | tr -d '\n')
ENCRYPTION_KEY=$(openssl rand -base64 32 | tr -d '\n')

echo "Add these to your .env file:"
echo ""
echo "JWT_SECRET=$JWT_SECRET"
echo "REFRESH_TOKEN_SECRET=$REFRESH_TOKEN_SECRET"
echo "ENCRYPTION_KEY=$ENCRYPTION_KEY"
echo ""
echo "⚠️  Keep these secrets safe and never commit them to version control!"
