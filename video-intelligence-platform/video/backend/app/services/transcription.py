import os
import torch
from openai import OpenAI
from app.core.config import settings

# --- FIX: Robust Import for MoviePy ---
try:
    # MoviePy 2.0+
    from moviepy import VideoFileClip
except ImportError:
    try:
        # Older versions fallback
        from moviepy.editor import VideoFileClip
    except:
        VideoFileClip = None
        print("⚠️ MoviePy library not found.")

# --- Safe Import for Whisper ---
try:
    import whisper
    LOCAL_WHISPER_AVAILABLE = True
except Exception as e:
    print(f"⚠️ Warning: Local Whisper issue. Falling back to API.")
    LOCAL_WHISPER_AVAILABLE = False
    whisper = None

class TranscriptionService:
    """
    Service responsible for extracting audio from video and transcribing it
    using either OpenAI's Cloud API or a Local Whisper Model.
    """

    def __init__(self):
        self.mode = settings.WHISPER_MODE
        self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        if self.mode == "local" and not LOCAL_WHISPER_AVAILABLE:
            print("⚠️ Switching to CLOUD mode automatically.")
            self.mode = "cloud"

        if self.mode == "local" and LOCAL_WHISPER_AVAILABLE:
            print(f"Loading Local Whisper Model on {self.device}...")
            self.local_model = whisper.load_model("base", device=self.device)

    def extract_audio(self, video_path: str, output_audio_path: str):
        """
        Extracts audio track from the video file using MoviePy.
        """
        try:
            with VideoFileClip(video_path) as video:
                # MoviePy 2.0 removed 'verbose' and 'logger' parameters
                video.audio.write_audiofile(output_audio_path)
            
            return output_audio_path
        except Exception as e:
            raise RuntimeError(f"Failed to extract audio: {str(e)}")

    def transcribe(self, audio_path: str):
        if self.mode == "cloud":
            return self._transcribe_cloud(audio_path)
        else:
            return self._transcribe_local(audio_path)

    def _transcribe_cloud(self, audio_path: str):
        print("Using OpenAI Cloud API for transcription...")
        with open(audio_path, "rb") as audio_file:
            transcript = self.openai_client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="verbose_json",
                timestamp_granularities=["segment"]
            )
        
        return [
            {
                "start": segment.start,
                "end": segment.end,
                "text": segment.text.strip()
            }
            for segment in transcript.segments
        ]

    def _transcribe_local(self, audio_path: str):
        if not LOCAL_WHISPER_AVAILABLE:
            raise RuntimeError("Local Whisper is not available.")
            
        print("Using Local Whisper Model...")
        result = self.local_model.transcribe(audio_path)
        return result["segments"]