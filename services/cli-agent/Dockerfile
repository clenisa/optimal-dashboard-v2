# The CLI agent is intended to be run locally, but a Dockerfile can be used for containerized execution.
FROM node:18-alpine
WORKDIR /app
COPY . .
# RUN npm install
ENTRYPOINT ["node", "src/index.js"]
