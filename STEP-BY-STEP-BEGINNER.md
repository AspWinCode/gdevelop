# 🎓 Пошаговая инструкция для новичков: Развертывание GDevelop

## 📌 Что мы будем делать:
Развернем GDevelop редактор на вашем домене **tirskix-academy.com/gdevelop**

---

## 🛠️ Что вам понадобится:

1. ✅ VPS сервер (у вас уже есть с tirskix.space)
2. ✅ Домен tirskix-academy.com
3. ✅ Доступ к панели управления доменом
4. ✅ SSH доступ к VPS (логин и пароль или SSH ключ)
5. ✅ Программа для SSH (PuTTY для Windows или встроенный SSH)
6. ✅ Программа для загрузки файлов (WinSCP, FileZilla или SCP)

---

# ЧАСТЬ 1: НАСТРОЙКА DNS (5 минут)

## Шаг 1.1: Узнайте IP адрес вашего VPS

### Вариант А: Через SSH
```bash
# Подключитесь к VPS
ssh root@ваш_текущий_IP

# Узнайте IP
curl ifconfig.me
# или
hostname -I
```

### Вариант Б: Посмотрите в панели управления хостинга
- Зайдите в личный кабинет вашего VPS провайдера
- Найдите раздел "Серверы" или "VPS"
- IP адрес будет указан рядом с сервером

**Запишите IP адрес:** `___.___.___.___`

---

## Шаг 1.2: Настройте DNS записи

### Где: Панель управления доменом tirskix-academy.com

Это может быть:
- Регистратор домена (где вы купили домен)
- Cloudflare
- REG.RU, Timeweb, и т.д.

### Что делать:

1. **Войдите в панель управления доменом**
2. **Найдите раздел DNS или DNS записи**
3. **Добавьте 2 записи:**

#### Запись 1:
```
Тип записи:  A
Имя/Host:    @  (или оставьте пустым, или tirskix-academy.com)
Значение/IP: ВАШ_IP_АДРЕС_VPS
TTL:         3600 (или Auto, или 1 час)
```

#### Запись 2:
```
Тип записи:  A
Имя/Host:    www
Значение/IP: ВАШ_IP_АДРЕС_VPS
TTL:         3600
```

### Примеры для популярных панелей:

**REG.RU:**
- Зайдите в "Управление доменами"
- Выберите tirskix-academy.com
- Вкладка "Управление DNS"
- Нажмите "Добавить запись"

**Cloudflare:**
- Выберите домен tirskix-academy.com
- Раздел "DNS"
- Нажмите "Add record"
- Type: A, Name: @, IPv4 address: ваш_IP

**Timeweb:**
- Раздел "DNS"
- Выберите домен
- Добавить запись → A

---

## Шаг 1.3: Проверьте DNS (через 10-30 минут)

DNS записи обновляются не мгновенно! Подождите 10-30 минут.

### На вашем компьютере (Windows):

```powershell
# Откройте PowerShell (Win+X → Windows PowerShell)
nslookup tirskix-academy.com

# Должен показать ваш IP адрес
```

**Если показывает ваш IP - отлично! Переходите к Части 2.**

**Если нет - подождите еще 10 минут и проверьте снова.**

---

# ЧАСТЬ 2: ПОДГОТОВКА VPS (15 минут)

## Шаг 2.1: Подключитесь к VPS по SSH

### Вариант А: Windows (встроенный SSH)

```powershell
# Откройте PowerShell (Win+X → Windows PowerShell)
ssh root@ваш_IP_адрес

# Введите пароль когда попросит
```

### Вариант Б: PuTTY (если встроенный SSH не работает)

1. Скачайте PuTTY: https://www.putty.org/
2. Запустите PuTTY
3. В поле "Host Name": введите IP вашего VPS
4. Port: 22
5. Нажмите "Open"
6. Введите логин: `root`
7. Введите пароль

**После подключения вы увидите приглашение командной строки:**
```bash
root@server:~#
```

---

## Шаг 2.2: Обновите систему

**Скопируйте и вставьте команду:**

```bash
apt update && apt upgrade -y
```

**Что происходит:** Обновляются все пакеты системы.
**Время:** 2-5 минут.

Нажмите Enter и подождите. Увидите много текста - это нормально.

---

## Шаг 2.3: Установите Docker

