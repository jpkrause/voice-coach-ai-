FROM node:18-slim

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
# Need to install patch-package dev dep or use --production=false if checking prune
RUN npm install

# Copy source
COPY . .

# Expose port (Vite default is 5173)
EXPOSE 5173

# Run dev server
CMD ["npm", "run", "dev", "--", "--host"]
