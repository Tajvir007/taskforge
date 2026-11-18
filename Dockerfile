
# 1. Select the base image
FROM node:20-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package files first
COPY package*.json ./

# 4. Install production dependencies
RUN npm ci --omit=dev

# 5. Copy the application source code
COPY --chown=node:node . .

# 6. Set application environment
ENV NODE_ENV=production

# 7. Document the application port
EXPOSE 3000

# 8. Run the application as a non-root user
USER node

# 9. Start the application
CMD ["npm", "start"]
