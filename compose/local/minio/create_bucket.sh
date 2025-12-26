#!/bin/sh

sleep 10

mc alias set myminio http://minio:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD"

if ! mc ls myminio/"$MINIO_BUCKET_NAME"; then
  mc mb myminio/"$MINIO_BUCKET_NAME"
  mc anonymous set public myminio/"$MINIO_BUCKET_NAME"
  echo "Bucket '$MINIO_BUCKET_NAME' created and set to public."
else
  echo "Bucket '$MINIO_BUCKET_NAME' already exists."
fi

exit 0
