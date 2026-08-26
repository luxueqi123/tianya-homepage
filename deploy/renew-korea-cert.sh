#!/bin/sh
set -eu

docker run --rm \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /opt/tianya-homepage/acme:/var/www/acme \
  certbot/certbot:v5.7.0 renew \
  --cert-name my.tianyaguanxue.com \
  --webroot -w /var/www/acme \
  --agree-tos \
  --no-random-sleep-on-renew \
  --quiet

docker exec tianya-homepage-nginx nginx -t
docker exec tianya-homepage-nginx nginx -s reload
