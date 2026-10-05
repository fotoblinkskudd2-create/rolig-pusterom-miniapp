# Pusterom som statisk side bak nginx. Kjører som ikke-root (uid 101), port 8080.
FROM nginxinc/nginx-unprivileged:1.27-alpine

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --chown=101:101 index.html systemrom.html isolation-mirror.html tokens.css \
     manifest.webmanifest icon.svg sw.js /usr/share/nginx/html/

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
