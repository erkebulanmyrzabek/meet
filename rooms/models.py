from django.db import models
import uuid


class Room(models.Model):
    """
    Model representing a video call room.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=20, unique=True, db_index=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Room {self.code}"

    @classmethod
    def generate_unique_code(cls):
        """Generate a unique room code."""
        import random
        import string
        while True:
            code = ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))
            if not cls.objects.filter(code=code).exists():
                return code
