class BolnaWebCalling {
  constructor(config) {
    // Configuration options
    this.agentId = config.agentId;
    this.accessToken = config.accessToken;
    this.websocketHost = config.websocketHost;
    this.contextData = config.contextData || {};
    this.audioChunkSize = config.audioChunkSize || 4096;
    this.queueProcessingInterval = config.queueProcessingInterval || 100;
    
    // State variables
    this.isWebCallOngoing = false;
    this.isFirstAudioPacketReceived = false;
    this.websocket = null;
    this.outputAudioBufferSourceNode = null;
    this.isAcknowledgementReceived = false;
    this.audioOutputContext = new window.AudioContext();
    
    // Constants
    this.CHUNK = this.audioChunkSize;
    this.RATE = 16000;
    this.CHANNELS = 1;
    this.outputAudioQueue = new Queue();
    
    // Event callbacks
    this.onCallStateChange = config.onCallStateChange || function() {};
    this.onFirstAudioPacket = config.onFirstAudioPacket || function() {};
    this.onError = config.onError || function() {};
    this.onMediaPermissionGranted = config.onMediaPermissionGranted || function() {};
    this.onConnected = config.onConnected || function() {};
    this.onSocketOpen = config.onSocketOpen || function() {};
    this.onSocketClose = config.onSocketClose || function() {};
    this.onMicActive = config.onMicActive || function() {};
    this.onAudioOutputActive = config.onAudioOutputActive || function() {};
    this.onMessageReceived = config.onMessageReceived || function() {};
  }

  decodeAndPlayAudio(base64Packet) {
    console.log(`[Audio] Incoming audio packet. Size: ${base64Packet.length} characters`);
    return new Promise((resolve, reject) => {
      const arrayBuffer = this.base64ToArrayBuffer(base64Packet);

      this.audioOutputContext
        .decodeAudioData(arrayBuffer)
        .then((decodedData) => {
          console.log(`[Audio] Audio packet decoded successfully. Duration: ${decodedData.duration.toFixed(2)}s, Sample Rate: ${decodedData.sampleRate}Hz`);
          const source = this.audioOutputContext.createBufferSource();
          source.buffer = decodedData;
          source.connect(this.audioOutputContext.destination);

          this.onAudioOutputActive(true);

          source.onended = () => {
            console.log('[Audio] Audio playback ended');
            this.onAudioOutputActive(false);
            resolve();
          };
          source.start();

          this.outputAudioBufferSourceNode = source;
        })
        .catch((error) => {
          console.error('[Audio] Audio decode failure (EncodingError):', error);
          this.onAudioOutputActive(false);
          this.onError('audio_decoding_error', error);
          reject(error);
        });
    });
  }

  async processQueueMessages() {
    while (true) {
      if (!this.outputAudioQueue.isEmpty()) {
        const wsData = this.outputAudioQueue.dequeue();
        if (wsData == null) {
          continue;
        }

        if (wsData.type == 'audio') {
          if (!this.isFirstAudioPacketReceived) {
            this.isFirstAudioPacketReceived = true;
            this.onFirstAudioPacket();
          }

          try {
            await this.decodeAndPlayAudio(wsData.data);
          } catch (error) {
            console.error('Error decoding and playing audio:', error);
          }
        } else if (wsData.type == 'mark') {
          console.log('Sending mark event');
          this.websocket.send(JSON.stringify(wsData));
        }
      } else if (
        this.websocket &&
        this.websocket.readyState != WebSocket.OPEN
      ) {
        console.log(
          `Since websocket is closed hence breaking the loop in processQueueMessages`
        );
        break;
      }
      await this.sleep(this.queueProcessingInterval);
    }
  }

  clearSpeakerPlayback() {
    this.outputAudioQueue.clear();
    if (this.outputAudioBufferSourceNode) {
      this.outputAudioBufferSourceNode.stop();
      this.outputAudioBufferSourceNode = null;
    }
    this.onAudioOutputActive(false);
  }

  sendInitPacket() {
    const filteredUserData = {};
    if (this.contextData) {
      for (const key in this.contextData) {
        if (this.contextData[key] !== '') {
          filteredUserData[key] = this.contextData[key];
        }
      }
    }

    const initPacket = {
      type: 'init',
      meta_data: { 
        context_data: filteredUserData
      }
    }
    
    this.websocket.send(JSON.stringify(initPacket));
  }

  handleWebsocketMessage(wsData) {
    if (!this.isAcknowledgementReceived && wsData.type != 'ack') {
      console.log('Acknowledgement not received yet');
      return;
    }

    if (wsData.type == 'audio' || wsData.type == 'mark') {
      this.outputAudioQueue.enqueue(wsData);
    } else if (wsData.type == 'clear') {
      this.clearSpeakerPlayback();
    } else if (wsData.type == 'ack') {
      console.log('Acknowledgement received');
      this.isAcknowledgementReceived = true;
    }
  }

