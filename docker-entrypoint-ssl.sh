#!/bin/sh
set -e

DOMAIN=app.whatdis.nl
LIVE_DIR=/etc/letsencrypt/live/$DOMAIN

if [ ! -s "$LIVE_DIR/fullchain.pem" ] || [ ! -s "$LIVE_DIR/privkey.pem" ]; then
    echo "No Let's Encrypt cert found for $DOMAIN — generating self-signed bootstrap cert."
    mkdir -p "$LIVE_DIR"
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
        -keyout "$LIVE_DIR/privkey.pem" \
        -out    "$LIVE_DIR/fullchain.pem" \
        -subj "/CN=$DOMAIN"
fi

exec /docker-entrypoint.sh "$@"
