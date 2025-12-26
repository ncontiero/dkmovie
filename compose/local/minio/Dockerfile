FROM minio/mc:latest

COPY ./compose/local/minio/create_bucket.sh /usr/bin/create_bucket.sh
RUN chmod +x /usr/bin/create_bucket.sh

ENTRYPOINT ["/usr/bin/create_bucket.sh"]
