# 🚀 Финальная инструкция по развертыванию GDevelop

## Конфигурация:
```
tirskix.space              → Ваш текущий проект
tirskix-academy.com        → Основной сайт academy
tirskix-academy.com/gdevelop → GDevelop
```

---

## 📋 Пошаговая инструкция

### ✅ ШАГ 1: Настройка DNS

В панели управления доменом **tirskix-academy.com** создайте A-записи:

```
Тип: A
Имя: @
Значение: IP_вашего_VPS
TTL: 3600

Тип: A
Имя: www
Значение: IP_вашего_VPS
TTL: 3600
```

Проверьте DNS (через 5-10 минут):
```bash
nslookup tirskix-academy.com
ping tirskix-academy.com
```

---

### ✅ ШАГ 2: Загрузка проекта на VPS

**На вашем компьютере (Windows):**

```powershell
# Откройте PowerShell в папке с проектом
cd C:\Users\direc\Downloads\GDevelop-master\GDevelop-master

# Загрузите на VPS (замените YOUR_VPS_IP)
scp -r . root@YOUR_VPS_IP:/opt/gdevelop/
```

**Или используйте FileZilla/WinSCP** для загрузки всей папки в `/opt/gdevelop/`

---

### ✅ ШАГ 3: Установка Docker (если еще не установлен)

**На VPS:**

```bash
ssh root@YOUR_VPS_IP

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Установка Docker Compose
apt install docker-compose -y

# Проверка
docker --version
docker-compose --version
```

---

### ✅ ШАГ 4: Сборка и запуск GDevelop

```bash
cd /opt/gdevelop

# Сборка Docker образа (займет 15-30 минут)
docker-compose build

# Запуск контейнера
docker-compose up -d

# Проверка статуса
docker-compose ps
docker-compose logs -f

# Проверка доступности (должен вернуть HTML)
curl http://localhost:8080
```

**Контейнер должен быть в статусе "Up"**

---

### ✅ ШАГ 5: Получение SSL сертификата

```bash
# Остановите Nginx если он работает
systemctl stop nginx

# Получите SSL сертификат для tirskix-academy.com
certbot certonly --standalone \
  -d tirskix-academy.com \
  -d www.tirskix-academy.com

# Если сертификат уже есть, пропустите этот шаг
```

---

### ✅ ШАГ 6: Настройка Nginx

#### Вариант А: Если у вас НЕТ основного сайта на tirskix-academy.com

```bash
# Создайте новую конфигурацию
nano /etc/nginx/sites-available/tirskix-academy.com
```

Вставьте:

```nginx
# HTTP - redirect to HTTPS
server {
    listen 80;
    server_name tirskix-academy.com www.tirskix-academy.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name tirskix-academy.com www.tirskix-academy.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/tirskix-academy.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tirskix-academy.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Корень домена - можно поставить заглушку или редирект
    location = / {
        return 301 /gdevelop/;
    }

    # GDevelop на /gdevelop
    location /gdevelop/ {
        proxy_pass http://localhost:8080/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
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
}
```

#### Вариант Б: Если у вас УЖЕ ЕСТЬ конфигурация tirskix-academy.com

```bash
# Откройте существующую конфигурацию
nano /etc/nginx/sites-available/tirskix-academy.com
```

Добавьте в блок `server` (HTTPS секция):

```nginx
    # GDevelop на /gdevelop
    location /gdevelop/ {
        proxy_pass http://localhost:8080/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    location = /gdevelop {
        return 301 /gdevelop/;
    }
```

---

### ✅ ШАГ 7: Активация конфигурации

```bash
# Если создали новую конфигурацию (Вариант А)
ln -s /etc/nginx/sites-available/tirskix-academy.com /etc/nginx/sites-enabled/

# Проверка конфигурации
nginx -t

# Если все ОК, перезапустите Nginx
systemctl restart nginx

# Проверка статуса
systemctl status nginx
```

---

### ✅ ШАГ 8: Настройка Firewall

