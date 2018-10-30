FROM node:9-alpine
LABEL maintainer="Dash Developers <evodevs@dash.org>"
LABEL description="Dockerised Dash.org Rate Etc API"

WORKDIR /app
COPY . /app

RUN npm i npm@latest -g

RUN npm install --quiet

CMD ["/usr/local/bin/node", "Server.js"]
