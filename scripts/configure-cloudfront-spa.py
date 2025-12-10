#!/usr/bin/env python3
"""
Configure CloudFront distribution for SPA routing.
This script sets up custom error responses to serve index.html for 404/403 errors.
Usage: python3 scripts/configure-cloudfront-spa.py <distribution-id>
"""

import sys
import json
import boto3
from botocore.exceptions import ClientError

def configure_cloudfront_spa(distribution_id):
    """Configure CloudFront for SPA routing."""
    cloudfront = boto3.client('cloudfront')
    
    try:
        # Get current distribution config
        print(f"Fetching CloudFront distribution config for {distribution_id}...")
        response = cloudfront.get_distribution_config(Id=distribution_id)
        
        etag = response['ETag']
        config = response['DistributionConfig']
        
        # Check if custom error responses already exist
        existing_errors = config.get('CustomErrorResponses', {}).get('Items', [])
        has_404 = any(err.get('ErrorCode') == 404 for err in existing_errors)
        has_403 = any(err.get('ErrorCode') == 403 for err in existing_errors)
        
        if has_404 and has_403:
            print("Custom error responses already configured.")
            return
        
        # Create custom error responses
        custom_errors = [
            {
                'ErrorCode': 403,
                'ResponsePagePath': '/index.html',
                'ResponseCode': '200',
                'ErrorCachingMinTTL': 300
            },
            {
                'ErrorCode': 404,
                'ResponsePagePath': '/index.html',
                'ResponseCode': '200',
                'ErrorCachingMinTTL': 300
            }
        ]
        
        # Update config
        config['CustomErrorResponses'] = {
            'Quantity': 2,
            'Items': custom_errors
        }
        
        # Update distribution
        print("Updating CloudFront distribution...")
        cloudfront.update_distribution(
            Id=distribution_id,
            IfMatch=etag,
            DistributionConfig=config
        )
        
        print("✅ CloudFront distribution updated successfully!")
        print("⚠️  Note: Changes may take 15-20 minutes to propagate.")
        
    except ClientError as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python3 scripts/configure-cloudfront-spa.py <distribution-id>")
        sys.exit(1)
    
    distribution_id = sys.argv[1]
    configure_cloudfront_spa(distribution_id)
