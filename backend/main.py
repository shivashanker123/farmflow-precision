"""
Local Speech-to-Speech Backend
No API keys required - uses local Ollama, faster-whisper, and edge-tts
"""

import os
import io
import uuid
import asyncio
import tempfile
from pathlib import Path
from typing import Optional

import requests
import edge_tts
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel

# Initialize FastAPI
app = FastAPI(title="Local Speech-to-Speech API")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3"
TTS_VOICE = "en-US-EricNeural"
TEMP_DIR = Path(tempfile.gettempdir()) / "speech_to_speech"
TEMP_DIR.mkdir(exist_ok=True)

# System prompt for the farming assistant
SYSTEM_PROMPT = """You are a helpful AI farming assistant for FarmFlow, a precision agriculture platform.
You help farmers with irrigation, crop management, and agricultural advice.
Keep your responses conversational, concise (1-3 sentences), and helpful.
You're speaking in a voice conversation, so be natural and friendly."""

# Initialize Whisper model (lazy loading)
whisper_model: Optional[WhisperModel] = None

def get_whisper_model() -> WhisperModel:
    """Lazy load the Whisper model."""
    global whisper_model
    if whisper_model is None:
        print("🎙️ Loading Whisper model...")
        # Use CPU by default to avoid CUDA library issues
        try:
            whisper_model = WhisperModel("tiny", device="cpu", compute_type="int8")
            print("✅ Whisper loaded on CPU")
        except Exception as e:
            print(f"❌ Failed to load Whisper: {e}")
            raise
    return whisper_model


def transcribe_audio(audio_path: str) -> str:
    """Transcribe audio file using faster-whisper."""
    model = get_whisper_model()
    
    print(f"🎧 Transcribing: {audio_path}")
    segments, info = model.transcribe(audio_path, beam_size=1, language="en")
    
    # Combine all segments
    text = " ".join([segment.text for segment in segments]).strip()
    print(f"📝 Transcribed: {text}")
    
    return text


def call_ollama(prompt: str, context: str = "") -> str:
    """Call local Ollama instance for LLM response."""
    print(f"🧠 Calling Ollama with: {prompt[:50]}...")
    
    full_prompt = f"{SYSTEM_PROMPT}\n\n"
    if context:
        full_prompt += f"Previous context: {context}\n\n"
    full_prompt += f"User: {prompt}\nAssistant:"
    
    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": full_prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "num_predict": 150,  # Keep responses short for voice
                }
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            text = result.get("response", "").strip()
            print(f"🤖 Ollama response: {text[:50]}...")
            return text
        else:
            print(f"❌ Ollama error: {response.status_code}")
            return "Sorry, I couldn't process that. Please try again."
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Ollama. Is it running?")
        return "I can't connect to my brain right now. Make sure Ollama is running."
    except Exception as e:
        print(f"❌ Ollama error: {e}")
        return "Sorry, I encountered an error. Please try again."


async def text_to_speech(text: str) -> bytes:
    """Convert text to speech using edge-tts."""
    print(f"🔊 Generating speech for: {text[:50]}...")
    
    # Create a unique temp file for the audio
    audio_file = TEMP_DIR / f"tts_{uuid.uuid4().hex}.mp3"
    
    try:
        # Generate speech
        communicate = edge_tts.Communicate(text, TTS_VOICE)
        await communicate.save(str(audio_file))
        
        # Read the audio bytes
        with open(audio_file, "rb") as f:
            audio_bytes = f.read()
        
        print(f"✅ Generated {len(audio_bytes)} bytes of audio")
        return audio_bytes
        
    finally:
        # Clean up
        if audio_file.exists():
            audio_file.unlink()


def cleanup_temp_file(file_path: str):
    """Delete temporary file."""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"🗑️ Cleaned up: {file_path}")
    except Exception as e:
        print(f"⚠️ Could not delete {file_path}: {e}")


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "Local Speech-to-Speech",
        "whisper": "ready" if whisper_model else "not loaded",
        "ollama": OLLAMA_URL,
        "tts_voice": TTS_VOICE
    }


