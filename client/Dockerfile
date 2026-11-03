
# Stage 1: Build React application
FROM node:22-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Production runtime
FROM node:22-alpine AS runtime

WORKDIR /app
RUN npm install -g serve
COPY --from=build --chown=node:node /app/dist ./dist
ENV NODE_ENV=production
USER node

CMD ["serve", "-s", "dist", "-l", "3000", "-n"]