FROM node:22 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install --ignore-scripts
COPY . .
RUN npm run build
RUN npm prune --production

FROM node:22

WORKDIR /app
COPY package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

CMD ["/bin/bash", "-c", "npm run start:prod"]
