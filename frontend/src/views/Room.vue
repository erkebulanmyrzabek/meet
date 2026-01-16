<template>
  <div class="room">
    <header class="header">
      <div class="room-info">
        <span class="room-code">{{ code }}</span>
        <button @click="copyRoomCode" class="btn-copy">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 2a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H4z" stroke="currentColor" fill="none"/>
          </svg>
          {{ copied ? 'Copied' : 'Copy' }}
        </button>
      </div>
    </header>

    <div class="video-container">
      <div class="video-grid" :class="{ 'single': !remoteStream, 'has-focus': focusedVideo }">
        <!-- Remote Video (or waiting state) -->
        <div 
          class="video-wrapper primary" 
          :class="{ 'focused': focusedVideo === 'remote', 'minimized': focusedVideo === 'local' }"
          @click="remoteStream && toggleFocus('remote')"
        >
          <video v-if="remoteStream" ref="remoteVideo" autoplay playsinline class="video"></video>
          <div v-else class="waiting">
            <div class="spinner"></div>
            <p>Waiting for participant...</p>
          </div>
          <div v-if="remoteStream" class="label">Participant</div>
        </div>

        <!-- Local Video (picture-in-picture style when remote exists) -->
        <div 
          class="video-wrapper" 
          :class="{ 'pip': remoteStream && !focusedVideo, 'focused': focusedVideo === 'local', 'minimized': focusedVideo === 'remote' }"
          @click="toggleFocus('local')"
        >
          <video ref="localVideo" autoplay muted playsinline class="video mirror"></video>
          <div class="label">You</div>
        </div>
      </div>
    </div>

    <footer class="controls">
      <button 
        @click="toggleAudio" 
        class="control-btn"
        :class="{ 'active': audioEnabled }"
        :title="audioEnabled ? 'Mute' : 'Unmute'"
      >
        <svg v-if="audioEnabled" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zM15 11.17L9 5.17V5c0-1.66 1.34-3 3-3s3 1.34 3 3v6.17zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03 .65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
        </svg>
      </button>

      <button 
        @click="toggleVideo" 
        class="control-btn"
        :class="{ 'active': videoEnabled }"
        :title="videoEnabled ? 'Turn off camera' : 'Turn on camera'"
      >
        <svg v-if="videoEnabled" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z"/>
        </svg>
      </button>

      <button @click="leaveCall" class="control-btn leave-btn" title="Leave call">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.69.28-.26 0-.51-.1-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.28-.69.28-.26 0-.51-.1-.71-.29-.79-.74-1.68-1.36-2.66-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
        </svg>
      </button>
    </footer>

    <div v-if="error" class="error-banner">{{ error }}</div>
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
    const focusedVideo = ref(null); // 'local' | 'remote' | null

    const toggleFocus = (videoType) => {
      if (focusedVideo.value === videoType) {
        focusedVideo.value = null; // Exit fullscreen
      } else {
        focusedVideo.value = videoType; // Enter fullscreen
      }
    };

    const initializeCall = async () => {
      try {
        await roomService.getRoomByCode(props.code);
        await webrtcService.init(props.code, localVideo.value);

        webrtcService.onRemoteStream = (stream) => {
          remoteStream.value = stream;
          if (remoteVideo.value) {
            remoteVideo.value.srcObject = stream;
          }
        };

        webrtcService.onPeerLeft = () => {
          remoteStream.value = null;
          if (remoteVideo.value) {
            remoteVideo.value.srcObject = null;
          }
        };
      } catch (err) {
        error.value = 'Failed to join the meeting.';
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
      focusedVideo,
      toggleFocus,
      toggleAudio,
      toggleVideo,
      leaveCall,
      copyRoomCode,
    };
  },
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.room {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  color: white;
}

.header {
  padding: 1rem 1.5rem;
  background: rgba(0, 0, 0, 0.5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.room-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.room-code {
  font-size: 0.875rem;
  font-family: 'Monaco', 'Courier New', monospace;
  color: #d4d4d4;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
}

.btn-copy {
  padding: 0.5rem 0.875rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: white;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-family: inherit;
}

.btn-copy:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.video-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #000;
}

.video-grid {
  width: 100%;
  height: 100%;
  display: grid;
  gap: 0.5rem;
  padding: 0.5rem;
}

.video-grid.single {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}

.video-grid:not(.single) {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}

.video-wrapper {
  position: relative;
  background: #262626;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.video-wrapper:hover {
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.video-wrapper.primary {
  grid-row: 1;
  grid-column: 1;
}

.video-wrapper.pip {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  width: 200px;
  height: 150px;
  z-index: 10;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

/* Focused state - takes full grid */
.video-wrapper.focused {
  position: fixed;
  top: 4rem;
  left: 0;
  right: 0;
  bottom: 5rem;
  width: 100%;
  height: calc(100vh - 9rem);
  z-index: 20;
  border-radius: 0;
}

/* Minimized state - small pip in corner */
.video-wrapper.minimized {
  position: fixed;
  bottom: 6rem;
  right: 1rem;
  width: 160px;
  height: 120px;
  z-index: 15;
}

.video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mirror {
  transform: scaleX(-1);
}

.label {
  position: absolute;
  bottom: 0.75rem;
  left: 0.75rem;
  padding: 0.375rem 0.75rem;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 4px;
  font-size: 0.8125rem;
  font-weight: 500;
}

.waiting {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: #a3a3a3;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.waiting p {
  margin: 0;
  font-size: 0.875rem;
}

.controls {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  background: rgba(0, 0, 0, 0.5);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.control-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.control-btn:active {
  transform: scale(0.95);
}

.control-btn.active {
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.leave-btn {
  background: #dc2626;
}

.leave-btn:hover {
  background: #b91c1c;
}

.error-banner {
  position: absolute;
  top: 5rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.875rem 1.25rem;
  background: #dc2626;
  border-radius: 6px;
  font-size: 0.875rem;
  max-width: 90%;
  text-align: center;
  z-index: 100;
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .header {
    padding: 0.875rem 1rem;
  }

  .room-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .video-grid {
    padding: 0.25rem;
    gap: 0.25rem;
  }

  .video-wrapper.pip {
    width: 120px;
    height: 90px;
    bottom: 5rem;
    right: 0.5rem;
  }

  .controls {
    padding: 0.875rem 1rem;
  }

  .control-btn {
    width: 56px;
    height: 56px;
  }

  .label {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    bottom: 0.5rem;
    left: 0.5rem;
  }
}

@media (max-width: 380px) {
  .room-code {
    font-size: 0.75rem;
    padding: 0.375rem 0.5rem;
  }

  .btn-copy {
    padding: 0.375rem 0.625rem;
    font-size: 0.75rem;
  }

  .control-btn {
    width: 52px;
    height: 52px;
  }

  .video-wrapper.pip {
    width: 100px;
    height: 75px;
  }
}

/* Landscape mobile */
@media (max-width: 896px) and (orientation: landscape) {
  .video-wrapper.pip {
    width: 160px;
    height: 120px;
    bottom: 0.5rem;
  }
}
</style>
