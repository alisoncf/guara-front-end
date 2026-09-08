# ---- Build ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx quasar build

# ---- Runtime ----
FROM nginx:1.27-alpine AS runtime

# A imagem oficial do Nginx processa automaticamente, antes de subir,
# qualquer *.template em /etc/nginx/templates/ com envsubst, usando as
# variáveis de ambiente do container (e gera o .conf final em
# /etc/nginx/conf.d/) - por isso não precisamos de um entrypoint próprio.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

COPY --from=build /app/dist/spa /usr/share/nginx/html

EXPOSE 80
