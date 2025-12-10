FROM node:22

WORKDIR /app

COPY package.json package-lock.json* yarn.lock* ./
RUN npm install || true

COPY . /app/

EXPOSE 3000
