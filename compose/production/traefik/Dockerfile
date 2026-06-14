FROM docker.io/traefik:v3.7.5@sha256:d6858791f9e74df44ca4014166647c41cdc2abd3bf2a71b832ca4e1c6a91b257
RUN mkdir -p /etc/traefik/acme \
  && touch /etc/traefik/acme/acme.json \
  && chmod 600 /etc/traefik/acme/acme.json
COPY ./compose/production/traefik/traefik.yml /etc/traefik
