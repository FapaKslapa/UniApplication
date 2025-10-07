FROM node:20-alpine

# Installa Chromium e le dipendenze necessarie per Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Indica a Puppeteer di usare il Chromium installato
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app
COPY package.json package-lock.json ./
COPY next.config.ts tsconfig.json ./
RUN npm ci
COPY app ./app
COPY lib ./lib
COPY server ./server
COPY tailwind.config.ts ./
COPY components.json ./
RUN npm run build
RUN npm prune --omit=dev
EXPOSE 3001
ENV PORT=3001
CMD ["npm", "start"]


# docker build -t uniapplication .
# docker run -d -p 3001:3001 --restart unless-stopped --name uniapplication uniapplication:latest