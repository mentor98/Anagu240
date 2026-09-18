# Anagu — NGINX reverse proxy
# Copies the nginx.conf into the official nginx:alpine image.
# Build and run via docker-compose (see docker-compose.override.yml).

FROM nginx:alpine

# Remove the default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom config
COPY nginx.conf /etc/nginx/nginx.conf

# Expose ports
EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
