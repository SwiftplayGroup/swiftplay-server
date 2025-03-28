FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx tsc  # Compile TypeScript

EXPOSE 8000

CMD ["node", "dist/app.js"]
