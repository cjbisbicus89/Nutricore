FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
# Forzamos la instalación saltando los conflictos de NestJS 10/11
RUN npm install --legacy-peer-deps
COPY . .
# Saltamos el build por ahora para ver si arranca directo
EXPOSE 3000
CMD ["npm", "run", "start:dev"]