**Команда 1: Скачиваем установщик Docker**

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
```

**Команда 2: Запускаем установщик**

```bash
sh get-docker.sh
```

**Время:** 1-2 минуты.

**Команда 3: Проверяем установку**

```bash
docker --version
```

**Должно показать что-то вроде:**
```
Docker version 24.0.7, build afdd53b
```

---

## Шаг 2.4: Установите Docker Compose

```bash
apt install docker-compose -y
```

**Проверка:**

```bash
docker-compose --version
```

**Должно показать:**
```
docker-compose version 1.29.2, build ...
```

✅ **Docker установлен!**

---

# ЧАСТЬ 3: ЗАГРУЗКА ПРОЕКТА НА VPS (10 минут)

## Шаг 3.1: Создайте папку для проекта на VPS

**В SSH терминале выполните:**

```bash
mkdir -p /opt/gdevelop
cd /opt/gdevelop
pwd
```

**Должно показать:**
```
/opt/gdevelop
```

---

## Шаг 3.2: Загрузите файлы проекта

### Вариант А: Используя WinSCP (РЕКОМЕНДУЕТСЯ для новичков)

1. **Скачайте WinSCP:** https://winscp.net/eng/download.php
2. **Запустите WinSCP**
3. **Настройте подключение:**
   - File protocol: `SCP`
   - Host name: `ваш_IP_адрес`
   - Port: `22`
   - User name: `root`
   - Password: `ваш_пароль`
4. **Нажмите "Login"**
5. **Слева** - ваш компьютер, **справа** - VPS
6. **Справа** перейдите в папку: `/opt/gdevelop`
7. **Слева** откройте папку: `C:\Users\direc\Downloads\GDevelop-master\GDevelop-master`
8. **Выделите ВСЕ файлы слева** (Ctrl+A)
9. **Перетащите их вправо** (или нажмите F5)
10. **Подождите** загрузки (5-15 минут)

### Вариант Б: Используя SCP из командной строки

**На вашем компьютере (Windows PowerShell):**

```powershell
# Перейдите в папку с проектом
cd C:\Users\direc\Downloads\GDevelop-master\GDevelop-master

# Загрузите на VPS (замените YOUR_VPS_IP на ваш IP)
scp -r * root@YOUR_VPS_IP:/opt/gdevelop/
```

**Введите пароль когда попросит.**

**Время загрузки:** 5-15 минут (зависит от скорости интернета).

---

## Шаг 3.3: Проверьте что файлы загрузились

**В SSH терминале:**

```bash
cd /opt/gdevelop
ls -la
```

**Должны увидеть файлы:**
```
Dockerfile
docker-compose.yml
nginx-tirskix-academy.conf
FINAL-DEPLOYMENT.md
newIDE/
GDJS/
Core/
...
```

✅ **Файлы загружены!**

---

# ЧАСТЬ 4: СБОРКА И ЗАПУСК DOCKER (20-40 минут)

## Шаг 4.1: Проверьте свободное место

```bash
df -h
```

**Найдите строку с `/` в столбце "Mounted on":**
```
Filesystem      Size  Used Avail Use% Mounted on
/dev/vda1        50G   10G   38G  21% /
```

**Нужно минимум 10GB свободного (Avail).**

**Если мало места - очистите:**
```bash
apt autoremove -y
apt clean
docker system prune -a
```

---

## Шаг 4.2: Проверьте свободную память (RAM)

```bash
free -h
```

**Должно быть минимум 1GB свободно.**

**Если мало - создайте SWAP файл:**

```bash
# Создаем 4GB SWAP
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# Делаем постоянным
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab

# Проверяем
free -h
```

---

## Шаг 4.3: Соберите Docker образ

**ЭТО ЗАЙМЕТ 15-30 МИНУТ! Наберитесь терпения ☕**

```bash
cd /opt/gdevelop
docker-compose build
```

**Что вы увидите:**
- Много текста с загрузкой пакетов
- Прогресс сборки
- "Successfully built ..." в конце

**Если увидели ошибки:**
- Проверьте есть ли файлы в папке: `ls -la`
- Проверьте место на диске: `df -h`
- Создайте SWAP если мало RAM

---

## Шаг 4.4: Запустите контейнер

```bash
docker-compose up -d
```

**Флаг `-d` означает запуск в фоновом режиме.**

**Должно показать:**
```
Creating network "gdevelop_gdevelop-network" with driver "bridge"
Creating gdevelop-web ... done
```

---

## Шаг 4.5: Проверьте что контейнер запущен

```bash
docker-compose ps
```

**Должно показать:**
```
     Name                   Command               State         Ports
