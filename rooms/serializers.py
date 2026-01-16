from rest_framework import serializers
from .models import Room


class RoomSerializer(serializers.ModelSerializer):
    """
    Serializer for Room model.
    """
    class Meta:
        model = Room
        fields = ['id', 'code', 'name', 'created_at', 'is_active']
        read_only_fields = ['id', 'code', 'created_at']

    def create(self, validated_data):
        """Create a new room with a unique code."""
        validated_data['code'] = Room.generate_unique_code()
        return super().create(validated_data)
