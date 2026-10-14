# ⚡ Быстрый старт: GDevelop на tirskix-academy.com/gdevelop

## 📦 Что нужно сделать

### 1️⃣ Загрузите проект на VPS

```bash
# На вашем компьютере
scp -r C:\Users\direc\Downloads\GDevelop-master\GDevelop-master root@YOUR_VPS_IP:/opt/gdevelop/
```

### 2️⃣ На VPS: Установите Docker (если еще не установлен)

```bash
ssh root@YOUR_VPS_IP

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Установка Docker Compose
apt install docker-compose -y
```

### 3️⃣ Соберите и запустите контейнер

```bash
cd /opt/gdevelop

# Сборка (займет 15-30 минут)
docker-compose build

# Запуск
docker-compose up -d

# Проверка
docker-compose ps
```

Контейнер будет доступен на **localhost:8080**

### 4️⃣ Настройте Nginx на основном сайте

```bash
# Откройте конфигурацию вашего сайта
nano /etc/nginx/sites-available/tirskix-academy.com
```

Добавьте в блок `server` (внутри HTTPS секции, после ваших текущих настроек):

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

### 5️⃣ Перезапустите Nginx

```bash
# Проверка конфигурации
nginx -t

# Перезапуск
systemctl reload nginx
```

### 6️⃣ Готово! 🎉

Откройте в браузере: **https://tirskix-academy.com/gdevelop**

---

## 🔍 Проверка работы

```bash
# Проверьте Docker контейнер
docker-compose ps
curl http://localhost:8080

# Проверьте логи
docker-compose logs -f

# Проверьте Nginx
nginx -t
tail -f /var/log/nginx/error.log
```

---

## 🛠️ Полезные команды

```bash
# Перезапуск GDevelop
docker-compose restart

# Остановка
docker-compose down

# Обновление (после изменений кода)
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## 📁 Структура файлов на VPS

```
/opt/gdevelop/
├── docker-compose.yml          # Конфигурация Docker
├── Dockerfile                  # Инструкции сборки
├── nginx-subdirectory.conf     # Готовый блок для Nginx
├── deploy.sh                   # Скрипт автоматического деплоя
├── newIDE/                     # Исходники GDevelop
└── ...
```

---

## ❓ Если что-то не работает

### GDevelop не открывается на /gdevelop

1. Проверьте, работает ли контейнер: `docker-compose ps`
2. Проверьте доступность: `curl http://localhost:8080`
3. Проверьте логи: `docker-compose logs`
4. Проверьте Nginx: `nginx -t` и `systemctl status nginx`

### Белый экран или ошибки CSS/JS

Пересоберите контейнер с правильным PUBLIC_URL:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### 502 Bad Gateway

Контейнер не запущен или недоступен:
```bash
docker-compose ps
docker-compose up -d
```

---

## 📖 Дополнительная информация

Смотрите **deploy-subdirectory.md** для подробной инструкции.
