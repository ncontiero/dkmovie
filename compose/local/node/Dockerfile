FROM docker.io/node:24.16.0-bookworm-slim@sha256:2c87ef9bd3c6a3bd4b472b4bec2ce9d16354b0c574f736c476489d09f560a203

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