--------------------------------------------------------------------------------
gdevelop-web   nginx -g daemon off;        Up      0.0.0.0:8080->80/tcp
```

**Статус должен быть "Up"!**

**Если статус "Exit" или "Restarting" - смотрите логи:**

```bash
docker-compose logs -f
```

**Нажмите Ctrl+C чтобы выйти из логов.**

---

## Шаг 4.6: Проверьте локальную доступность

```bash
curl -I http://localhost:8080
```

**Должно показать:**
```
HTTP/1.1 200 OK
Server: nginx
Content-Type: text/html
...
```

✅ **Docker контейнер работает!**

---

# ЧАСТЬ 5: НАСТРОЙКА SSL (10 минут)

## Шаг 5.1: Установите Certbot

```bash
apt install certbot -y
```

---

## Шаг 5.2: Остановите Nginx (если запущен)

```bash
systemctl stop nginx
```

**Или (если nginx управляется по-другому):**

```bash
nginx -s stop
```

**Если показывает ошибку "nginx: command not found" - всё ОК, идите дальше.**

---

## Шаг 5.3: Получите SSL сертификат

**ВАЖНО: Замените на свой домен!**

```bash
certbot certonly --standalone \
  -d tirskix-academy.com \
  -d www.tirskix-academy.com \
  --agree-tos \
  --email ваш_email@example.com
```

**Что спросят:**
1. **Email:** Введите ваш email (для уведомлений об окончании сертификата)
2. **Agree to Terms:** Введите `Y` (согласие с условиями)

**Должно показать:**
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/tirskix-academy.com/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/tirskix-academy.com/privkey.pem
```

✅ **SSL сертификат получен!**

**Если ошибка "DNS resolution failed":**
- DNS еще не обновился, подождите 10 минут
- Проверьте DNS: `nslookup tirskix-academy.com`

---

# ЧАСТЬ 6: НАСТРОЙКА NGINX (10 минут)

## Шаг 6.1: Установите Nginx (если еще не установлен)

```bash
apt install nginx -y
```

---

## Шаг 6.2: Проверьте существующие конфигурации

```bash
ls -la /etc/nginx/sites-available/
```

**Вы увидите:**
- `default` - стандартная конфигурация
- Может быть `tirskix.space` - ваш текущий проект
- Возможно другие файлы

---

## Шаг 6.3: Создайте конфигурацию для tirskix-academy.com

### Вариант А: Если конфигурации tirskix-academy.com НЕТ

**Скопируйте готовую конфигурацию:**

```bash
cp /opt/gdevelop/nginx-tirskix-academy.conf /etc/nginx/sites-available/tirskix-academy.com
```

**Активируйте конфигурацию:**

```bash
ln -s /etc/nginx/sites-available/tirskix-academy.com /etc/nginx/sites-enabled/
```

### Вариант Б: Если конфигурация tirskix-academy.com УЖЕ ЕСТЬ

**Откройте файл:**

```bash
nano /etc/nginx/sites-available/tirskix-academy.com
```

**Найдите блок `server { listen 443 ssl http2; ...` и добавьте ПЕРЕД закрывающей скобкой `}`:**

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

**Сохраните файл:**
- Нажмите `Ctrl+O` (буква О)
- Нажмите `Enter`
- Нажмите `Ctrl+X`

---

## Шаг 6.4: Проверьте конфигурацию Nginx

```bash
nginx -t
```

**Должно показать:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

**Если ошибка - проверьте:**
1. Правильно ли скопировали конфигурацию
2. Нет ли опечаток
3. Закрыты ли все скобки

---

## Шаг 6.5: Перезапустите Nginx

```bash
systemctl restart nginx
```

**Проверьте статус:**

```bash
systemctl status nginx
```

**Должно показать:**
```
● nginx.service - A high performance web server
   Active: active (running) since ...
```

**Если статус "failed" - смотрите ошибки:**

```bash
journalctl -xeu nginx
```

**Или проверьте логи:**

```bash
tail -f /var/log/nginx/error.log
```

---

# ЧАСТЬ 7: НАСТРОЙКА FIREWALL (5 минут)

## Шаг 7.1: Проверьте статус firewall

```bash
ufw status
```

**Если показывает "Status: inactive" - включите:**

```bash
ufw enable
```

---

## Шаг 7.2: Разрешите нужные порты

```bash
# SSH (чтобы не потерять доступ!)
ufw allow 22/tcp

# HTTP
ufw allow 80/tcp

# HTTPS
ufw allow 443/tcp
```

---

## Шаг 7.3: Проверьте правила

```bash
ufw status
```

**Должно показать:**
```
Status: active

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
```

✅ **Firewall настроен!**

---

# ЧАСТЬ 8: ФИНАЛЬНАЯ ПРОВЕРКА (5 минут)

## Шаг 8.1: Проверьте Docker контейнер

```bash
docker-compose ps
```

**Должен быть "Up".**

---

## Шаг 8.2: Проверьте Nginx

```bash
systemctl status nginx
```

**Должен быть "active (running)".**

---

## Шаг 8.3: Проверьте локально

```bash
curl -I http://localhost:8080
curl -I https://tirskix-academy.com/gdevelop
```

**Оба должны вернуть "200 OK".**

---

## Шаг 8.4: Откройте в браузере

**На вашем компьютере откройте браузер:**

