/* Audio Recording JavaScript for Golo */

// Audio recording state
const AudioRecorder = {
    mediaRecorder: null,
    audioChunks: [],
    stream: null,
    isRecording: false,
    startTime: null,
    timer: null,
    currentAudioUrl: null,

    async init() {
        try {
            // Check if browser supports MediaRecorder
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Audio recording not supported in this browser');
            }

            // Request microphone permission
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } 
            });

            console.log('Audio recording initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing audio recording:', error);
            this.showAudioError(error.message);
            return false;
        }
    },

    async startRecording() {
        if (this.isRecording) {
            console.log('Already recording');
            return;
        }

        try {
            // Initialize if not already done
            if (!this.stream) {
                const success = await this.init();
                if (!success) return;
            }

            // Clear previous recording
            this.audioChunks = [];
            GoloApp.audioBlob = null;

            // Create MediaRecorder
            this.mediaRecorder = new MediaRecorder(this.stream, {
                mimeType: this.getSupportedMimeType()
            });

            // Set up event handlers
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.handleRecordingStop();
            };

            this.mediaRecorder.onerror = (event) => {
                console.error('MediaRecorder error:', event.error);
                this.showAudioError('Recording error: ' + event.error);
            };

            // Start recording
            this.mediaRecorder.start(100); // Collect data every 100ms
            this.isRecording = true;
            this.startTime = Date.now();

            this.updateUI('recording');
            this.startTimer();

            console.log('Recording started');
            showNotification('Recording started', 'info');

        } catch (error) {
            console.error('Error starting recording:', error);
            this.showAudioError('Failed to start recording: ' + error.message);
        }
    },

    stopRecording() {
        if (!this.isRecording || !this.mediaRecorder) {
            console.log('Not currently recording');
            return;
        }

        try {
            this.mediaRecorder.stop();
            this.isRecording = false;
            this.stopTimer();

            console.log('Recording stopped');
            showNotification('Recording stopped', 'info');

        } catch (error) {
            console.error('Error stopping recording:', error);
            this.showAudioError('Failed to stop recording: ' + error.message);
        }
    },

    handleRecordingStop() {
        try {
            // Create blob from chunks
            const mimeType = this.getSupportedMimeType();
            GoloApp.audioBlob = new Blob(this.audioChunks, { type: mimeType });

            // Validate blob
            if (GoloApp.audioBlob.size === 0) {
                throw new Error('Recording failed - no audio data captured');
            }

            // Calculate duration
            const duration = (Date.now() - this.startTime) / 1000;

            // Update UI
            this.updateUI('stopped');
            this.displayAudioPlayer(GoloApp.audioBlob, duration);

            // Enable continue button
            const continueBtn = document.getElementById('continue-recording');
            if (continueBtn) {
                continueBtn.disabled = false;
            }

            console.log(`Recording completed: ${duration.toFixed(2)}s, ${GoloApp.audioBlob.size} bytes, type: ${mimeType}`);
            showNotification('Recording completed successfully!', 'success');
            
        } catch (error) {
            console.error('Error processing recording:', error);
            this.showAudioError('Failed to process recording: ' + error.message);
            this.updateUI('stopped');
        }
    },

    getSupportedMimeType() {
        const types = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/ogg;codecs=opus', 
            'audio/ogg',
            'audio/mp4',
            'audio/wav'
        ];

        for (let type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                console.log('Using MIME type:', type);
                return type;
            }
        }

        console.warn('No supported MIME type found, using fallback');
        return 'audio/webm'; // Fallback
    },

    updateUI(state) {
        const recordBtn = document.getElementById('record-btn');
        const recordingIndicator = document.getElementById('recording-indicator');

        if (!recordBtn || !recordingIndicator) return;

        if (state === 'recording') {
            recordBtn.innerHTML = '<i class="fas fa-stop"></i><span>Stop Recording</span>';
            recordBtn.classList.add('recording');
            recordingIndicator.classList.add('active');
            recordingIndicator.style.display = 'flex';
        } else {
            recordBtn.innerHTML = '<i class="fas fa-microphone"></i><span>Start Recording</span>';
            recordBtn.classList.remove('recording');
            recordingIndicator.classList.remove('active');
            recordingIndicator.style.display = 'none';
        }
    },

    displayAudioPlayer(audioBlob, duration) {
        const audioPlayerSection = document.getElementById('audio-player-section');
        const audioPlayer = document.getElementById('audio-player');
        const durationElement = document.getElementById('recording-duration');

        if (!audioPlayerSection || !audioPlayer) return;

        // Verify blob type
        console.log('Audio blob type:', audioBlob.type, 'Size:', audioBlob.size);

        // Clean up any previous audio URL
        if (this.currentAudioUrl) {
            URL.revokeObjectURL(this.currentAudioUrl);
            this.currentAudioUrl = null;
        }

        // Create audio URL
        const audioUrl = URL.createObjectURL(audioBlob);
        audioPlayer.src = audioUrl;
        
        // Force load the audio
        audioPlayer.load();

        // Add error handling
        audioPlayer.onerror = (e) => {
            console.error('Audio playback error:', e);
            console.error('Audio error details:', audioPlayer.error);
            showNotification('Audio playback failed. Try a different browser or check microphone permissions.', 'error');
            
            // Show fallback message
            if (durationElement) {
                durationElement.textContent = `Recording failed - Duration: ${this.formatDuration(duration)}`;
            }
        };

        // Handle successful load
        audioPlayer.onloadeddata = () => {
            console.log('Audio loaded successfully');
            if (durationElement) {
                durationElement.textContent = `Duration: ${this.formatDuration(duration)}`;
            }
        };

        // Update duration display immediately
        if (durationElement) {
            durationElement.textContent = `Duration: ${this.formatDuration(duration)}`;
        }

        // Show audio player section
        audioPlayerSection.style.display = 'block';

        // Store URL for cleanup later
        this.currentAudioUrl = audioUrl;
    },

    startTimer() {
        const durationElement = document.getElementById('recording-duration');
        if (!durationElement) return;

        this.timer = setInterval(() => {
            if (this.isRecording && this.startTime) {
                const elapsed = (Date.now() - this.startTime) / 1000;
                durationElement.textContent = `Recording: ${this.formatDuration(elapsed)}`;
            }
        }, 100);
    },

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        // Clear the recording indicator text
        const durationElement = document.getElementById('recording-duration');
        if (durationElement) {
            durationElement.textContent = 'Duration: 0:00';
        }
    },

    showAudioError(message) {
        showNotification(message, 'error');
        
        // Fallback to file upload
        this.showFileUploadOption();
    },

    showFileUploadOption() {
        const recordingSection = document.querySelector('.recording-section');
        if (!recordingSection) return;

        const fallbackHtml = `
            <div class="audio-fallback" style="margin-top: 2rem; padding: 1.5rem; background: var(--accent-color); border-radius: var(--border-radius);">
                <h4>Audio Recording Not Available</h4>
                <p>Please upload an audio file instead:</p>
                <input type="file" id="audio-file-upload" accept="audio/*" style="margin-top: 1rem;">
            </div>
        `;

        recordingSection.insertAdjacentHTML('beforeend', fallbackHtml);

        // Handle file upload
        const fileInput = document.getElementById('audio-file-upload');
        if (fileInput) {
            fileInput.addEventListener('change', this.handleFileUpload.bind(this));
        }
    },

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('audio/')) {
            showNotification('Please select an audio file', 'error');
            return;
        }

        // Use uploaded file as audio blob
        GoloApp.audioBlob = file;

        // Create audio player for uploaded file
        const audioUrl = URL.createObjectURL(file);
        
        // Get file duration (approximate)
        const audio = new Audio(audioUrl);
        audio.addEventListener('loadedmetadata', () => {
            this.displayAudioPlayer(file, audio.duration);
            
            // Enable continue button
            const continueBtn = document.getElementById('continue-recording');
            if (continueBtn) {
                continueBtn.disabled = false;
            }
        });

        showNotification('Audio file uploaded successfully', 'success');
    },

    cleanup() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        // Clean up audio URL
        if (this.currentAudioUrl) {
            URL.revokeObjectURL(this.currentAudioUrl);
            this.currentAudioUrl = null;
        }

        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.startTime = null;
    },

    formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
};

