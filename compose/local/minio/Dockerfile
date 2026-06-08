FROM minio/mc:latest@sha256:a7fe349ef4bd8521fb8497f55c6042871b2ae640607cf99d9bede5e9bdf11727

COPY ./compose/local/minio/create_bucket.sh /usr/bin/create_bucket.sh
RUN chmod +x /usr/bin/create_bucket.sh

ENTRYPOINT ["/usr/bin/create_bucket.sh"]
