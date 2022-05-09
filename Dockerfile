# 构建容器
FROM node:12.6.0-alpine as build
WORKDIR /app

COPY package.json .
RUN npm install
COPY . /app
RUN npm run build:prod

# 生产容器
FROM nginx:1.16.0-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
