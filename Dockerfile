FROM php:7.2-apache
RUN apt-get update && apt-get install -y --no-install-recommends libxml++2.6-dev \
    zlib1g-dev libicu-dev g++ libssl-dev \
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

WORKDIR /var/www/html

COPY ./src /var/www/html

COPY ./conf /etc/apache2/sites-enabled/

RUN /usr/sbin/a2ensite default-ssl
RUN /usr/sbin/a2enmod ssl

EXPOSE 80
EXPOSE 443

CMD chown www-data:www-data -R /var/www/html/storage \
    && chown www-data:www-data -R /var/www/html/bootstrap \
    && php artisan migrate && apache2-foreground