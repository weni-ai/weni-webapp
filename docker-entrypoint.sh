#!/bin/sh

if [ ! -f /usr/share/nginx/html/connect/config.js ] ; then
	envsubst < /usr/share/nginx/html/connect/config.js.tmpl > /usr/share/nginx/html/connect/config.js
fi

exec "$@"
