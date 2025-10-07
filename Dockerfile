FROM node:20-alpine

# Installa tzdata per supportare i fusi orari e imposta TZ a Europe/Rome
RUN apk add --no-cache tzdata
ENV TZ=Europe/Rome

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

# Copia i file di configurazione del package
COPY package.json package-lock.json ./

# Copia TUTTI i file di configurazione necessari
COPY next.config.ts tsconfig.json ./
COPY tailwind.config.ts postcss.config.mjs ./
COPY components.json biome.json ./

# Installa le dipendenze
RUN npm ci

# Copia il codice sorgente
COPY app ./app
COPY lib ./lib
COPY server ./server

# Build dell'applicazione
RUN npm run build

# Rimuovi le dipendenze di sviluppo
RUN npm prune --omit=dev

EXPOSE 3001
ENV PORT=3001
CMD ["npm", "start"]


# docker build -t uniapplication .
# docker run -d -p 3001:3001 --restart unless-stopped --name uniapplication uniapplication:latest