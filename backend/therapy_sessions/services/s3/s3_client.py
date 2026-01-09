import boto3
from django.conf import settings

def s3_client():
    return boto3.client(
        "s3",
        region_name=getattr(settings, "AWS_S3_REGION_NAME", None),
    )

def s3_bucket():
    return settings.AWS_STORAGE_BUCKET_NAME