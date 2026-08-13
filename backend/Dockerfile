FROM node:20-slim

# Install OpenSSL for Prisma and other necessary build tools
RUN apt-get update -y && apt-get install -y openssl procps

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose port (assuming 5000 based on standard Express)
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
