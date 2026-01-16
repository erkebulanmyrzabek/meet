from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Room
from .serializers import RoomSerializer


class RoomViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing video call rooms.
    """
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    lookup_field = 'code'

    def get_queryset(self):
        """Filter to show only active rooms."""
        return Room.objects.filter(is_active=True)

    @action(detail=False, methods=['post'])
    def create_room(self, request):
        """Create a new room."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def join(self, request, code=None):
        """Get room details for joining."""
        room = self.get_object()
        serializer = self.get_serializer(room)
        return Response(serializer.data)
