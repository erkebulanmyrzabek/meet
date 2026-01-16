# Video Call Application 🎥

A Google Meet-like video call application built with Django REST Framework and Vue.js. Features WebRTC peer-to-peer video calling with a modern, beautiful UI.

## Features

- 📹 **Real-time Video Calls**: HD video calling using WebRTC
- 🎤 **Audio/Video Controls**: Toggle microphone and camera
- 🔗 **Easy Room Sharing**: Share meeting codes to invite participants
- 🎨 **Modern UI**: Beautiful gradient design with smooth animations
- 🔒 **Secure**: Peer-to-peer connections with STUN servers

## Tech Stack

### Backend
- Django 5.0
- Django REST Framework
- Django Channels (WebSocket support)
- SQLite database

### Frontend
- Vue.js 3
- Vue Router
- Axios
- WebRTC
- Vite

## Project Structure

```
meet/
├── backend/                 # Django backend
│   ├── settings.py
│   ├── urls.py
│   └── asgi.py             # ASGI config for WebSocket
├── rooms/                   # Rooms app
│   ├── models.py           # Room model
│   ├── views.py            # REST API views
│   ├── consumers.py        # WebSocket consumer
│   └── routing.py          # WebSocket routing
├── frontend/               # Vue.js frontend
│   ├── src/
│   │   ├── views/          # Page components
│   │   ├── services/       # API and WebRTC services
│   │   ├── router/         # Vue Router config
│   │   └── config.js       # API configuration
│   └── package.json
├── requirements.txt        # Python dependencies
└── README.md
```

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Install Python dependencies**:
```bash
pip install -r requirements.txt
```

2. **Run migrations**:
```bash
python manage.py migrate
```

3. **Create a superuser** (optional, for admin access):
```bash
python manage.py createsuperuser
```

4. **Start the Django development server**:
```bash
daphne -b 0.0.0.0 -p 8000 backend.asgi:application
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**:
```bash
cd frontend
```

2. **Install dependencies** (if not already installed):
```bash
npm install
```

3. **Start the development server**:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Usage

1. **Create a new meeting**:
   - Open the app in your browser
   - Click "New Meeting"
   - You'll be redirected to a room with a unique code

2. **Join a meeting**:
   - Enter the meeting code on the home page
   - Click "Join"

3. **During the call**:
   - Toggle your microphone and camera
   - Copy the room code to share with others
   - Click the red button to leave the call

## How It Works

1. **Room Creation**: Frontend calls REST API to create a room with a unique code
2. **WebSocket Connection**: When joining, client connects to WebSocket signaling server
3. **WebRTC Handshake**: Peers exchange offer/answer/ICE candidates through WebSocket
4. **P2P Connection**: Direct peer-to-peer video/audio connection established
5. **Media Streaming**: Video and audio streams are exchanged between peers

## Development Notes

- The app currently supports 1-on-1 video calls
- Uses Google's public STUN servers for NAT traversal
- In-memory channel layer for WebSocket (development only)
- For production, use Redis channel layer and TURN servers

## API Endpoints

### REST API
- `POST /api/rooms/` - Create a new room
- `GET /api/rooms/{code}/` - Get room details
- `GET /api/rooms/{code}/join/` - Join a room

### WebSocket
- `ws://localhost:8000/ws/room/{code}/` - Signaling endpoint

## Future Enhancements

- [ ] Support for multiple participants (3+ people)
- [ ] Screen sharing
- [ ] Chat functionality
- [ ] Recording capabilities
- [ ] Virtual backgrounds
- [ ] Reaction emojis

## License

MIT License

## Credits

Built with ❤️ using Django and Vue.js
