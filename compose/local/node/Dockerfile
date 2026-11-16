FROM docker.io/node:26.13.1-bookworm-slim@sha256:5df79989ed685e09f0a98019db4cebfb22fb9df1a53c0161664a011f7ff6b0f1

ARG APP_HOME=/app
WORKDIR ${APP_HOME}

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

COPY --from=ghcr.io/pnpm/pnpm:12@sha256:168feba88e6a1684c99a62cbf4fe361d4e683e2a6c920d3b0acde7e15a28b62d /opt/pnpm /opt/pnpm
RUN for bin in pnpm pn pnpx pnx; do ln -s "/opt/pnpm/$bin" "/usr/local/bin/$bin"; done

COPY ./package.json ./pnpm-lock.yaml* ./pnpm-workspace.yaml* ${APP_HOME}
COPY ./emails/package.json ${APP_HOME}/emails/

RUN pnpm install

ENV PATH="${APP_HOME}/node_modules/.bin/:$PATH"

RUN mkdir -p "${PNPM_HOME}" && chown -R node:node "${PNPM_HOME}" /app

USER node
