#!/bin/bash

# Get current timestamp
NOW=$(date +%s)
EXP=$((NOW + 3600))  # 1 hour from now

# Create the JWT header
HEADER='{"alg":"RS256","typ":"JWT"}'
HEADER_BASE64=$(echo -n "$HEADER" | base64 | tr -d '=' | tr '/+' '_-')

# Create the JWT payload
PAYLOAD="{\"iss\":\"system-user-1\",\"sub\":\"system-user-1\",\"aud\":\"http://localhost:8080\",\"iat\":$NOW,\"exp\":$EXP}"
PAYLOAD_BASE64=$(echo -n "$PAYLOAD" | base64 | tr -d '=' | tr '/+' '_-')

# Create the signature
SIGNATURE=$(echo -n "$HEADER_BASE64.$PAYLOAD_BASE64" | openssl dgst -sha256 -sign system-user-1.pem | base64 | tr -d '=' | tr '/+' '_-')

# Combine all parts
JWT="$HEADER_BASE64.$PAYLOAD_BASE64.$SIGNATURE"

echo "$JWT" 