FROM php:7.2-apache
RUN apt-get update && apt-get install -y --no-install-recommends libxml++2.6-dev \
    zlib1g-dev libicu-dev g++ libssl-dev git \
    && pecl install apcu-5.1.5 && \
           docker-php-ext-enable apcu && \
           docker-php-ext-install \
               intl \
               mbstring \
               pdo_mysql \
               zip \
               bcmath \
               opcache \
    && docker-php-ext-install -j "$(nproc)" mbstring pdo tokenizer xml zip \
    && a2enmod rewrite

RUN curl -sS 'https://getcomposer.org/installer' | php \
    && mv composer.phar /usr/local/bin/composer

RUN pecl install mongodb \
    && echo "extension=mongodb.so" > /usr/local/etc/php/conf.d/ext-mongodb.ini

# nvm environment variables
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 4.4.7

# replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# install nvm
# https://github.com/creationix/nvm#install-script
RUN curl --silent -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.2/install.sh | bash

# install node and npm
RUN source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

# add node and npm to path so the commands are available
ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

WORKDIR /var/www/html

COPY ./src /var/www/html

COPY ./conf /etc/apache2/sites-enabled/

RUN /usr/sbin/a2ensite default-ssl
RUN /usr/sbin/a2enmod ssl

ENV COMPOSER_ALLOW_SUPERUSER 1

RUN composer install && npm install --unsafe-perm

WORKDIR /var/www/html

EXPOSE 80
EXPOSE 443

CMD chown www-data:www-data -R /var/www/html/storage \
    && chown www-data:www-data -R /var/www/html/bootstrap \
    && php artisan migrate --force && apache2-foreground