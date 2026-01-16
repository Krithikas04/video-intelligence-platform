This project is an advanced Video Q&A System that allows users to have natural conversations with YouTube videos. By leveraging Retrieval-Augmented Generation (RAG), the system transcribes video content, indexes it, and enables users to ask questions.
The core innovation of this system is Smart Context Switching. Unlike standard RAG bots that get stuck on one document, this system intelligently detects which video the user is asking about and automatically switches the context and video player to the correct source in real-time.

2. Key Features
 YouTube Video Ingestion: Automatically downloads audio from YouTube URLs, transcribes it using OpenAI Whisper, and processes the text.
 Advanced RAG Architecture: breaks down video transcripts into semantic chunks and stores them in a Vector Database for precise retrieval.
twisted_rightwards_arrows Smart Context Switching: The backend analyzes the user's query to decide whether to answer from the currently playing video or search the entire library and switch to a more relevant video automatically.
 Real-Time Streaming: Responses are streamed token-by-token (like ChatGPT) to ensure low latency and a better user experience.
 Precision Timestamps: Every answer includes citations (e.g., [04:20]). Clicking these timestamps on the frontend jumps the video player to that exact moment.
 Conversation History: Maintains thread history so users can ask follow-up questions.

3. Technology Stack
Backend Core
Python 3.10+: The primary programming language.
FastAPI: High-performance web framework for building the REST API.
LangChain: Orchestration framework for managing LLM chains and retrieval logic.
Uvicorn: ASGI server for handling asynchronous requests.
AI & Machine Learning
OpenAI Whisper: State-of-the-art model for speech-to-text transcription.
LLM (GPT-4o / Gemini): The "Brain" responsible for generating natural language answers.
Embeddings: Converts text into vector representations (lists of numbers) to measure semantic similarity.
Database & Storage
PostgreSQL (Neon DB): The primary database.
pgvector: A PostgreSQL extension used to store and query high-dimensional vector embeddings.
Frontend
Next.js / React: For the user interface.
React Player: To handle video playback and programmatic seeking (jumping to timestamps).

4. Behind the Scenes: How It Works? (Architecture)
This is the technical logic flow of the application:
Phase 1: The Ingestion Pipeline (Adding a Video)
When a user pastes a YouTube URL:
Download: The yt-dlp library extracts the audio track from the video.
Transcription: The audio is passed to the Whisper model, which converts speech to text with precise timestamps.
Chunking: The transcript is split into smaller, meaningful segments (e.g., 500 characters).
Embedding: Each text chunk is converted into a Vector (a list of floating-point numbers) representing its meaning.
Storage: These vectors are stored in PostgreSQL using pgvector.
Phase 2: The "Smart Chat" Logic (The chat.py Endpoint)
When a user asks a question, the following algorithmic steps occur in the backend:
Step 1: Global Vector Search The system first ignores which video the user is currently watching. It converts the user's question into a vector and searches the entire database to find the most relevant answers across all videos.
Step 2: The "Stickiness" Check (Context Stability) The system checks the top search results:
Logic: Is the video the user is currently watching present in the top 3 search results?
Result: If YES, the system decides the question is about the current video. It forces the AI to answer from the current video to prevent unnecessary switching.
Step 3: The "Switch" Decision (Auto-Detection)
Logic: If the current video is NOT in the top results, but a different video (Video B) has a very high match score.
Result: The system triggers a Context Switch. It sets Video B as the new source.
Step 4: Answer Generation The relevant text chunks from the selected video are sent to the LLM (AI). The AI generates an answer based only on those chunks to prevent hallucinations.
Step 5: Streaming & Control
The text is streamed to the frontend.
If a switch occurred, the backend sends a hidden signal: <<SOURCE:video_b.mp4>>.
The frontend detects this signal and automatically changes the video player to Video B.

5. User Guide
Getting Started
Launch the App: Open the URL in your browser.
Add Content:
Navigate to the "Add Video" section.
Paste a YouTube URL.
Wait for the "Processing Complete" notification.
Interacting with the AI
Select a Thread: Start a new chat or continue an old one.
Ask Questions: Type questions like "What is the summary of this video?" or "What did the speaker say about X?"
Navigate via Citations: When the AI answers (e.g., "The speaker mentions X at"), click the timestamp to jump to that part of the video.
Switch Topics: Feel free to ask a question about a different video you added previously. The AI will automatically find it and switch the player for you.

6. Directory Structure (Key Files)
Plaintext
├── app/
│   ├── api/
│   │   └── endpoints/
│   │       └── chat.py        # Contains the Smart Context Switching Logic
│   ├── services/
│   │   ├── rag_agent.py       # Handles LLM communication and prompting
│   │   ├── vector_store.py    # Handles database search and indexing
│   │   └── video_processor.py # Handles downloading and transcription
│   └── main.py                # Application Entry point

7. Future Roadmap
Multi-Modal Analysis: Upgrading the AI to "see" the video frames (charts, diagrams) instead of just reading the text.
Summarization Button: One-click summary generation for any loaded video.
Quizzes: An educational mode where the AI generates quiz questions based on the video content.
