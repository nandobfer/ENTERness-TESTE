FROM node:22 AS build

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install --ignore-scripts
COPY . .
RUN npx prisma generate
RUN npm run build
RUN npm prune --production

FROM node:22

WORKDIR /app
COPY package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

CMD ["/bin/bash", "-c", "npx prisma migrate deploy && npm run start:prod"]