```bash
# Разрешите порты
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp

# Включите firewall (если еще не включен)
ufw enable

# Проверка
ufw status
```

---

### ✅ ШАГ 9: Проверка работы

Откройте в браузере:

1. **http://tirskix-academy.com** → должен редиректить на HTTPS
2. **https://tirskix-academy.com/gdevelop** → должен открыть GDevelop ✅

---

## 🔍 Проверка на VPS

```bash
# Проверка Docker контейнера
docker-compose ps
# Должен показать: gdevelop-web   Up

# Проверка логов Docker
docker-compose logs -f

# Проверка локальной доступности
curl -I http://localhost:8080
# Должен вернуть: HTTP/1.1 200 OK

# Проверка Nginx
nginx -t
systemctl status nginx

# Проверка SSL
curl -I https://tirskix-academy.com/gdevelop
```

---

## 🛠️ Решение проблем

### Проблема 1: 404 Not Found на /gdevelop

```bash
# Проверьте Docker контейнер
docker-compose ps
curl http://localhost:8080

# Если не работает, пересоберите
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Проблема 2: 502 Bad Gateway

```bash
# Docker контейнер не запущен или недоступен
docker-compose restart

# Проверьте логи
docker-compose logs -f
```

### Проблема 3: CSS/JS не загружаются

```bash
# Проверьте PUBLIC_URL в docker-compose.yml
cat docker-compose.yml | grep PUBLIC_URL

# Должно быть: PUBLIC_URL=/gdevelop

# Если нет, пересоберите
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Проблема 4: SSL ошибки

```bash
# Проверьте сертификат
certbot certificates

# Обновите сертификат
certbot renew --force-renewal
systemctl reload nginx
```

### Проблема 5: Белый экран

```bash
# Откройте консоль браузера (F12)
# Проверьте ошибки загрузки ресурсов

# Пересоберите с правильным PUBLIC_URL
cd /opt/gdevelop
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## 📊 Полезные команды

```bash
# Просмотр логов Docker
docker-compose logs -f

# Перезапуск GDevelop
docker-compose restart

# Остановка
docker-compose down

# Обновление (после изменений)
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Просмотр логов Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Проверка использования ресурсов
docker stats
htop
df -h
```

---

## 🔄 Автообновление SSL сертификата

```bash
# Создайте скрипт обновления
cat > /opt/renew-ssl.sh <<'EOF'
#!/bin/bash
certbot renew --quiet
systemctl reload nginx
EOF

chmod +x /opt/renew-ssl.sh

# Добавьте в cron (каждый день в 3:00)
(crontab -l 2>/dev/null; echo "0 3 * * * /opt/renew-ssl.sh") | crontab -
```

---

## 📁 Итоговая структура на VPS

```
/
├── opt/
│   └── gdevelop/
│       ├── docker-compose.yml
│       ├── Dockerfile
│       ├── newIDE/
│       └── ...
│
├── etc/
│   ├── nginx/
│   │   └── sites-available/
│   │       ├── tirskix.space           ← Существующий проект
│   │       └── tirskix-academy.com     ← Новая конфигурация
│   │
│   └── letsencrypt/
│       └── live/
│           ├── tirskix.space/
│           └── tirskix-academy.com/    ← SSL сертификат
│
└── var/
    └── www/
        └── tirskix-academy.com/        ← Основной сайт (если есть)
```

---

## ✅ Финальная проверка

После завершения всех шагов:

- [ ] Docker контейнер запущен: `docker-compose ps`
- [ ] Nginx работает: `systemctl status nginx`
- [ ] SSL активен: `https://tirskix-academy.com/gdevelop`
- [ ] GDevelop открывается в браузере
- [ ] Ресурсы (CSS/JS) загружаются корректно
- [ ] Нет ошибок в консоли браузера (F12)

---

## 🎉 Готово!

Ваш GDevelop доступен по адресу:
### **https://tirskix-academy.com/gdevelop**

При возникновении проблем проверьте логи:
```bash
docker-compose logs -f
tail -f /var/log/nginx/error.log
```
