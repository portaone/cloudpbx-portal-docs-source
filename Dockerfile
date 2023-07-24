### STAGE 1: Build ###
FROM node:16.20.0 AS build
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN chmod +x scripts/prebuild.sh
RUN scripts/prebuild.sh
RUN npm run build
### STAGE 2: Run ###
FROM nginx
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/build /usr/share/nginx/html
COPY --from=build /usr/src/app/scripts/init_container.sh /

CMD ["bash", "init_container.sh"]
