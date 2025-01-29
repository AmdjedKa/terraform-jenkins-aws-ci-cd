FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Install psql client
RUN apk update && apk add postgresql-client

# Copy source code
COPY . .

# Expose port
EXPOSE 3003

# Wait for PostgreSQL script
COPY wait-for-postgres.sh /wait-for-postgres.sh
RUN chmod +x /wait-for-postgres.sh

# Start command
CMD ["/wait-for-postgres.sh", "npm", "start"]