1. **Перейдите на:** https://tirskix-academy.com/gdevelop

**Что должно быть:**
- ✅ Сайт открывается
- ✅ Есть зеленый замочек (SSL работает)
- ✅ GDevelop редактор загружается
- ✅ Нет ошибок в консоли (F12 → Console)

---

# 🎉 ГОТОВО!

## Ваш GDevelop теперь доступен по адресу:
# https://tirskix-academy.com/gdevelop

---

# 📊 ПОЛЕЗНЫЕ КОМАНДЫ

## Просмотр логов Docker:
```bash
cd /opt/gdevelop
docker-compose logs -f
```

## Перезапуск GDevelop:
```bash
cd /opt/gdevelop
docker-compose restart
```

## Остановка GDevelop:
```bash
cd /opt/gdevelop
docker-compose down
```

## Запуск GDevelop:
```bash
cd /opt/gdevelop
docker-compose up -d
```

## Пересборка после изменений:
```bash
cd /opt/gdevelop
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Просмотр логов Nginx:
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Проверка использования ресурсов:
```bash
# Процессор и память
htop

# Место на диске
df -h

# Статистика Docker
docker stats
```

---

# 🔧 РЕШЕНИЕ ПРОБЛЕМ

## Проблема 1: "Connection refused" при подключении по SSH

**Решение:**
- Проверьте IP адрес
- Проверьте что VPS запущен
- Попробуйте другой SSH клиент (PuTTY)

---

## Проблема 2: Docker build падает с ошибкой "no space left"

**Решение:**
```bash
# Очистите место
apt autoremove -y
apt clean
docker system prune -a

# Проверьте место
df -h
```

---

## Проблема 3: Nginx не запускается

**Решение:**
```bash
# Проверьте что порты свободны
netstat -tulpn | grep -E ':80|:443'

# Если порт 80 занят - остановите процесс
systemctl stop apache2  # если установлен Apache

# Проверьте конфигурацию
nginx -t

# Смотрите ошибки
journalctl -xeu nginx
```

---

## Проблема 4: 502 Bad Gateway

**Решение:**
```bash
# Проверьте Docker контейнер
docker-compose ps

# Если не запущен
docker-compose up -d

# Проверьте логи
docker-compose logs -f

# Проверьте доступность
curl http://localhost:8080
```

---

## Проблема 5: SSL ошибка "NET::ERR_CERT_AUTHORITY_INVALID"

**Решение:**
```bash
# Проверьте сертификат
certbot certificates

# Обновите сертификат
certbot renew --force-renewal

# Перезапустите Nginx
systemctl restart nginx
```

---

## Проблема 6: Белый экран на /gdevelop

**Решение:**
```bash
# Откройте консоль браузера (F12)
# Проверьте ошибки загрузки файлов

# Пересоберите с правильным PUBLIC_URL
cd /opt/gdevelop
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## Проблема 7: CSS/JS файлы не загружаются (404)

**Решение:**
```bash
# Проверьте что PUBLIC_URL установлен
cat docker-compose.yml | grep PUBLIC_URL

# Должно быть: - PUBLIC_URL=/gdevelop

# Если нет - пересоберите
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

# 📞 КУДА ОБРАТИТЬСЯ ЗА ПОМОЩЬЮ

## Проверьте логи:
```bash
# Docker
docker-compose logs -f

# Nginx
tail -f /var/log/nginx/error.log

# Системные логи
journalctl -xe
```

## Проверьте статусы:
```bash
# Docker контейнер
docker-compose ps

# Nginx
systemctl status nginx

# Порты
netstat -tulpn | grep -E ':80|:443|:8080'
```

---

# ✅ ЧЕКЛИСТ ПЕРЕД НАЧАЛОМ

- [ ] У меня есть доступ к VPS (логин/пароль)
- [ ] Я знаю IP адрес VPS
- [ ] У меня есть доступ к панели управления доменом tirskix-academy.com
- [ ] У меня установлен SSH клиент (PuTTY или встроенный)
- [ ] У меня есть программа для загрузки файлов (WinSCP)
- [ ] На VPS минимум 2GB RAM и 15GB свободного места

---

# ✅ ЧЕКЛИСТ ПОСЛЕ УСТАНОВКИ

- [ ] DNS настроен и работает
- [ ] Docker установлен и работает
- [ ] Файлы проекта загружены на VPS
- [ ] Docker контейнер собран и запущен
- [ ] SSL сертификат получен
- [ ] Nginx настроен и запущен
- [ ] Firewall настроен
- [ ] Сайт открывается в браузере
- [ ] Нет ошибок в консоли браузера (F12)
- [ ] SSL работает (зеленый замочек)

---

Если что-то непонятно на любом этапе - задавайте вопросы! 🚀
