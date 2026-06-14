FROM docker.io/postgres:18@sha256:29ee7bb30d804447dc9a91fd0d74322ae1dc3a4072cc6346f70a5ed6e783b565

COPY ./compose/production/postgres/maintenance /usr/local/bin/maintenance
RUN chmod +x /usr/local/bin/maintenance/*
RUN mv /usr/local/bin/maintenance/* /usr/local/bin \
  && rmdir /usr/local/bin/maintenance
