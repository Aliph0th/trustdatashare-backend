FROM node:23-alpine
ARG PORT
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

RUN chown node:node /app

COPY --chown=node:node package.json pnpm-lock.yaml ./
RUN pnpm i --frozen-lockfile
RUN pnpm approve-builds

COPY --chown=node:node . .


RUN npx prisma migrate deploy && \
    npx prisma generate && \
    npx prisma generate --sql && \
    pnpm run build
USER node

EXPOSE $PORT

CMD ["pnpm", "run", "start:prod"]
