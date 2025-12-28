#!/bin/sh

sleep 10

mc alias set myminio http://minio:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD"

if ! mc ls myminio/"$PUBLIC_BUCKET_NAME"; then
  mc mb myminio/"$PUBLIC_BUCKET_NAME"
  mc anonymous set download myminio/"$PUBLIC_BUCKET_NAME"
  echo "Bucket '$PUBLIC_BUCKET_NAME' created and set to public download."
else
  echo "Bucket '$PUBLIC_BUCKET_NAME' already exists."
fi

if ! mc ls myminio/"$PRIVATE_BUCKET_NAME"; then
  mc mb myminio/"$PRIVATE_BUCKET_NAME"
  mc anonymous set none myminio/"$PRIVATE_BUCKET_NAME"
  echo "Bucket '$PRIVATE_BUCKET_NAME' created and set to private."
else
  echo "Bucket '$PRIVATE_BUCKET_NAME' already exists."
fi

exit 0
