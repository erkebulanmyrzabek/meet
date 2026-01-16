import json
from channels.generic.websocket import AsyncWebsocketConsumer


class SignalingConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for handling WebRTC signaling.
    Manages peer-to-peer connections through room-based channels.
    """

    async def connect(self):
        """Handle WebSocket connection."""
        self.room_code = self.scope['url_route']['kwargs']['room_code']
        self.room_group_name = f'room_{self.room_code}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Notify others that a new peer joined
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'peer_joined',
                'peer_id': self.channel_name
            }
        )

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        # Notify others that peer left
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'peer_left',
                'peer_id': self.channel_name
            }
        )

        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        """
        Receive message from WebSocket.
        Handle WebRTC signaling messages: offer, answer, ice-candidate
        """
        try:
            data = json.loads(text_data)
            message_type = data.get('type')

            # Broadcast to all peers in the room except sender
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'signaling_message',
                    'message': data,
                    'sender': self.channel_name
                }
            )
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON'
            }))

    async def signaling_message(self, event):
        """Send signaling message to WebSocket."""
        # Don't send the message back to the sender
        if event['sender'] != self.channel_name:
            await self.send(text_data=json.dumps({
                'type': 'signaling',
                'message': event['message'],
                'peer_id': event['sender']
            }))

    async def peer_joined(self, event):
        """Notify that a new peer joined."""
        if event['peer_id'] != self.channel_name:
            await self.send(text_data=json.dumps({
                'type': 'peer_joined',
                'peer_id': event['peer_id']
            }))

    async def peer_left(self, event):
        """Notify that a peer left."""
        if event['peer_id'] != self.channel_name:
            await self.send(text_data=json.dumps({
                'type': 'peer_left',
                'peer_id': event['peer_id']
            }))
