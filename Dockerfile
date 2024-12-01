FROM node:22 AS build

WORKDIR /app
COPY package*.json ./
RUN yarn install
COPY . .
RUN npx prisma generate
RUN yarn build

FROM node:22

WORKDIR /app
COPY package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

CMD ["yarn", "start:prod"]
