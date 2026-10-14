#!/bin/bash

# Deploy script for GDevelop on subdirectory
# Usage: ./deploy.sh

set -e

echo "🚀 Начинаем развертывание GDevelop на tirskix-academy.com/gdevelop"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Установите Docker и попробуйте снова."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен. Установите Docker Compose и попробуйте снова."
    exit 1
fi

# Build Docker image
echo "🔨 Сборка Docker образа (это может занять 15-30 минут)..."
docker-compose build

# Stop old containers
echo "🛑 Остановка старых контейнеров..."
docker-compose down || true

# Start containers
echo "▶️  Запуск контейнеров..."
docker-compose up -d

# Wait for container to be healthy
echo "⏳ Ожидание запуска контейнера..."
sleep 10

# Check status
if docker-compose ps | grep -q "Up"; then
    echo "✅ Развертывание завершено успешно!"
    echo ""
    echo "🔧 СЛЕДУЮЩИЕ ШАГИ:"
    echo ""
    echo "1. Добавьте в конфигурацию Nginx (/etc/nginx/sites-available/tirskix-academy.com):"
    echo "   Скопируйте содержимое файла nginx-subdirectory.conf"
    echo ""
    echo "2. Проверьте конфигурацию Nginx:"
    echo "   nginx -t"
    echo ""
    echo "3. Перезапустите Nginx:"
    echo "   systemctl reload nginx"
    echo ""
    echo "🌐 После этого приложение будет доступно по адресу:"
    echo "   https://tirskix-academy.com/gdevelop"
    echo ""
    echo "📊 Полезные команды:"
    echo "   Просмотр логов: docker-compose logs -f"
    echo "   Перезапуск: docker-compose restart"
    echo "   Остановка: docker-compose down"
    echo ""
    echo "📖 Полная инструкция: см. файл deploy-subdirectory.md"
else
    echo "❌ Ошибка при запуске контейнеров"
    echo "Просмотрите логи: docker-compose logs"
    exit 1
fi
