FROM node:22

WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm install

# Copy rest of the app
COPY . .

# Vite dev server port
EXPOSE 5173

# Run Vite dev server in Docker
CMD ["npm", "run", "dev", "--", "--host"]
