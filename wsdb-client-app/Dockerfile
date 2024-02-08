FROM node:20-slim as build

ENV CI=true

WORKDIR /opt/app

COPY package*.json ./

RUN npm ci --ignore-scripts --no-progress

COPY . .
RUN npm run build


FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Copy config nginx
COPY --from=build /opt/app/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Remove default nginx static assets
RUN rm -rf ./*

COPY --from=build /opt/app/dist ./

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]