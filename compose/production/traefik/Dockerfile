FROM docker.io/traefik:v3.7.14@sha256:575fa15b135078fe5e50aa847987d96dbddd7b093c172429618404df73f3fa7c
RUN mkdir -p /etc/traefik/acme \
  && touch /etc/traefik/acme/acme.json \
  && chmod 600 /etc/traefik/acme/acme.json
COPY ./compose/production/traefik/traefik.yml /etc/traefik
