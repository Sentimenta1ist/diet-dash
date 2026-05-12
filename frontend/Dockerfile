# Stage 1: Build the application
FROM node:18 AS build

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package.json package-lock.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь исходный код
COPY . .

# Allow overriding API URL at build time (default: /api for production reverse-proxy)
ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Собираем проект
RUN npm run build

# Stage 2: Serve the build app
FROM nginx:alpine

# Копируем собранный проект в директорию для NGINX
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем 80 порт
EXPOSE 80

# Запускаем NGINX
CMD ["nginx", "-g", "daemon off;"]