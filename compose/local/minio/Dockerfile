FROM docker.io/pgsty/mc:latest@sha256:ce62c9053c69ce12a527a322345b5ad9f44b5f8a7b8189f82e516f2e3f30f1d8

COPY ./compose/local/minio/create_bucket.sh /usr/bin/create_bucket.sh
RUN chmod +x /usr/bin/create_bucket.sh

ENTRYPOINT ["/usr/bin/create_bucket.sh"]
