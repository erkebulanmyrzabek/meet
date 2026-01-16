# Деплой Фронтенда - Пошаговые Инструкции

## 🚀 Vercel (Рекомендуется)

**Почему Vercel:**
- ✅ Бесплатный план
- ✅ Автоматический деплой из GitHub
- ✅ HTTPS из коробки
- ✅ Глобальный CDN
- ✅ Идеально для Vue.js/Vite

### Шаги для деплоя на Vercel:

1. **Зарегистрируйтесь на Vercel:**
   https://vercel.com/signup

2. **Импортируйте проект:**
   - New Project → Import Git Repository
   - Выберите `erkebulanmyrzabek/meet`

3. **Настройте проект:**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Добавьте Environment Variables:**
   - `VITE_API_URL` = `https://meet-f4ff.onrender.com/api`
   - `VITE_WS_URL` = `wss://meet-f4ff.onrender.com/ws`

5. **Deploy!**
   - Нажмите "Deploy"
   - Ждите 1-2 минуты

6. **Получите URL:**
   После деплоя получите URL типа: `https://meet-xyz.vercel.app`

### После деплоя на Vercel:

Обновите CORS на Render.com:
```
CORS_ALLOWED_ORIGINS=https://meet-xyz.vercel.app
```

---

## 🌐 Netlify (Альтернатива)

**Почему Netlify:**
- ✅ Бесплатный план
- ✅ Простой UI
- ✅ Drag & Drop деплой
- ✅ 100GB bandwidth/месяц

### Шаги для деплоя на Netlify:

1. **Зарегистрируйтесь:**
   https://netlify.com/

2. **New Site from Git:**
   - Connect to GitHub
   - Выберите репозиторий `meet`

3. **Build Settings:**
   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/dist
   ```

4. **Environment Variables:**
   Site settings → Build & deploy → Environment
   - `VITE_API_URL` = `https://meet-f4ff.onrender.com/api`
   - `VITE_WS_URL` = `wss://meet-f4ff.onrender.com/ws`

5. **Deploy!**

---

## ☁️ Cloudflare Pages

**Почему Cloudflare:**
- ✅ Безлимитный bandwidth
- ✅ Очень быстрый (глобальный CDN)
- ✅ Бесплатно

### Шаги:

1. https://pages.cloudflare.com/
2. Connect GitHub → Import `meet`
3. Settings:
   ```
   Build command: cd frontend && npm run build
   Build output: frontend/dist
   Root directory: /
   ```
4. Environment variables как выше

---

## 🎯 Что делать после деплоя

После деплоя фронтенда на любой сервис:

### 1. Обновите CORS на Render.com

В Render Dashboard → Environment:
```bash
CORS_ALLOWED_ORIGINS=https://ваш-фронтенд.vercel.app,http://localhost:5173
```

### 2. Обновите ALLOWED_HOSTS

```bash
ALLOWED_HOSTS=.onrender.com,.vercel.app,localhost
```

### 3. Проверьте WebSocket

Откройте браузер консоль и проверьте:
- ✅ REST API подключается
- ✅ WebSocket подключается (wss://)

---

## 📝 Конфигурационные файлы

Все файлы уже созданы:
- ✅ `frontend/vercel.json` - конфигурация Vercel
- ✅ `frontend/src/config.js` - environment variables

---

## 🧪 Тестирование локально

Перед деплоем можете протестировать production build:

```bash
cd frontend
npm run build
npm run preview
```

Откройте http://localhost:4173/

---

## 🔧 Troubleshooting

**CORS Error:**
- Убедитесь что добавили домен фронтенда в `CORS_ALLOWED_ORIGINS` на Render

**WebSocket не подключается:**
- Проверьте что используете `wss://` (не `ws://`)
- Проверьте CORS настройки

**404 на роутах:**
- Для Vercel/Netlify добавьте файл `_redirects` если нужно
- Или настройте SPA fallback в конфиге хостинга

---

## 💰 Сравнение сервисов

| Сервис | Bandwidth | Build Minutes | Domains | Рекомендация |
|--------|-----------|---------------|---------|--------------|
| **Vercel** | 100GB | 6000 мин/мес | Unlimited | ⭐ Лучший |
| **Netlify** | 100GB | 300 мин/мес | Unlimited | Хороший |
| **Cloudflare** | Безлимит | 500 builds/мес | Unlimited | Очень быстрый |

**Рекомендация: Vercel** - лучший баланс функций и простоты.
