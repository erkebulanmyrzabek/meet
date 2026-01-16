# Настройка собственного TURN сервера (Metered)

## 🎯 Проблема

WebRTC не работает через NAT/firewall без TURN сервера. Получаете ошибку:
```
ICE connection state: failed
Connection state: failed
```

## ✅ Решение: Бесплатный TURN сервер

### Вариант 1: Metered.ca (РЕКОМЕНДУЮ)

**Бесплатно:** 50GB/месяц

1. Зарегистрируйтесь: https://www.metered.ca/tools/openrelay/
2. Получите credentials (username/password)
3. Замените в `frontend/src/services/webrtc.js`:

```javascript
{
  urls: 'turn:a.relay.metered.ca:80',
  username: 'ваш_username',  // Замените!
  credential: 'ваш_password', // Замените!
}
```

### Вариант 2: Twilio (Платно, но надежно)

1. https://www.twilio.com/stun-turn
2. $0.0004 за GB
3. Очень надежный

### Вариант 3: Свой TURN сервер (coturn)

Если есть VPS:
```bash
# Ubuntu
sudo apt-get install coturn
sudo nano /etc/turnserver.conf
```

## 🧪 Проверка TURN

После добавления TURN credentials:

1. Откройте https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/
2. Добавьте ваш TURN URL
3. Нажмите "Gather candidates"
4. Должны увидеть `relay` кандидаты

## 📝 Temporary Credentials (для теста)

**НЕ для продакшена!** Только тестирование:

```javascript
{
  urls: 'turn:numb.viagenie.ca',
  username: 'webrtc@live.com',
  credential: 'muazkh'
}
```

После теста зарегистрируйтесь на Metered!

## 🔒 Best Practices

1. **Не храните credentials в коде** - используйте environment variables
2. **Ротируйте пароли** регулярно
3. **Мониторьте usage** чтобы не превысить лимиты
4. **Используйте несколько TURN** серверов для fallback

## 💡 Environment Variables

В production используйте:

```javascript
// .env.production
VITE_TURN_USERNAME=your_username
VITE_TURN_PASSWORD=your_password

// webrtc.js
{
  urls: 'turn:a.relay.metered.ca:80',
  username: import.meta.env.VITE_TURN_USERNAME,
  credential: import.meta.env.VITE_TURN_PASSWORD,
}
```
