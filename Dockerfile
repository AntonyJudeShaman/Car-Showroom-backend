
FROM node:20-alpine AS base


RUN npm install -g pnpm

ENV PNPM_HOME="/root/.pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN mkdir -p /root/.pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --prod 

FROM base AS dev
RUN pnpm install 

RUN pnpm add -g nodemon

COPY . .

EXPOSE 3000

ENV NODE_ENV=development

CMD ["pnpm","dev"]

FROM base AS production

COPY . .

ENV NODE_ENV=production

CMD ["pnpm", "start"]