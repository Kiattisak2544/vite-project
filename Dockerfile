# 1. Build stage
FROM node:20-alpine AS build

WORKDIR /src

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# 2. Serve stage (nginx)
FROM nginx:alpine

COPY --from=build /src/dist /usr/share/nginx/html

# รองรับ React Router (กัน refresh แล้ว 404)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

