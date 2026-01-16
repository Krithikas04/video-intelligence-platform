import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

// Using forwardRef to allow the parent component (App.jsx) to control playback features like seeking
const VideoPlayer = forwardRef(({ videoUrl }, ref) => {
  const videoRef = useRef(null);
  
  // This reference acts as a queue. If we receive a seek command before the video is ready,
  // we store the timestamp here and apply it later once the video loads.
  const pendingSeekRef = useRef(null);

  // Expose the 'seekTo' function to the parent component
  useImperativeHandle(ref, () => ({
    seekTo: (seconds) => {
      if (videoRef.current) {
        // Check if the video metadata is loaded and the player is ready
        if (videoRef.current.readyState >= 1) {
           // The video is ready, so we can jump to the timestamp immediately
           videoRef.current.currentTime = seconds;
           videoRef.current.play().catch(e => console.error("Play error:", e));
        } else {
           // The video is still loading (e.g., just switched sources).
           // We queue the seek operation to be executed in 'handleLoadedMetadata'.
           console.log(`Video not ready. Queuing seek to ${seconds}s`);
           pendingSeekRef.current = seconds;
        }
      }
    }
  }));

  // Reload the video player whenever the source URL changes
  useEffect(() => {
    if (videoRef.current && videoUrl) {
      videoRef.current.load();
    }
  }, [videoUrl]);

  // This event handler triggers automatically when the browser finishes loading video metadata (duration, dimensions, etc.)
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
        // Check if there is a pending seek command in the queue
        if (pendingSeekRef.current !== null) {
            console.log(`Video loaded. Executing queued seek to ${pendingSeekRef.current}s`);
            
            // Execute the queued jump
            videoRef.current.currentTime = pendingSeekRef.current;
            
            // Clear the queue so we don't jump again unexpectedly
            pendingSeekRef.current = null; 
        }
        
        // Attempt to auto-play the video after loading is complete
        videoRef.current.play().catch(e => console.error("Autoplay error:", e));
    }
  };

  return (
    <div className="w-full h-full bg-black relative flex flex-col items-center justify-center rounded-2xl overflow-hidden shadow-2xl">
      {videoUrl ? (
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          controls
          autoPlay
          muted // Muted is strictly required by browsers to allow auto-play without user interaction
          playsInline
          // Connect the metadata handler to execute our queued seek logic
          onLoadedMetadata={handleLoadedMetadata}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="text-center text-gray-500 flex flex-col items-center animate-pulse">
            <span className="text-5xl mb-4 opacity-50">🎬</span>
            <p className="text-lg font-medium">Select a video to play</p>
        </div>
      )}
    </div>
  );
});

export default VideoPlayer;