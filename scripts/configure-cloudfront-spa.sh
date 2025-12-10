#!/bin/bash

# Script to configure CloudFront for SPA routing
# This sets up custom error responses to serve index.html for 404/403 errors
# Usage: ./scripts/configure-cloudfront-spa.sh <distribution-id>

DISTRIBUTION_ID=$1

if [ -z "$DISTRIBUTION_ID" ]; then
  echo "Error: Distribution ID is required"
  echo "Usage: ./scripts/configure-cloudfront-spa.sh <distribution-id>"
  exit 1
fi

echo "Configuring CloudFront distribution $DISTRIBUTION_ID for SPA routing..."

# Get current distribution config
aws cloudfront get-distribution-config --id "$DISTRIBUTION_ID" > /tmp/dist-config.json

# Extract ETag (required for updates)
ETAG=$(jq -r '.ETag' /tmp/dist-config.json)

# Get the distribution config
DIST_CONFIG=$(jq -r '.DistributionConfig' /tmp/dist-config.json)

# Check if custom error responses already exist
HAS_404=$(echo "$DIST_CONFIG" | jq '.CustomErrorResponses.Items[] | select(.ErrorCode == 404)')
HAS_403=$(echo "$DIST_CONFIG" | jq '.CustomErrorResponses.Items[] | select(.ErrorCode == 403)')

# Create updated config with SPA routing
if [ -z "$HAS_404" ] || [ -z "$HAS_403" ]; then
  echo "Adding custom error responses for SPA routing..."
  
  # Add custom error responses
  UPDATED_CONFIG=$(echo "$DIST_CONFIG" | jq '
    .CustomErrorResponses.Quantity = 2 |
    .CustomErrorResponses.Items = [
      {
        "ErrorCode": 403,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      },
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  ')
  
  # Update distribution
  echo "$UPDATED_CONFIG" > /tmp/updated-config.json
  aws cloudfront update-distribution \
    --id "$DISTRIBUTION_ID" \
    --if-match "$ETAG" \
    --distribution-config file:///tmp/updated-config.json
  
  echo "CloudFront distribution updated. Changes may take 15-20 minutes to propagate."
else
  echo "Custom error responses already configured."
fi

# Cleanup
rm -f /tmp/dist-config.json /tmp/updated-config.json
