FROM node:20-slim
RUN apt-get update && apt-get install -y chromium fonts-noto fonts-noto-color-emoji --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*
ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    DATA_PATH=/data
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY . .
CMD ["node", "index.js"]
