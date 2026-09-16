"""Client MinIO (S3-compatible), via boto3."""

from __future__ import annotations

import json
from typing import Any

import boto3

from config import MINIO_ACCESS_KEY, MINIO_BUCKET, MINIO_ENDPOINT, MINIO_SECRET_KEY


def get_client():
    return boto3.client(
        "s3",
        endpoint_url=MINIO_ENDPOINT,
        aws_access_key_id=MINIO_ACCESS_KEY,
        aws_secret_access_key=MINIO_SECRET_KEY,
    )


def upload_json(key: str, data: Any, bucket: str = MINIO_BUCKET) -> str:
    client = get_client()
    client.put_object(Bucket=bucket, Key=key, Body=json.dumps(data).encode("utf-8"))
    return key
