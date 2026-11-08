FROM node:20 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

FROM node:20-slim

WORKDIR /app

COPY --from=build /app .

EXPOSE 5678

CMD ["npm", "start"]
