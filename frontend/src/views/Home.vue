<template>
  <div class="home">
    <div class="hero">
      <div class="logo">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="60" height="60" rx="12" fill="url(#gradient)"/>
          <path d="M20 25L30 20L40 25V35L30 40L20 35V25Z" fill="white" opacity="0.9"/>
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="60" y2="60">
              <stop offset="0%" stop-color="#667eea"/>
              <stop offset="100%" stop-color="#764ba2"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <h1>Video Meetings for Everyone</h1>
      <p class="subtitle">Connect, collaborate, and communicate with premium video calls</p>
      
      <div class="actions">
        <button @click="createNewMeeting" class="btn btn-primary" :disabled="loading">
          <svg v-if="!loading" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
          </svg>
          <span v-if="loading">Creating...</span>
          <span v-else>New Meeting</span>
        </button>
        
        <div class="divider">
          <span>or</span>
        </div>
        
        <div class="join-form">
          <input 
            v-model="roomCode" 
            type="text" 
            placeholder="Enter meeting code"
            @keyup.enter="joinMeeting"
            class="input-code"
          />
          <button @click="joinMeeting" class="btn btn-secondary" :disabled="!roomCode || loading">
            Join
          </button>
        </div>
      </div>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
    
    <div class="features">
      <div class="feature">
        <div class="feature-icon">🎥</div>
        <h3>HD Video</h3>
        <p>Crystal clear video quality</p>
      </div>
      <div class="feature">
        <div class="feature-icon">🔒</div>
        <h3>Secure</h3>
        <p>End-to-end encrypted calls</p>
      </div>
      <div class="feature">
        <div class="feature-icon">⚡</div>
        <h3>Fast</h3>
        <p>Instant connection, no delays</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { roomService } from '../services/api';

export default {
  name: 'Home',
  setup() {
    const router = useRouter();
    const roomCode = ref('');
    const loading = ref(false);
    const error = ref('');

    const createNewMeeting = async () => {
      loading.value = true;
      error.value = '';
      
      try {
        const room = await roomService.createRoom('Quick Meeting');
        router.push(`/room/${room.code}`);
      } catch (err) {
        error.value = 'Failed to create meeting. Please try again.';
        console.error('Error creating room:', err);
      } finally {
        loading.value = false;
      }
    };

    const joinMeeting = async () => {
      if (!roomCode.value) return;
      
      loading.value = true;
      error.value = '';
      
      try {
        await roomService.getRoomByCode(roomCode.value);
        router.push(`/room/${roomCode.value}`);
      } catch (err) {
        error.value = 'Meeting not found. Please check the code.';
        console.error('Error joining room:', err);
      } finally {
        loading.value = false;
      }
    };

    return {
      roomCode,
      loading,
      error,
      createNewMeeting,
      joinMeeting,
    };
  },
};
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.hero {
  text-align: center;
  max-width: 600px;
  margin-bottom: 4rem;
}

.logo {
  margin-bottom: 2rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

h1 {
  font-size: 3rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 3rem;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: white;
  color: #667eea;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.3);
}

.join-form {
  display: flex;
  gap: 1rem;
}

.input-code {
  flex: 1;
  padding: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.input-code::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.input-code:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.15);
}

.error-message {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  max-width: 800px;
  width: 100%;
}

.feature {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
}

.feature:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature h3 {
  color: white;
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.feature p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  h1 {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }
  
  .join-form {
    flex-direction: column;
  }
}
</style>
