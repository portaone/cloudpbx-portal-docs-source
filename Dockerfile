### STAGE 1: Build ###
FROM node:22.8.0 AS build
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN chmod +x scripts/prebuild.sh
RUN scripts/prebuild.sh
RUN npm run build
### STAGE 2: Run ###
FROM nginx:mainline-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/build /usr/share/nginx/html
COPY --from=build /usr/src/app/scripts/init_container.sh /
RUN apk add bash

CMD ["bash", "init_container.sh"]
