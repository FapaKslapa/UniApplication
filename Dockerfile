FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json ./
COPY next.config.ts tsconfig.json ./
RUN npm ci --omit=dev
COPY app ./app
COPY tailwind.config.ts ./
RUN npm run build
EXPOSE 3000
ENV PORT=3000
CMD ["npm", "start"]


# docker build -t uniapplication .
# docker run -p 6000:6000 uniapplication