@app.get("/health")
async def health():
    """Check if all services are available."""
    # Check Ollama
    ollama_ok = False
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        ollama_ok = response.status_code == 200
    except:
        pass
    
    return {
        "whisper": "ready",
        "ollama": "connected" if ollama_ok else "not connected",
        "tts": "ready"
    }


@app.websocket("/ws/local-live")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time speech-to-speech.
    
    Flow:
    1. Client sends audio bytes (WebM/WAV)
    2. Server transcribes with Whisper
    3. Server gets response from Ollama
    4. Server generates speech with edge-tts
    5. Server sends audio bytes back
    """
    await websocket.accept()
    print("🔌 WebSocket connected")
    
    conversation_context = ""
    
    try:
        while True:
            # Step A: Receive audio data from client
            print("👂 Waiting for audio...")
            data = await websocket.receive_bytes()
            print(f"📥 Received {len(data)} bytes of audio")
            
            if len(data) < 1000:
                print("⚠️ Audio too short, skipping")
                await websocket.send_json({
                    "type": "error",
                    "message": "Audio too short"
                })
                continue
            
            # Save to temp file
            audio_file = TEMP_DIR / f"input_{uuid.uuid4().hex}.webm"
            try:
                with open(audio_file, "wb") as f:
                    f.write(data)
                print(f"💾 Saved audio to {audio_file}")
                
                # Send status update
                await websocket.send_json({
                    "type": "status",
                    "message": "transcribing"
                })
                
                # Step B: Transcribe with Whisper
                text = transcribe_audio(str(audio_file))
                
                if not text or len(text.strip()) < 2:
                    await websocket.send_json({
                        "type": "error",
                        "message": "Could not understand audio"
                    })
                    continue
                
                # Send transcription to client
                await websocket.send_json({
                    "type": "transcription",
                    "text": text
                })
                
                # Step C: Get LLM response from Ollama
                await websocket.send_json({
                    "type": "status",
                    "message": "thinking"
                })
                
                response_text = call_ollama(text, conversation_context)
                
                # Update conversation context (keep last exchange)
                conversation_context = f"User: {text}\nAssistant: {response_text}"
                
                # Send response text to client
                await websocket.send_json({
                    "type": "response",
                    "text": response_text
                })
                
                # Step D: Generate speech with edge-tts
                await websocket.send_json({
                    "type": "status",
                    "message": "speaking"
                })
                
                audio_response = await text_to_speech(response_text)
                
                # Step E: Send audio back to client
                await websocket.send_bytes(audio_response)
                
                await websocket.send_json({
                    "type": "status",
                    "message": "done"
                })
                
                print("✅ Response sent successfully")
                
            finally:
                # Clean up temp file
                cleanup_temp_file(str(audio_file))
                
    except WebSocketDisconnect:
        print("🔌 WebSocket disconnected")
    except Exception as e:
        print(f"❌ WebSocket error: {e}")
        try:
            await websocket.send_json({
                "type": "error",
                "message": str(e)
            })
        except:
            pass


@app.on_event("startup")
async def startup():
    """Pre-load Whisper model on startup."""
    print("🚀 Starting Local Speech-to-Speech server...")
    # Pre-load whisper model in background
    asyncio.create_task(asyncio.to_thread(get_whisper_model))


@app.on_event("shutdown")
async def shutdown():
    """Cleanup on shutdown."""
    print("👋 Shutting down...")
    # Clean up any remaining temp files
    for file in TEMP_DIR.glob("*"):
        try:
            file.unlink()
        except:
            pass


if __name__ == "__main__":
    import uvicorn
    print("=" * 50)
    print("🎙️ Local Speech-to-Speech Backend")
    print("=" * 50)
    print(f"📍 Ollama: {OLLAMA_URL}")
    print(f"🗣️ TTS Voice: {TTS_VOICE}")
    print(f"📁 Temp dir: {TEMP_DIR}")
    print("=" * 50)
    uvicorn.run(app, host="0.0.0.0", port=8000)
