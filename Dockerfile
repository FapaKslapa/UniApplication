FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json ./
COPY next.config.ts tsconfig.json ./
RUN npm ci
COPY app ./app
COPY lib ./lib
COPY server ./server
COPY tailwind.config.ts ./
RUN npm run build
RUN npm prune --omit=dev
EXPOSE 3001
ENV PORT=3001
CMD ["npm", "start"]


# docker build -t uniapplication .
# docker run -d -p 3001:3001 --restart unless-stopped --name uniapplication uniapplication:latest
