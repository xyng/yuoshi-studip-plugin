FROM node:12-alpine3.9

# copy composer binary
COPY --from=composer /usr/bin/composer /usr/bin/composer

RUN apk add php7 php7-phar php7-json php7-mbstring php7-openssl php7-ctype php7-dom zip make

WORKDIR /yuoshi_build
