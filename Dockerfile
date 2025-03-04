FROM node:22

WORKDIR /app

COPY package*.json ./

COPY . .
RUN npm install
RUN npm run build

EXPOSE 3006

CMD ["sh", "-c", "npm run start"]
