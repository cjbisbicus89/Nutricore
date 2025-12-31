FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
# Instalamos dependencias incluyendo las de sockets y gráficas
RUN npm install
COPY . .
EXPOSE 5173
# Vite necesita este flag para funcionar dentro de Docker
CMD ["npm", "run", "dev", "--", "--host"]