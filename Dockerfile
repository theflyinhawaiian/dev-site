# ---------- base ----------
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# ---------- dev ----------
FROM base AS dev
RUN npm install
COPY . .
EXPOSE 5173 3001
CMD ["npm", "run", "dev:full"]

# ---------- build ----------
FROM base AS build
RUN npm install
COPY . .
RUN npm run build

# ---------- prod ----------
FROM node:20-alpine AS prod
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
RUN npm install --omit=dev
EXPOSE 5173
CMD ["node", "dist/index.js"]
