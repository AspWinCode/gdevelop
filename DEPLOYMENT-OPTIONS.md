# 🚀 Варианты развертывания GDevelop на VPS с tirskix.space

## Текущая ситуация:
- **VPS:** Уже есть с работающим проектом
- **Текущий домен:** tirskix.space
- **Новый домен:** tirskix-academy.com
- **Задача:** Развернуть GDevelop на tirskix-academy.com

---

## 🎯 Рекомендуемые варианты:

### ✅ Вариант 1: Поддомен (РЕКОМЕНДУЕТСЯ)

**URL:** `https://gdevelop.tirskix-academy.com`

**Преимущества:**
- ✅ Самый простой вариант
- ✅ Не нужно настраивать пути (PUBLIC_URL)
- ✅ Отдельный SSL сертификат
- ✅ Полная изоляция от других проектов
- ✅ Легко запомнить

**Недостатки:**
- ❌ Нужен дополнительный SSL сертификат
- ❌ Еще один домен в DNS

**Как настроить:**

1. **DNS настройка:**
```
A-запись: gdevelop.tirskix-academy.com → IP_вашего_VPS
```

2. **SSL сертификат:**
```bash
certbot certonly --nginx -d gdevelop.tirskix-academy.com
```

3. **Docker (без PUBLIC_URL):**
```yaml
# docker-compose.yml
services:
  gdevelop-web:
    build: .
    ports:
      - "8080:80"
```

4. **Nginx:**
```bash
cp nginx-subdomain.conf /etc/nginx/sites-available/gdevelop.tirskix-academy.com
ln -s /etc/nginx/sites-available/gdevelop.tirskix-academy.com /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

### ✅ Вариант 2: Поддиректория

**URL:** `https://tirskix-academy.com/gdevelop`

**Преимущества:**
- ✅ Один домен tirskix-academy.com
- ✅ Можно разместить и основной сайт academy
- ✅ Единый SSL сертификат

**Недостатки:**
- ❌ Нужно настраивать PUBLIC_URL
- ❌ Чуть сложнее конфигурация
- ❌ Нужен основной сайт на tirskix-academy.com (или пустая страница)

**Как настроить:**

1. **DNS настройка:**
```
A-запись: tirskix-academy.com → IP_вашего_VPS
A-запись: www.tirskix-academy.com → IP_вашего_VPS
```

2. **SSL сертификат:**
```bash
certbot certonly --nginx -d tirskix-academy.com -d www.tirskix-academy.com
```

3. **Docker (с PUBLIC_URL):**
```yaml
# docker-compose.yml
services:
  gdevelop-web:
    build: .
    ports:
      - "8080:80"
    environment:
      - PUBLIC_URL=/gdevelop
```

4. **Nginx:**
```bash
# Добавьте в /etc/nginx/sites-available/tirskix-academy.com
cp nginx-subdirectory.conf /etc/nginx/conf.d/
nginx -t
systemctl reload nginx
```

---

### ✅ Вариант 3: Корень домена

**URL:** `https://tirskix-academy.com`

**Только если GDevelop - единственное приложение на этом домене!**

**Преимущества:**
- ✅ Самый короткий URL
- ✅ Простая конфигурация

**Недостатки:**
- ❌ Весь домен занят GDevelop
- ❌ Нельзя добавить другие страницы

---

## 📊 Сравнение вариантов:

| Критерий | Поддомен | Поддиректория | Корень домена |
|----------|----------|---------------|---------------|
| **URL** | gdevelop.tirskix-academy.com | tirskix-academy.com/gdevelop | tirskix-academy.com |
| **Простота** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **SSL сертификат** | Отдельный | Общий | Один |
| **Гибкость** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐ |
| **Рекомендация** | ✅ Лучший | ✅ Хороший | ⚠️ Ограниченный |

---

## 🎯 Моя рекомендация:

### **Используйте Вариант 1 (Поддомен): `gdevelop.tirskix-academy.com`**

**Почему:**
1. Самый простой в настройке
2. Не нужно беспокоиться о путях (PUBLIC_URL)
3. Полная изоляция от других проектов
4. Легко масштабировать в будущем
5. Профессионально выглядит

---

## 🔧 Итоговая структура VPS (Вариант 1):

```
Ваш VPS (один сервер):

├── tirskix.space                    ← Текущий проект
│   └── Nginx: /etc/nginx/sites-available/tirskix.space
│   └── SSL: /etc/letsencrypt/live/tirskix.space/
│
├── gdevelop.tirskix-academy.com     ← GDevelop
│   └── Docker: /opt/gdevelop/ (порт 8080)
│   └── Nginx: /etc/nginx/sites-available/gdevelop.tirskix-academy.com
│   └── SSL: /etc/letsencrypt/live/gdevelop.tirskix-academy.com/
│
└── Nginx прослушивает порты 80, 443
    └── Проксирует запросы к нужным приложениям
```

**Все работает на одном VPS без конфликтов!**

---

## 🚀 Быстрый старт (Вариант 1 - Поддомен):

### Шаг 1: DNS настройка
```
В панели управления доменом tirskix-academy.com:
A-запись: gdevelop → IP_вашего_VPS
```

### Шаг 2: На VPS
```bash
# Загрузите проект
cd /opt/gdevelop

# Измените docker-compose.yml для поддомена
nano docker-compose.yml
# Уберите PUBLIC_URL=/gdevelop из environment

# Соберите
docker-compose build
docker-compose up -d
```

### Шаг 3: Настройте Nginx
```bash
# Получите SSL
certbot certonly --standalone -d gdevelop.tirskix-academy.com

# Создайте конфигурацию
cp /opt/gdevelop/nginx-subdomain.conf /etc/nginx/sites-available/gdevelop.tirskix-academy.com

# Активируйте
ln -s /etc/nginx/sites-available/gdevelop.tirskix-academy.com /etc/nginx/sites-enabled/

# Перезапустите
nginx -t
systemctl reload nginx
```

### Шаг 4: Готово!
Откройте: `https://gdevelop.tirskix-academy.com`

---

## ❓ Какой вариант выбрать?

**Ответьте на вопросы:**

1. **Будет ли на tirskix-academy.com основной сайт?**
   - Да → Вариант 2 (поддиректория)
   - Нет → Вариант 1 (поддомен) ⭐

2. **GDevelop - единственное приложение на домене?**
   - Да → Вариант 3 (корень)
   - Нет → Вариант 1 или 2

3. **Хотите максимально простую настройку?**
   - Да → Вариант 1 (поддомен) ⭐

---

## 📞 Нужна помощь с выбором?

Дайте знать:
- Будет ли основной сайт на tirskix-academy.com?
- Предпочитаете короткий URL или простоту настройки?

Я помогу настроить выбранный вариант! 🚀
