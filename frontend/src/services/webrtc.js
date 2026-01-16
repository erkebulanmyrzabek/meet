import config from '../config';

class WebRTCService {
    constructor() {
        this.ws = null;
        this.peerConnection = null;
        this.localStream = null;
        this.remoteStream = null;
        this.onRemoteStream = null;
        this.onPeerLeft = null;
        this.roomCode = null;
        this.isInitiator = false;

        // WebRTC configuration with STUN and TURN servers for NAT traversal
        this.configuration = {
            iceServers: [
                // Google STUN servers
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                // Free TURN servers from Metered (helps with NAT/Firewall)
                {
                    urls: 'turn:openrelay.metered.ca:80',
                    username: 'openrelayproject',
                    credential: 'openrelayproject',
                },
                {
                    urls: 'turn:openrelay.metered.ca:443',
                    username: 'openrelayproject',
                    credential: 'openrelayproject',
                },
                {
                    urls: 'turn:openrelay.metered.ca:443?transport=tcp',
                    username: 'openrelayproject',
                    credential: 'openrelayproject',
                },
            ],
            iceCandidatePoolSize: 10,
        };
    }

    async init(roomCode, localVideoElement) {
        this.roomCode = roomCode;

        // Get local media stream
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });

            if (localVideoElement) {
                localVideoElement.srcObject = this.localStream;
            }

            // Connect to WebSocket signaling server
            await this.connectWebSocket();

            return this.localStream;
        } catch (error) {
            console.error('Error accessing media devices:', error);
            throw error;
        }
    }

    connectWebSocket() {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(`${config.wsURL}/room/${this.roomCode}/`);

            this.ws.onopen = () => {
                console.log('WebSocket connected');
                resolve();
            };

            this.ws.onmessage = async (event) => {
                const data = JSON.parse(event.data);
                await this.handleSignalingMessage(data);
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                reject(error);
            };

            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
            };
        });
    }

    async handleSignalingMessage(data) {
        const { type, message, peer_id } = data;

        switch (type) {
            case 'peer_joined':
                console.log('Peer joined:', peer_id);
                // Become initiator and create offer
                this.isInitiator = true;
                await this.createPeerConnection();
                await this.createOffer();
                break;

            case 'signaling':
                await this.handleSignaling(message);
                break;

            case 'peer_left':
                console.log('Peer left:', peer_id);
                this.closePeerConnection();
                if (this.onPeerLeft) {
                    this.onPeerLeft();
                }
                break;
        }
    }

    async handleSignaling(message) {
        const { type, sdp, candidate } = message;

        if (!this.peerConnection) {
            await this.createPeerConnection();
        }

        switch (type) {
            case 'offer':
                await this.peerConnection.setRemoteDescription(new RTCSessionDescription({ type, sdp }));
                const answer = await this.peerConnection.createAnswer();
                await this.peerConnection.setLocalDescription(answer);
                this.sendSignaling({
                    type: 'answer',
                    sdp: answer.sdp,
                });
                break;

            case 'answer':
                await this.peerConnection.setRemoteDescription(new RTCSessionDescription({ type, sdp }));
                break;

            case 'ice-candidate':
                if (candidate) {
                    await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                }
                break;
        }
    }

    async createPeerConnection() {
        this.peerConnection = new RTCPeerConnection(this.configuration);

        // Add local stream tracks to peer connection
        this.localStream.getTracks().forEach((track) => {
            this.peerConnection.addTrack(track, this.localStream);
        });

        // Handle ICE candidates
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.sendSignaling({
                    type: 'ice-candidate',
                    candidate: event.candidate,
                });
            }
        };

        // Handle remote stream
        this.peerConnection.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                this.remoteStream = event.streams[0];
                if (this.onRemoteStream) {
                    this.onRemoteStream(this.remoteStream);
                }
            }
        };

        // Handle connection state
        this.peerConnection.onconnectionstatechange = () => {
            const state = this.peerConnection.connectionState;
            console.log('Connection state:', state);

            if (state === 'failed' || state === 'disconnected') {
                console.error('❌ Connection failed. ICE state:', this.peerConnection.iceConnectionState);
                console.error('Signaling state:', this.peerConnection.signalingState);
            }

            if (state === 'connected') {
                console.log('✅ WebRTC connection established!');
            }
        };

        // Monitor ICE connection state
        this.peerConnection.oniceconnectionstatechange = () => {
            console.log('ICE connection state:', this.peerConnection.iceConnectionState);
        };
    }

    async createOffer() {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        this.sendSignaling({
            type: 'offer',
            sdp: offer.sdp,
        });
    }

    sendSignaling(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
    }

    toggleAudio() {
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                return audioTrack.enabled;
            }
        }
        return false;
    }

    toggleVideo() {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                return videoTrack.enabled;
            }
        }
        return false;
    }

    closePeerConnection() {
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }
        this.remoteStream = null;
    }

    cleanup() {
        // Stop local stream
        if (this.localStream) {
            this.localStream.getTracks().forEach((track) => track.stop());
            this.localStream = null;
        }

        // Close peer connection
        this.closePeerConnection();

        // Close WebSocket
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

export default new WebRTCService();
