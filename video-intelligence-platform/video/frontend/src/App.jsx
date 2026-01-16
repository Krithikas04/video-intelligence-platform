import React, { useRef, useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import VideoPlayer from './components/VideoPlayer';
import ChatInterface from './components/ChatInterface';
import VideoSidebar from './components/VideoSidebar';
import Documentation from './components/Documentation';

// Helper function to retrieve or create a persistent User ID.
// This ensures that even if the user refreshes the page, they remain identified 
// and can see their previously uploaded videos.
const getPersistentUserId = () => {
  const storedId = localStorage.getItem('rag_user_id');
  if (storedId) return storedId;
  
  const newId = 'user_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('rag_user_id', newId);
  return newId;
};

const MainLayout = () => {
  // Create a reference to the VideoPlayer component.
  // This allows us to call functions inside the player, like .seekTo().
  const playerRef = useRef(null);
  
  // State to track the currently active video URL.
  // When this changes, the VideoPlayer component will load the new file.
  const [currentVideoUrl, setCurrentVideoUrl] = useState(null);
  
  // Initialize the User ID state.
  const [userId] = useState(getPersistentUserId); 

  // Handler for when a user clicks a video thumbnail in the sidebar.
  // It updates the state to play the selected video.
  const handleSelectVideo = (url) => {
    setCurrentVideoUrl(url);
  };

  // --- INTELLIGENT SEEK FUNCTION ---
  // This function handles the logic for clicking a timestamp.
  // It accepts the time in seconds and the specific video URL that timestamp belongs to.
  const handleSeek = (seconds, targetVideoUrl = null) => {
    
    // Log the action for debugging purposes.
    console.log(`Smart Seek Triggered: Time=${seconds}, TargetVideo=${targetVideoUrl}, CurrentVideo=${currentVideoUrl}`);

    // Determine the target video. If no specific target is sent, fallback to the current one.
    const target = targetVideoUrl || currentVideoUrl;

    // Scenario 1 - The timestamp belongs to a different video than the one playing.
    // We must switch the video source first.
    if (target && target !== currentVideoUrl) {
        console.log("Auto-switching video source...");
        
        // 1. Update the state to force the VideoPlayer to load the new video file.
        setCurrentVideoUrl(target);
        
        // 2. We use a very short timeout (500ms) to allow React to process the state change 
        // and mount the new video player instance.
        setTimeout(() => {
            if (playerRef.current) {
                playerRef.current.seekTo(seconds);
            }
        }, 500); 
    } 
    // Scenario 2 - The correct video is already active.
    // We can simply command the player to jump to the timestamp immediately.
    else {
        if (playerRef.current) {
            playerRef.current.seekTo(seconds);
        }
    }
  };

  return (
    <div className="min-h-screen bg-darkBase text-white font-sans selection:bg-accent/30 overflow-hidden flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-12 px-4 sm:px-6 max-w-[1920px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Sidebar Column - Displays the list of user's uploaded videos. */}
          <div className="lg:col-span-3 flex flex-col gap-6 h-[80vh] lg:sticky lg:top-24">
            <VideoSidebar 
                onSelectVideo={handleSelectVideo} 
                currentVideo={currentVideoUrl}
                userId={userId} 
            />
          </div>

          {/* Video Player Column - The central area where the video plays. */}
          <div className="lg:col-span-5 flex flex-col gap-6">
             {/* CRITICAL FIX - We add key={currentVideoUrl}.
                 This forces React to completely destroy the old player and create a new one
                 whenever the video changes. This prevents the player from getting "stuck" on the old video. */}
             <VideoPlayer 
                key={currentVideoUrl}
                ref={playerRef} 
                videoUrl={currentVideoUrl} 
             />
          </div>

          {/* Chat Interface Column - The AI interaction area. */}
          <div className="lg:col-span-4 h-[80vh] lg:sticky lg:top-24">
            {/* Pass 'currentVideoUrl' so the chat knows the context of the current question.
                Pass 'handleSeek' so the chat timestamps can control the player. */}
            <ChatInterface 
                onSeek={handleSeek} 
                userId={userId} 
                currentVideoUrl={currentVideoUrl} 
            />
          </div>
        </div>
      </main>

      {/* Debug Overlay - Shows the current User ID for development tracking. */}
      <div className="fixed bottom-2 right-2 bg-black/80 text-gray-500 text-[10px] px-2 py-1 rounded border border-white/10 z-50">
        User: {userId}
      </div>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />} />
      <Route path="/docs" element={<Documentation />} />
    </Routes>
  );
}

export default App;