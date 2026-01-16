# Advanced Video Q&A System

This project is an advanced Video Q&A System that allows users to have natural conversations with YouTube videos. By leveraging **Retrieval-Augmented Generation (RAG)**, the system transcribes video content, indexes it, and enables users to ask questions.

The **core innovation** of this system is **Smart Context Switching**. Unlike standard RAG bots that get stuck on one document, this system intelligently detects which video the user is asking about and automatically switches the context and video player to the correct source in real-time.

---

## 1. Key Features

- **YouTube Video Ingestion**: Automatically downloads audio from YouTube URLs, transcribes it using OpenAI Whisper, and processes the text.  
- **Advanced RAG Architecture**: Breaks down video transcripts into semantic chunks and stores them in a Vector Database for precise retrieval.  
- **Smart Context Switching**: The backend analyzes the user's query to decide whether to answer from the currently playing video or search the entire library and switch to a more relevant video automatically.  
- **Real-Time Streaming**: Responses are streamed token-by-token (like ChatGPT) for low latency and a smooth user experience.  
- **Precision Timestamps**: Every answer includes citations (e.g., `[04:20]`). Clicking these timestamps jumps the video player to that exact moment.  
- **Conversation History**: Maintains thread history so users can ask follow-up questions effortlessly.  

---

## 2. Technology Stack

**Backend Core**  
- Python 3.10+  
- FastAPI: REST API framework  
- LangChain: Orchestration framework for LLM chains and retrieval logic  
- Uvicorn: ASGI server for asynchronous requests  

**AI & Machine Learning**  
- OpenAI Whisper: Speech-to-text transcription  
- LLM (GPT-4o / Gemini): Generates natural language answers  
- Embeddings: Converts text into vector representations for semantic similarity  

**Database & Storage**  
- PostgreSQL (Neon DB)  
- pgvector: Extension for storing and querying vector embeddings  

**Frontend**  
- React  
- React Player: Handles video playback and programmatic seeking  

---

## 3. Architecture Overview

**Phase 1: Video Ingestion**  
1. **Download**: `yt-dlp` extracts audio from YouTube videos.  
2. **Transcription**: Whisper converts speech to text with timestamps.  
3. **Chunking**: Transcript is split into smaller segments (~500 characters).  
4. **Embedding**: Text chunks are converted into vector representations.  
5. **Storage**: Vectors are stored in PostgreSQL using pgvector.  

**Phase 2: Smart Chat Logic (`chat.py`)**  
1. **Global Vector Search**: Converts the user query into a vector and searches the database across all videos.  
2. **Context Stability Check**: Determines if the query relates to the current video or a different one.  
3. **Context Switch**: If another video is more relevant, the system automatically switches the video source.  
4. **Answer Generation**: The LLM generates answers based only on the selected video's chunks.  
5. **Streaming & Control**:  
   - Text is streamed to the frontend.  
   - If a video switch occurs, a hidden signal updates the video player automatically.  

---

## 4. User Guide

**Getting Started**  
1. Open the app in your browser.  

**Add Content**  
1. Navigate to the "Add Video" section.  
2. Paste a YouTube URL.  
3. Wait for the "Processing Complete" notification.  

**Interacting with the AI**  
1. Start a new chat or continue an existing thread.  
2. Ask questions like "What is the summary of this video?" or "What did the speaker say about X?"  
3. Click timestamps in answers to jump to specific points in the video.  
4. Ask questions about different videos; the AI will automatically find and switch to the correct video.  

---

## 5. Directory Structure

app/
├── api/
│ └── endpoints/
│ └── chat.py # Smart Context Switching logic
├── services/
│ ├── rag_agent.py # LLM communication and prompting
│ ├── vector_store.py # Database search and indexing
│ └── video_processor.py # Downloading and transcription
└── main.py # Application entry point
