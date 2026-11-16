FROM docker.io/node:26.13.1-bookworm-slim@sha256:5df79989ed685e09f0a98019db4cebfb22fb9df1a53c0161664a011f7ff6b0f1

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