  initiateWebCall() {
    if (this.isWebCallOngoing) {
      console.log('Call already in progress');
      return;
    }

    // Explicitly resume audio context if suspended (browser security restrictions)
    if (this.audioOutputContext && this.audioOutputContext.state === 'suspended') {
      console.log('[Audio] Resuming audioOutputContext on user gesture...');
      this.audioOutputContext.resume().then(() => {
        console.log('[Audio] audioOutputContext successfully resumed.');
      }).catch(err => {
        console.error('[Audio] Failed to resume audioOutputContext:', err);
      });
    }
    
    this.isWebCallOngoing = true;
    this.onCallStateChange(true);
    
    const url = `${this.websocketHost}/web-call/v1/${this.agentId}?auth_token=${this.accessToken}&user_agent=web-call&enforce_streaming=true`;
    console.log(`Starting call ${url}`);

    const performWebsocketCloseEvents = (stream, processor) => {
      this.clearSpeakerPlayback();
      this.isWebCallOngoing = false;
      this.isFirstAudioPacketReceived = false;
      this.isAcknowledgementReceived = false;
      
      if (processor) {
        processor.disconnect();
      }
      
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      
      this.onMicActive(false);
      this.onSocketClose();
      this.onCallStateChange(false);
    };

    const constraints = {
      audio: {
        sampleRate: this.RATE,
        channelCount: this.CHANNELS,
      },
      video: false,
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        this.onMediaPermissionGranted();
        this.onMicActive(true);
        this.mediaStream = stream; // Store reference to track lifecycle
        
        const ws = new WebSocket(url);
        ws.onopen = () => {
          console.log('WebSocket connected.');
          this.onConnected(); // Notify browser connected
          this.onSocketOpen();
          this.processQueueMessages();
          this.sendInitPacket();
        };
        
        ws.onclose = () => {
          console.log('Websocket closed');
          performWebsocketCloseEvents(stream, processor);
        };
        
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          this.onMessageReceived(Date.now());
          this.handleWebsocketMessage(data);
        };
        
        ws.onerror = (error) => {
          console.error('Web call websocket error:', error);
          this.onError('websocket_error', error);
          performWebsocketCloseEvents(stream, processor);
        };
        
        this.websocket = ws;

        // Create an AudioContext with the desired sample rate
        const audioContext = new window.AudioContext({
          sampleRate: this.RATE,
        });
        this.audioInputContext = audioContext; // Store reference
        
        const source = audioContext.createMediaStreamSource(stream);
        const context = source.context;
        const processor = audioContext.createScriptProcessor(
          this.CHUNK,
          this.CHANNELS,
          this.CHANNELS
        );
        this.audioProcessor = processor; // Store reference
        
        processor.onaudioprocess = (audioProcessingEvent) => {
          const inputBuffer = audioProcessingEvent.inputBuffer;
          const inputData = inputBuffer.getChannelData(0);
          const int16Data = this.floatTo16BitPCM(inputData);
          const base64Data = this.arrayBufferToBase64(int16Data.buffer);

          if (ws.readyState === WebSocket.OPEN && this.isAcknowledgementReceived) {
            ws.send(JSON.stringify({ type: 'audio', data: base64Data }));
          }
        };

        // Connect the audio processing chain: source -> processor
        source.connect(processor);
        processor.connect(context.destination);
      })
      .catch((error) => {
        console.error('Error accessing microphone:', error);
        this.onError('microphone_access_error', error);
        this.isWebCallOngoing = false;
        this.onCallStateChange(false);
      });
  }

  endWebCall() {
    console.log('Call ended');
    this.isWebCallOngoing = false;
    this.onCallStateChange(false);
    this.isFirstAudioPacketReceived = false;
    this.isAcknowledgementReceived = false;

    if (this.websocket) {
      try {
        this.websocket.close();
      } catch (e) {
        console.error('Error closing websocket:', e);
      }
      this.websocket = null;
    }

    this.clearSpeakerPlayback();
    this.onSocketClose();

    // Release all active tracks, processors, and contexts
    if (this.audioProcessor) {
      try {
        this.audioProcessor.disconnect();
      } catch (e) {
        console.error('Error disconnecting audio processor:', e);
      }
      this.audioProcessor = null;
    }

    if (this.mediaStream) {
      try {
        this.mediaStream.getTracks().forEach((track) => track.stop());
      } catch (e) {
        console.error('Error stopping stream tracks:', e);
      }
      this.mediaStream = null;
    }
    this.onMicActive(false);

    if (this.audioInputContext) {
      try {
        this.audioInputContext.close();
      } catch (e) {
        console.error('Error closing audio input context:', e);
      }
      this.audioInputContext = null;
    }

    if (this.audioOutputContext) {
      try {
        this.audioOutputContext.close();
      } catch (e) {
        console.error('Error closing audio output context:', e);
      }
      this.audioOutputContext = new window.AudioContext(); // Prepare a new context for potential restart
    }
  }

  isCallActive() {
    return this.isWebCallOngoing;
  }

  isConnected() {
    return this.isFirstAudioPacketReceived;
  }

  // Utility methods
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  floatTo16BitPCM(floatBuffer) {
    const len = floatBuffer.length;
    const result = new Int16Array(len);
    for (let i = 0; i < len; i++) {
      let s = Math.max(-1, Math.min(1, floatBuffer[i]));
      result[i] = s < 0 ? s * 32768 : s * 32767;
    }
    return result;
  }
}

// Simple Queue implementation
class Queue {
  constructor() {
    this.items = [];
  }

  enqueue(item) {
    this.items.push(item);
  }

  dequeue() {
    if (this.isEmpty()) return null;
    return this.items.shift();
  }

  isEmpty() {
    return this.items.length === 0;
  }

  clear() {
    this.items = [];
  }
}

// Export the BolnaWebCalling class for both module systems and global use
(function(global) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    // CommonJS
    module.exports = BolnaWebCalling;
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define([], function() {
      return BolnaWebCalling;
    });
  } else {
    // Browser global
    global.BolnaWebCalling = BolnaWebCalling;
  }
})(typeof window !== 'undefined' ? window : this);