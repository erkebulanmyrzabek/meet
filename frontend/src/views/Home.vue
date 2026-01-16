<template>
  <div class="home">
    <div class="container">
      <header class="header">
        <div class="logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="6" y="6" width="20" height="20" rx="2" stroke="currentColor" stroke-width="2"/>
            <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
            <circle cx="20" cy="12" r="1.5" fill="currentColor"/>
            <path d="M12 20h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span>Meet</span>
        </div>
      </header>

      <main class="main">
        <h1>Video Meetings</h1>
        <p class="subtitle">Secure, simple video calls</p>

        <div class="actions">
          <button @click="createNewMeeting" class="btn btn-primary" :disabled="loading">
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
              class="input"
            />
            <button @click="joinMeeting" class="btn btn-secondary" :disabled="!roomCode || loading">
              Join
            </button>
          </div>
        </div>

        <div v-if="error" class="error">{{ error }}</div>
      </main>

      <footer class="footer">
        <p>Powered by WebRTC</p>
      </footer>
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
        const room = await roomService.createRoom('Meeting');
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
        error.value = 'Meeting not found.';
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
* {
  box-sizing: border-box;
}

.home {
  min-height: 100vh;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.container {
  width: 100%;
  max-width: 480px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e5e5;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #1a1a1a;
  font-size: 1.25rem;
  font-weight: 600;
}

.logo svg {
  color: #1a1a1a;
}

.main {
  padding: 2rem 1.5rem;
}

h1 {
  font-size: 1.875rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  color: #737373;
  font-size: 0.9375rem;
  margin: 0 0 2rem 0;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btn {
  width: 100%;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #1a1a1a;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #000;
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-secondary {
  background: white;
  color: #1a1a1a;
  border: 1px solid #d4d4d4;
}

.btn-secondary:hover:not(:disabled) {
  background: #fafafa;
  border-color: #a3a3a3;
}

.btn-secondary:active:not(:disabled) {
  transform: scale(0.98);
}

.divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #a3a3a3;
  font-size: 0.875rem;
  margin: 0.5rem 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e5e5e5;
}

.join-form {
  display: flex;
  gap: 0.75rem;
}

.input {
  flex: 1;
  padding: 0.875rem 1rem;
  border: 1px solid #d4d4d4;
  border-radius: 6px;
  font-size: 0.9375rem;
  font-family: inherit;
  transition: all 0.15s ease;
}

.input:focus {
  outline: none;
  border-color: #1a1a1a;
}

.input::placeholder {
  color: #a3a3a3;
}

.error {
  margin-top: 1rem;
  padding: 0.875rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #991b1b;
  font-size: 0.875rem;
}

.footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e5e5;
  text-align: center;
}

.footer p {
  margin: 0;
  color: #a3a3a3;
  font-size: 0.8125rem;
}

/* Mobile optimization */
@media (max-width: 640px) {
  .home {
    padding: 0;
    align-items: stretch;
  }

  .container {
    max-width: 100%;
    border-radius: 0;
    box-shadow: none;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  h1 {
    font-size: 1.5rem;
  }

  .join-form {
    flex-direction: column;
  }

  .btn-secondary {
    width: 100%;
  }
}

@media (max-width: 380px) {
  .header {
    padding: 1rem;
  }

  .main {
    padding: 1.5rem 1rem;
  }

  h1 {
    font-size: 1.375rem;
  }

  .subtitle {
    font-size: 0.875rem;
  }
}
</style>
