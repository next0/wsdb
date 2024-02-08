FROM node:20-slim as build

WORKDIR /opt/app

COPY package*.json ./
COPY healthcheck.js ./

RUN npm ci --ignore-scripts --no-progress

COPY . ./
RUN npm run build


FROM node:20-slim

WORKDIR /opt/app

COPY --from=build /opt/app/package*.json ./
COPY --from=build /opt/app/healthcheck.js ./

RUN npm ci --omit=dev --ignore-scripts --no-progress

COPY --from=build /opt/app/dist ./dist

ENV WSDB_PORT 80
ENV WSDB_VERSION "0.0.1"

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=2s --start-period=15s CMD ["node", "./healthcheck.js"]

USER node
CMD ["npm", "start"]
