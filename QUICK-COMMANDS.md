# ⚡ Быстрый справочник команд

## Копируйте и вставляйте команды по порядку

---

## 📝 ПОДГОТОВКА (запишите перед началом)

```
IP адрес VPS: ___.___.___.___ 
Email для SSL: _______________
Домен: tirskix-academy.com
```

---

## 1️⃣ ПОДКЛЮЧЕНИЕ К VPS

```bash
# Windows PowerShell
ssh root@ВАШ_IP
```

---

## 2️⃣ ОБНОВЛЕНИЕ СИСТЕМЫ

```bash
apt update && apt upgrade -y
```

---

## 3️⃣ УСТАНОВКА DOCKER

```bash
# Скачать установщик
curl -fsSL https://get.docker.com -o get-docker.sh

# Установить
sh get-docker.sh

# Проверить
docker --version
```

---

## 4️⃣ УСТАНОВКА DOCKER COMPOSE

```bash
apt install docker-compose -y

# Проверить
docker-compose --version
```

---

## 5️⃣ СОЗДАНИЕ ПАПКИ

```bash
mkdir -p /opt/gdevelop
cd /opt/gdevelop
pwd
```

---

## 6️⃣ ЗАГРУЗКА ФАЙЛОВ

**Используйте WinSCP или на вашем компьютере:**

```powershell
# Windows PowerShell (на вашем компьютере!)
cd C:\Users\direc\Downloads\GDevelop-master\GDevelop-master
scp -r * root@ВАШ_IP:/opt/gdevelop/
```

---

## 7️⃣ ПРОВЕРКА ФАЙЛОВ

```bash
cd /opt/gdevelop
ls -la
```

**Должны увидеть:** Dockerfile, docker-compose.yml, newIDE/, etc.

---

## 8️⃣ ПРОВЕРКА РЕСУРСОВ

```bash
# Свободное место (нужно >10GB)
df -h

# Свободная память (нужно >1GB)
free -h
```

---

## 9️⃣ СОЗДАНИЕ SWAP (если мало памяти)

```bash
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
free -h
```

---

## 🔟 СБОРКА DOCKER (15-30 минут ☕)

```bash
cd /opt/gdevelop
docker-compose build
```

---

## 1️⃣1️⃣ ЗАПУСК DOCKER

```bash
docker-compose up -d
```

---

## 1️⃣2️⃣ ПРОВЕРКА DOCKER

```bash
# Статус
docker-compose ps

# Логи
docker-compose logs -f
# Ctrl+C для выхода

# Проверка доступности
curl -I http://localhost:8080
```

**Должен быть статус: Up**
**Должен вернуть: HTTP/1.1 200 OK**

---

## 1️⃣3️⃣ УСТАНОВКА CERTBOT

```bash
apt install certbot -y
```

---

## 1️⃣4️⃣ ОСТАНОВКА NGINX (если есть)

```bash
systemctl stop nginx
```

---

## 1️⃣5️⃣ ПОЛУЧЕНИЕ SSL

```bash
# ЗАМЕНИТЕ ваш_email@example.com на ваш email!
certbot certonly --standalone \
  -d tirskix-academy.com \
  -d www.tirskix-academy.com \
  --agree-tos \
  --email ваш_email@example.com
```

**Должно показать:** Successfully received certificate

---

## 1️⃣6️⃣ УСТАНОВКА NGINX

```bash
apt install nginx -y
```

---

## 1️⃣7️⃣ НАСТРОЙКА NGINX

```bash
# Скопировать конфигурацию
cp /opt/gdevelop/nginx-tirskix-academy.conf /etc/nginx/sites-available/tirskix-academy.com

# Активировать
ln -s /etc/nginx/sites-available/tirskix-academy.com /etc/nginx/sites-enabled/

# Проверить
nginx -t
```

**Должно показать:** syntax is ok, test is successful

---

## 1️⃣8️⃣ ЗАПУСК NGINX

```bash
systemctl restart nginx
systemctl status nginx
```

**Должен быть:** active (running)

---

## 1️⃣9️⃣ НАСТРОЙКА FIREWALL

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status
```

---

## 2️⃣0️⃣ ФИНАЛЬНАЯ ПРОВЕРКА

```bash
# Docker
docker-compose ps

# Nginx
systemctl status nginx

# Локальная проверка
curl -I http://localhost:8080
curl -I https://tirskix-academy.com/gdevelop
```

---

## 🎉 ГОТОВО!

**Откройте в браузере:**
```
https://tirskix-academy.com/gdevelop
```

---

## 🔄 ПОЛЕЗНЫЕ КОМАНДЫ

### Просмотр логов:
```bash
docker-compose logs -f
tail -f /var/log/nginx/error.log
```

### Перезапуск:
```bash
docker-compose restart
systemctl restart nginx
```

### Остановка:
```bash
docker-compose down
systemctl stop nginx
```

### Пересборка:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## 🆘 ЧТО ДЕЛАТЬ ЕСЛИ НЕ РАБОТАЕТ

### Docker контейнер не запускается:
```bash
docker-compose logs -f
docker system prune -a
df -h
```

### Nginx ошибка:
```bash
nginx -t
tail -f /var/log/nginx/error.log
systemctl status nginx
```

### 502 Bad Gateway:
```bash
docker-compose ps
docker-compose restart
curl http://localhost:8080
```

### SSL ошибка:
```bash
certbot certificates
certbot renew --force-renewal
systemctl restart nginx
```

---

## 📞 ПРОВЕРКА СТАТУСОВ

```bash
# Всё в одной команде
echo "=== DOCKER ===" && docker-compose ps && \
echo "=== NGINX ===" && systemctl status nginx --no-pager && \
echo "=== ПОРТЫ ===" && netstat -tulpn | grep -E ':80|:443|:8080' && \
echo "=== ДИСК ===" && df -h / && \
echo "=== ПАМЯТЬ ===" && free -h
```

