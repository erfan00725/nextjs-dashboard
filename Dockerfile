# Use official Node.js image as a base
FROM node:18-alpine


# Enable corepack and install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set the working directory in the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the Next.js app
# RUN pnpm run build


# Expose the port Next.js will run on
EXPOSE 3000

# Start the Next.js application
# CMD ["npm", "run", "start"]

ENV NODE_ENV=development

CMD ["pnpm", "dev"]