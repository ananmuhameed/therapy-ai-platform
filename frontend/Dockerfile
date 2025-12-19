FROM node:20-bookworm-slim

WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm install --include=optional

# Copy rest of the app
COPY . .

# Vite dev server port
EXPOSE 5173

# Run Vite dev server in Docker
CMD ["npm", "run", "dev", "--", "--host" ,"0.0.0.0"]
