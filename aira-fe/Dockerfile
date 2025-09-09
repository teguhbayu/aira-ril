FROM node:22-alpine

WORKDIR /app

COPY package* .

RUN npm install --force

COPY . .

RUN npm run build

CMD ["npm", "start"]