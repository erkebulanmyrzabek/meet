<template>
  <div class="room">
    <div class="room-header">
      <div class="room-info">
        <h2>Meeting: {{ code }}</h2>
        <button @click="copyRoomCode" class="btn-copy">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 2a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H4zm0 2h8v8H4V4z"/>
            <path d="M6 0a2 2 0 00-2 2h2V0z"/>
          </svg>
          {{ copied ? 'Copied!' : 'Copy Code' }}
        </button>
      </div>
    </div>

    <div class="video-grid" :class="{ 'single-video': !remoteStream }">
      <!-- Local Video -->
      <div class="video-container local">
        <video ref="localVideo" autoplay muted playsinline></video>
        <div class="video-label">You</div>
      </div>

      <!-- Remote Video -->
      <div v-if="remoteStream" class="video-container remote">
        <video ref="remoteVideo" autoplay playsinline></video>
        <div class="video-label">Participant</div>
      </div>
      
      <!-- Waiting State -->
      <div v-else class="waiting-container">
        <div class="waiting-content">
          <div class="spinner"></div>
          <p>Waiting for others to join...</p>
          <p class="waiting-code">Share code: <strong>{{ code }}</strong></p>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="controls">
      <button 
        @click="toggleAudio" 
        class="control-btn"
        :class="{ 'active': audioEnabled }"
      >
        <svg v-if="audioEnabled" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        </svg>
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
        </svg>
      </button>

      <button 
        @click="toggleVideo" 
        class="control-btn"
        :class="{ 'active': videoEnabled }"
      >
        <svg v-if="videoEnabled" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
        </svg>
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z"/>
        </svg>
      </button>

      <button @click="leaveCall" class="control-btn btn-hang-up">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.69.28-.26 0-.51-.1-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.28-.69.28-.26 0-.51-.1-.71-.29-.79-.74-1.68-1.36-2.66-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
        </svg>
      </button>
    </div>

    <div v-if="error" class="error-banner">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import webrtcService from '../services/webrtc';
import { roomService } from '../services/api';

export default {
  name: 'Room',
  props: {
    code: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const router = useRouter();
    const localVideo = ref(null);
    const remoteVideo = ref(null);
    const remoteStream = ref(null);
    const audioEnabled = ref(true);
    const videoEnabled = ref(true);
    const error = ref('');
    const copied = ref(false);

    const initializeCall = async () => {
      try {
        // Verify room exists
        await roomService.getRoomByCode(props.code);

        // Initialize WebRTC
        await webrtcService.init(props.code, localVideo.value);

        // Set up remote stream handler
        webrtcService.onRemoteStream = (stream) => {
          remoteStream.value = stream;
          if (remoteVideo.value) {
            remoteVideo.value.srcObject = stream;
          }
        };

        // Set up peer left handler
        webrtcService.onPeerLeft = () => {
          remoteStream.value = null;
          if (remoteVideo.value) {
            remoteVideo.value.srcObject = null;
          }
        };
      } catch (err) {
        error.value = 'Failed to join the meeting. Please check your camera and microphone permissions.';
        console.error('Error initializing call:', err);
      }
    };

    const toggleAudio = () => {
      audioEnabled.value = webrtcService.toggleAudio();
    };

    const toggleVideo = () => {
      videoEnabled.value = webrtcService.toggleVideo();
    };

    const leaveCall = () => {
      webrtcService.cleanup();
      router.push('/');
    };

    const copyRoomCode = async () => {
      try {
        await navigator.clipboard.writeText(props.code);
        copied.value = true;
        setTimeout(() => {
          copied.value = false;
        }, 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    };

    onMounted(() => {
      initializeCall();
    });

    onBeforeUnmount(() => {
      webrtcService.cleanup();
    });

    return {
      localVideo,
      remoteVideo,
      remoteStream,
      audioEnabled,
      videoEnabled,
      error,
      copied,
      toggleAudio,
      toggleVideo,
      leaveCall,
      copyRoomCode,
    };
  },
};
</script>

<style scoped>
.room {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  color: white;
}

.room-header {
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.room-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
}

.room-info h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.btn-copy {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-copy:hover {
  background: rgba(255, 255, 255, 0.2);
}

.video-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.video-grid.single-video {
  grid-template-columns: 1fr;
}

.video-container {
  position: relative;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.video-container video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-label {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
}

.waiting-container {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
}

.waiting-content {
  text-align: center;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.waiting-content p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0.5rem 0;
}

.waiting-code {
  font-size: 0.9rem;
}

.waiting-code strong {
  color: #667eea;
  font-family: monospace;
  font-size: 1.1rem;
}

.controls {
  padding: 1.5rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.control-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.control-btn.active {
  background: #667eea;
}

.btn-hang-up {
  background: #ef4444;
}

.btn-hang-up:hover {
  background: #dc2626;
}

.error-banner {
  padding: 1rem;
  background: rgba(239, 68, 68, 0.2);
  border-top: 2px solid #ef4444;
  text-align: center;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .video-grid {
    grid-template-columns: 1fr;
  }
  
  .room-info {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style>
