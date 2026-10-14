#!/bin/bash
set -e

echo "=========================================="
echo "  Deploy GDevelop to gdevelop.tirskix.space"
echo "=========================================="

# --- Step 1: Find the project directory ---
PROJECT_DIR=""
for dir in /root/GDevelop-master /root/GDevelop /home/*/GDevelop-master /home/*/GDevelop /opt/GDevelop-master /opt/GDevelop /srv/GDevelop-master /srv/GDevelop; do
    if [ -f "$dir/docker-compose.yml" ] && [ -f "$dir/Dockerfile" ]; then
        PROJECT_DIR="$dir"
        break
    fi
done

if [ -z "$PROJECT_DIR" ]; then
    echo "ERROR: Cannot find GDevelop project directory."
    echo "Please run: GDEVELOP_DIR=/path/to/project bash deploy-subdomain.sh"
    echo "Or set GDEVELOP_DIR environment variable."
    if [ -n "$GDEVELOP_DIR" ] && [ -d "$GDEVELOP_DIR" ]; then
        PROJECT_DIR="$GDEVELOP_DIR"
    else
        exit 1
    fi
fi

echo "Found project at: $PROJECT_DIR"
cd "$PROJECT_DIR"

# --- Step 2: Update docker-compose.yml for subdomain (PUBLIC_URL=/) ---
echo ""
echo "[1/5] Updating docker-compose.yml for subdomain deployment..."
cat > docker-compose.yml << 'COMPOSE_EOF'
services:
  gdevelop-web:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - PUBLIC_URL=/
    container_name: gdevelop-web
    restart: unless-stopped
    ports:
      - "127.0.0.1:8080:80"
    environment:
      - NODE_ENV=production

  gdevelop-resources:
    build:
      context: ./resource-upload-server
    container_name: gdevelop-resources
    restart: unless-stopped
    volumes:
      - gdevelop-resources-data:/usr/src/app/uploads

volumes:
  gdevelop-resources-data:
    driver: local
COMPOSE_EOF
echo "  docker-compose.yml updated."

# --- Step 3: Rebuild and restart Docker containers ---
echo ""
echo "[2/5] Building Docker image (this may take 15-30 minutes)..."
docker compose build --no-cache

echo ""
echo "[3/5] Stopping old containers..."
docker compose down || true

echo ""
echo "[4/5] Starting containers..."
docker compose up -d

echo ""
echo "Waiting for container to start..."
sleep 10

if docker compose ps | grep -q "Up\|running"; then
    echo "  Containers are running."
else
    echo "  WARNING: Containers may not be running. Check: docker compose logs"
fi

# --- Step 4: Setup Nginx reverse proxy for subdomain ---
echo ""
echo "[5/5] Setting up Nginx for gdevelop.tirskix.space..."

NGINX_CONF="/etc/nginx/sites-available/gdevelop.tirskix.space"
NGINX_LINK="/etc/nginx/sites-enabled/gdevelop.tirskix.space"

cat > "$NGINX_CONF" << 'NGINX_EOF'
server {
    listen 80;
    server_name gdevelop.tirskix.space;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_buffering off;
        proxy_request_buffering off;
        client_max_body_size 200M;
    }
}
NGINX_EOF

# Enable the site
if [ ! -L "$NGINX_LINK" ]; then
    ln -s "$NGINX_CONF" "$NGINX_LINK"
fi

# Test and reload nginx
if nginx -t 2>/dev/null; then
    systemctl reload nginx
    echo "  Nginx configured and reloaded."
else
    echo "  WARNING: Nginx config test failed. Check: nginx -t"
fi

# --- Step 5: SSL with Let's Encrypt (optional) ---
echo ""
echo "=========================================="
echo "  DEPLOYMENT COMPLETE!"
echo "=========================================="
echo ""
echo "The site should now be accessible at:"
echo "  http://gdevelop.tirskix.space"
echo ""
echo "IMPORTANT - DNS setup required:"
echo "  Add an A record for gdevelop.tirskix.space"
echo "  pointing to this server's IP address."
echo ""
echo "OPTIONAL - Enable HTTPS:"
echo "  certbot --nginx -d gdevelop.tirskix.space"
echo ""
echo "Useful commands:"
echo "  View logs:    docker compose logs -f gdevelop-web"
echo "  Restart:      docker compose restart"
echo "  Stop:         docker compose down"
echo ""
