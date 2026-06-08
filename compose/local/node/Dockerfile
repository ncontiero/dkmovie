FROM docker.io/node:24.16.0-bookworm-slim@sha256:242549cd46785b480c832479a730f4f2a20865d61ea2e404fdb2a5c3d3b73ecf

ARG APP_HOME=/app
WORKDIR ${APP_HOME}

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

COPY ./package.json ./pnpm-lock.yaml* ./pnpm-workspace.yaml* ${APP_HOME}
COPY ./emails/package.json ${APP_HOME}/emails/

RUN pnpm install

ENV PATH="${APP_HOME}/node_modules/.bin/:$PATH"

RUN chown node:node /app

USER node
