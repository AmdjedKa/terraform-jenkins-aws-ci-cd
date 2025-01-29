FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps support
RUN npm install --legacy-peer-deps --force && \
    npm cache clean --force

# Install psql client
RUN apk update && apk add postgresql-client

# Copy source code
COPY . .

# Expose port
EXPOSE 3002

# Wait for PostgreSQL script
COPY wait-for-postgres.sh /wait-for-postgres.sh
RUN chmod +x /wait-for-postgres.sh

# Start command
CMD ["npm", "start"]