// Global function for the record button
function toggleRecording() {
    if (AudioRecorder.isRecording) {
        AudioRecorder.stopRecording();
    } else {
        AudioRecorder.startRecording();
    }
}

// Initialize audio recording when needed
document.addEventListener('DOMContentLoaded', function() {
    // Pre-initialize audio permissions when user reaches recording step
    const recordBtn = document.getElementById('record-btn');
    if (recordBtn) {
        recordBtn.addEventListener('click', toggleRecording);
    }
});

// Cleanup when leaving the page
window.addEventListener('beforeunload', function() {
    AudioRecorder.cleanup();
});

// Add audio-specific styles
const audioStyles = document.createElement('style');
audioStyles.textContent = `
    .recording-controls {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        margin: 2rem 0;
    }

    .record-btn {
        background: linear-gradient(135deg, var(--primary-color), #e64a4f);
        color: white;
        border: none;
        padding: 1rem 2rem;
        border-radius: 50px;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.3s;
        box-shadow: 0 4px 15px rgba(255, 90, 95, 0.3);
        min-width: 180px;
        justify-content: center;
    }

    .record-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(255, 90, 95, 0.4);
    }

    .record-btn.recording {
        background: var(--error-color);
        animation: recording-pulse 1.5s infinite;
    }

    @keyframes recording-pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }

    .recording-indicator {
        display: none;
        align-items: center;
        gap: 0.5rem;
        color: var(--error-color);
        font-weight: 500;
        animation: fade-in 0.3s ease;
    }

    .recording-indicator.active {
        display: flex;
    }

    .pulse-dot {
        width: 12px;
        height: 12px;
        background-color: var(--error-color);
        border-radius: 50%;
        animation: pulse-dot 1s infinite;
    }

    @keyframes pulse-dot {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
    }

    @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    .audio-player-section {
        margin-top: 2rem;
        padding: 1.5rem;
        background: white;
        border-radius: var(--border-radius);
        border: 2px solid var(--success-color);
        text-align: center;
        box-shadow: 0 2px 10px rgba(76, 175, 80, 0.1);
    }

    .audio-player-section audio {
        width: 100%;
        margin-bottom: 1rem;
        max-width: 400px;
    }

    .recording-info {
        color: var(--secondary-color);
        font-size: 0.9rem;
    }

    .audio-fallback {
        text-align: center;
    }

    .audio-fallback h4 {
        color: var(--warning-color);
        margin-bottom: 0.5rem;
    }

    .audio-fallback input[type="file"] {
        border: 2px dashed var(--border-color);
        padding: 1rem;
        border-radius: var(--border-radius);
        background: white;
        cursor: pointer;
    }

    .audio-fallback input[type="file"]:hover {
        border-color: var(--primary-color);
    }
`;
document.head.appendChild(audioStyles);