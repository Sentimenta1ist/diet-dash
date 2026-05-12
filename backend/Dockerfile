FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json .
# Copy CSV data file for the /api/products/fill endpoint
COPY data/ ./data/
EXPOSE 5000
CMD ["node", "dist/index.js"]
