FROM node:16

# RUN curl -fsSL https://get.pnpm.io/install.sh | bash -
RUN npm install -g pnpm

RUN mkdir -p /app

WORKDIR /app

COPY package.json .
COPY pnpm-lock.yaml .
RUN pnpm install

# 4. Copy the source code to /app dir
COPY . .

# 5. Expose port 3000 on the container
EXPOSE 3001
# 6. Run the app
CMD ["pnpm", "dev"]
