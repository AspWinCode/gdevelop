# 🚀 Инструкция по развертыванию GDevelop на VPS

## Требования

- VPS с Ubuntu 20.04/22.04 или Debian
- Минимум 2GB RAM, 2 CPU cores
- 20GB свободного места на диске
- Root доступ или sudo привилегии
- Домен, направленный на IP вашего VPS (A-запись)

## 1️⃣ Подготовка VPS

### Подключитесь к VPS по SSH:
```bash
ssh root@YOUR_VPS_IP
```

### Обновите систему:
```bash
apt update && apt upgrade -y
```

### Установите Docker:
```bash
# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Установка Docker Compose
apt install docker-compose -y

# Проверка установки
docker --version
docker-compose --version
```

### Установите дополнительные утилиты:
```bash
apt install git nginx certbot python3-certbot-nginx -y
```

## 2️⃣ Клонирование проекта на VPS

```bash
# Создайте директорию для проекта
mkdir -p /opt/gdevelop
cd /opt/gdevelop

# Клонируйте проект (или загрузите через FTP/SCP)
# Вариант 1: Если проект в Git репозитории
git clone YOUR_REPO_URL .

# Вариант 2: Загрузите проект с локальной машины
# На вашей локальной машине выполните:
# scp -r GDevelop-master root@YOUR_VPS_IP:/opt/gdevelop/
```

## 3️⃣ Настройка домена

### В настройках вашего доменного провайдера создайте A-записи:

```
A-запись:  @    -> YOUR_VPS_IP
A-запись:  www  -> YOUR_VPS_IP
```

Дождитесь распространения DNS (может занять от 5 минут до 24 часов).

### Проверьте DNS:
```bash
nslookup YOUR_DOMAIN.com
ping YOUR_DOMAIN.com
```

## 4️⃣ Получение SSL сертификата (HTTPS)

### Остановите Nginx, если он запущен:
```bash
systemctl stop nginx
```

### Получите сертификат Let's Encrypt:
```bash
certbot certonly --standalone -d YOUR_DOMAIN.com -d www.YOUR_DOMAIN.com
```

### Создайте директорию для SSL:
```bash
mkdir -p /opt/gdevelop/ssl
```

### Скопируйте сертификаты:
```bash
cp /etc/letsencrypt/live/YOUR_DOMAIN.com/fullchain.pem /opt/gdevelop/ssl/
cp /etc/letsencrypt/live/YOUR_DOMAIN.com/privkey.pem /opt/gdevelop/ssl/
```

### Настройте автообновление сертификата:
```bash
# Создайте скрипт обновления
cat > /opt/gdevelop/renew-cert.sh <<'EOF'
#!/bin/bash
certbot renew --quiet
cp /etc/letsencrypt/live/YOUR_DOMAIN.com/fullchain.pem /opt/gdevelop/ssl/
cp /etc/letsencrypt/live/YOUR_DOMAIN.com/privkey.pem /opt/gdevelop/ssl/
docker-compose -f /opt/gdevelop/docker-compose.yml restart
EOF

chmod +x /opt/gdevelop/renew-cert.sh

# Добавьте в cron (запуск каждый день в 3:00)
(crontab -l 2>/dev/null; echo "0 3 * * * /opt/gdevelop/renew-cert.sh") | crontab -
```

## 5️⃣ Настройка конфигурации

### Отредактируйте `nginx-ssl.conf`:
```bash
cd /opt/gdevelop
sed -i 's/YOUR_DOMAIN.com/ваш-домен.ru/g' nginx-ssl.conf
```

## 6️⃣ Сборка и запуск приложения

### Соберите Docker образ:
```bash
cd /opt/gdevelop
docker-compose build
```

⚠️ **Внимание**: Сборка может занять 15-30 минут в зависимости от мощности VPS.

### Запустите контейнер:
```bash
docker-compose up -d
```

### Проверьте статус:
```bash
docker-compose ps
docker-compose logs -f
```

## 7️⃣ Настройка Firewall

```bash
# Разрешите HTTP и HTTPS
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable
ufw status
```

## 8️⃣ Проверка работы

Откройте в браузере:
- http://YOUR_DOMAIN.com (должен редиректить на HTTPS)
- https://YOUR_DOMAIN.com (должен открыться GDevelop)

## 🔧 Полезные команды

### Просмотр логов:
```bash
docker-compose logs -f
```

### Перезапуск приложения:
```bash
docker-compose restart
```

### Остановка приложения:
```bash
docker-compose down
```

### Обновление приложения:
```bash
cd /opt/gdevelop
git pull  # если используете git
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Очистка Docker (освобождение места):
```bash
docker system prune -a
```

## 🔍 Решение проблем

### Приложение не запускается:
```bash
# Проверьте логи
docker-compose logs

# Проверьте используемые порты
netstat -tulpn | grep -E '80|443'
```

### Ошибки сборки:
```bash
# Увеличьте swap если мало RAM
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
```

### SSL не работает:
```bash
# Проверьте права на файлы
ls -la /opt/gdevelop/ssl/
chmod 644 /opt/gdevelop/ssl/*.pem
```

## 📊 Мониторинг

### Установите мониторинг (опционально):
```bash
apt install htop ncdu iotop -y
```

### Проверка ресурсов:
```bash
# CPU и RAM
htop

# Место на диске
df -h
ncdu /

# Docker статистика
docker stats
```

## 🛡️ Безопасность

### Отключите root вход по SSH:
```bash
nano /etc/ssh/sshd_config
# Измените: PermitRootLogin no
systemctl restart sshd
```

### Установите Fail2Ban:
```bash
apt install fail2ban -y
systemctl enable fail2ban
systemctl start fail2ban
```

## 📝 Backup

### Создайте backup скрипт:
```bash
cat > /opt/backup.sh <<'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/gdevelop_$DATE.tar.gz /opt/gdevelop
# Удаление старых backup (старше 7 дней)
find $BACKUP_DIR -name "gdevelop_*.tar.gz" -mtime +7 -delete
EOF

chmod +x /opt/backup.sh

# Добавьте в cron (каждый день в 2:00)
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup.sh") | crontab -
```

---

## ✅ Готово!

Ваш GDevelop теперь доступен по адресу: **https://YOUR_DOMAIN.com**

Если возникли проблемы, проверьте логи: `docker-compose logs -f`
