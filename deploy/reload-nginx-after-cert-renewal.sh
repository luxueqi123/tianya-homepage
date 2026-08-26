#!/bin/sh
set -eu

if docker exec tianya-carpool-nginx nginx -t >/dev/null 2>&1; then
    docker exec tianya-carpool-nginx nginx -s reload
fi
