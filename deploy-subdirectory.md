# 🚀 Инструкция по развертыванию GDevelop на tirskix-academy.com/gdevelop

## Два варианта развертывания:

### ✅ Рекомендуемый вариант: Проксирование через основной Nginx

## 📋 Требования

- Уже работающий сайт tirskix-academy.com с Nginx
- Docker и Docker Compose установлены на VPS
- SSL сертификат уже настроен для tirskix-academy.com

---

## 🔧 Вариант 1: Проксирование (Рекомендуется)

Этот метод позволяет GDevelop работать в отдельном Docker контейнере, а основной Nginx проксирует запросы.

### Шаг 1: Загрузите проект на VPS

```bash
# На вашей локальной машине
scp -r GDevelop-master root@YOUR_VPS_IP:/opt/gdevelop/

# Или на VPS
mkdir -p /opt/gdevelop
cd /opt/gdevelop
# Скопируйте файлы проекта сюда
```

### Шаг 2: Соберите и запустите Docker контейнер

```bash
cd /opt/gdevelop

# Сборка образа (займет 15-30 минут)
docker-compose build

# Запуск контейнера (будет доступен на localhost:8080)
docker-compose up -d

# Проверка статуса
docker-compose ps
docker-compose logs -f
```

### Шаг 3: Настройте основной Nginx

```bash
# Откройте конфигурацию вашего основного сайта
nano /etc/nginx/sites-available/tirskix-academy.com
```

Добавьте в блок `server` (внутри HTTPS секции):

```nginx
server {
    listen 443 ssl http2;
    server_name tirskix-academy.com www.tirskix-academy.com;
    
    # ... ваши существующие настройки SSL и прочее ...
    
    # Ваш основной сайт
    location / {
        # ваши текущие настройки
    }
    
    # ===== ДОБАВЬТЕ ЭТО =====
    # GDevelop на /gdevelop
    location /gdevelop/ {
        proxy_pass http://localhost:8080/;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        
        # Cache bypass
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Redirect /gdevelop to /gdevelop/
    location = /gdevelop {
        return 301 /gdevelop/;
    }
    # ===== КОНЕЦ ДОБАВЛЕНИЯ =====
}
```

Или просто скопируйте готовую конфигурацию:

```bash
# Скопируйте блок location из файла nginx-subdirectory.conf
cat /opt/gdevelop/nginx-subdirectory.conf >> /etc/nginx/sites-available/tirskix-academy.com
```

### Шаг 4: Проверьте и перезапустите Nginx

```bash
# Проверка конфигурации
nginx -t

# Если все ОК, перезапустите
systemctl reload nginx
```

### Шаг 5: Проверьте работу

Откройте в браузере: **https://tirskix-academy.com/gdevelop**

---

## 🔧 Вариант 2: Статические файлы в директории Nginx

Если вы хотите разместить статические файлы напрямую без Docker:

### Шаг 1: Соберите проект локально или на VPS

```bash
cd /opt/gdevelop/newIDE/app

# Установите зависимости
npm install --legacy-peer-deps

# Соберите с PUBLIC_URL
PUBLIC_URL=/gdevelop npm run build
```

### Шаг 2: Скопируйте build в директорию Nginx

```bash
# Создайте директорию для GDevelop
mkdir -p /var/www/tirskix-academy.com/gdevelop

# Скопируйте собранные файлы
cp -r /opt/gdevelop/newIDE/app/build/* /var/www/tirskix-academy.com/gdevelop/

# Установите права
chown -R www-data:www-data /var/www/tirskix-academy.com/gdevelop
chmod -R 755 /var/www/tirskix-academy.com/gdevelop
```

### Шаг 3: Настройте Nginx для статических файлов

```nginx
server {
    listen 443 ssl http2;
    server_name tirskix-academy.com www.tirskix-academy.com;
    
    # Основной сайт
    location / {
        root /var/www/tirskix-academy.com/html;
        index index.html;
    }
    
    # GDevelop статические файлы
    location /gdevelop {
        alias /var/www/tirskix-academy.com/gdevelop;
        index index.html;
        try_files $uri $uri/ /gdevelop/index.html;
        
        # Cache static assets
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### Шаг 4: Перезапустите Nginx

```bash
nginx -t
systemctl reload nginx
```

---

## 📊 Сравнение вариантов

| Параметр | Вариант 1 (Docker + Proxy) | Вариант 2 (Статические файлы) |
|----------|---------------------------|-------------------------------|
| **Простота** | Средняя | Простая |
| **Обновления** | Легко (docker-compose restart) | Требует пересборки |
| **Ресурсы** | Больше RAM (Docker) | Меньше RAM |
| **Изоляция** | Полная изоляция | Нет изоляции |
| **Рекомендация** | ✅ Рекомендуется | Для простых случаев |

---

## 🔍 Полезные команды

### Для варианта с Docker:

```bash
# Просмотр логов
docker-compose logs -f

# Перезапуск
docker-compose restart

# Остановка
docker-compose down

# Обновление
cd /opt/gdevelop
git pull  # если используете git
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Проверка Nginx:

```bash
# Проверка конфигурации
nginx -t

# Просмотр логов
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Перезапуск
systemctl reload nginx
```

---

## 🛠️ Решение проблем

### 404 Not Found при открытии /gdevelop

**Проблема:** Nginx не находит файлы или неправильно проксирует.

**Решение:**
```bash
# Проверьте, работает ли Docker контейнер
docker-compose ps
curl http://localhost:8080

# Проверьте конфигурацию Nginx
nginx -t
cat /etc/nginx/sites-available/tirskix-academy.com | grep gdevelop

# Проверьте логи
docker-compose logs
tail -f /var/log/nginx/error.log
```

### CSS/JS не загружаются

**Проблема:** Файлы загружаются с неправильных путей.

**Решение:**
```bash
# Убедитесь, что PUBLIC_URL=/gdevelop установлен при сборке
cd /opt/gdevelop/newIDE/app
PUBLIC_URL=/gdevelop npm run build

# Или в Dockerfile (уже настроено)
ENV PUBLIC_URL=/gdevelop
```

### Белый экран

**Проблема:** React Router не настроен для поддиректории.

**Решение:**
- Убедитесь, что в `docker-compose.yml` установлен `PUBLIC_URL=/gdevelop`
- Пересоберите контейнер: `docker-compose build --no-cache`

### Проксирование не работает

```bash
# Проверьте доступность контейнера
curl -I http://localhost:8080

# Проверьте SELinux (если используется)
setenforce 0  # временно отключить для теста

# Проверьте firewall
ufw status
ufw allow 8080/tcp
```

---

## 🔐 Безопасность

Контейнер GDevelop доступен только через localhost (127.0.0.1:8080), что безопасно. Внешний доступ только через Nginx с SSL.

```yaml
# В docker-compose.yml порты настроены безопасно:
ports:
  - "127.0.0.1:8080:80"  # Или просто "8080:80"
```

---

## ✅ Проверка после развертывания

1. **Основной сайт работает:** https://tirskix-academy.com ✅
2. **GDevelop доступен:** https://tirskix-academy.com/gdevelop ✅
3. **SSL активен для обоих** ✅
4. **Нет конфликтов путей** ✅

---

## 📞 Нужна помощь?

Проверьте логи:
```bash
# Docker логи
docker-compose logs -f

# Nginx логи
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

Готово! Ваш GDevelop теперь доступен на **https://tirskix-academy.com/gdevelop** 🎉
