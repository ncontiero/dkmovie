FROM docker.io/traefik:v3.7.3@sha256:25cd7b175a493ea66a40329e23a649b59eda38b7e2a570493bf63fc4d74fd1c1
RUN mkdir -p /etc/traefik/acme \
  && touch /etc/traefik/acme/acme.json \
  && chmod 600 /etc/traefik/acme/acme.json
COPY ./compose/production/traefik/traefik.yml /etc/traefik
