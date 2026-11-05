FROM docker.io/node:26.12.1-bookworm-slim@sha256:88e480776c6149ff1d098cd304f44bf18057fb5d284a3329b78162d29821e28c

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
