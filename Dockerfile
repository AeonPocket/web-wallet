FROM php:7.2-apache
RUN apt-get update && apt-get install -y --no-install-recommends libxml++2.6-dev \
    && docker-php-ext-install -j "$(nproc)" mbstring pdo tokenizer xml zip \
    && a2enmod rewrite

RUN curl -sS 'https://getcomposer.org/installer' | php \
    && mv composer.phar /usr/local/bin/composer

WORKDIR /var/www/html