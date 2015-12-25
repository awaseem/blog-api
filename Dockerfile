FROM node:5.3-slim

RUN mkdir src/

COPY . /src

RUN cd /src; npm install

ENV NODE_ENV production

expose 8080

CMD ["node", "/src/test.js"]
