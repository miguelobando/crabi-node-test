# Etapa de construcción
FROM node:18-alpine AS builder

# Instalar yarn
RUN apk add --no-cache yarn

# Crear directorio de la aplicación
WORKDIR /app

# Copiar los archivos de configuración
COPY package.json yarn.lock ./
COPY tsconfig*.json ./

# Instalar dependencias
RUN yarn install --frozen-lockfile

# Copiar el código fuente
COPY . .

# Construir la aplicación
RUN yarn build

# Etapa de producción
FROM node:18-alpine AS production

# Instalar yarn
RUN apk add --no-cache yarn

# Crear directorio de la aplicación
WORKDIR /app
# Copiar los archivos necesarios desde la etapa de construcción
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./

EXPOSE 3000

CMD ["yarn", "start:prod"]