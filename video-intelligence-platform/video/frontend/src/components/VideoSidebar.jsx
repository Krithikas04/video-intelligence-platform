import React, { useEffect, useState, useRef } from 'react';
import { Film, Play, RefreshCw, Loader2, CloudUpload, FileVideo, AlertCircle, CheckCircle, Activity, Clock } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { API_ENDPOINTS } from '../config';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const VideoSidebar = ({ onSelectVideo, currentVideo, userId }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Upload and Processing State
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState(''); 
  const [currentPhase, setCurrentPhase] = useState('idle'); // 'idle', 'uploading', 'processing', 'success', 'error'
  const [elapsedTime, setElapsedTime] = useState(0); // Timer for elapsed seconds
  
  const fileInputRef = useRef(null);
  const timerRef = useRef(null); // Reference to clear the timer interval

  // Fetch the list of videos belonging to this user
  const fetchVideos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_ENDPOINTS.GET_VIDEOS, {
        params: { user_id: userId }
      });
      setVideos(response.data.videos);
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to format seconds into mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Function to check backend status every 1 second
  const pollProcessingStatus = (videoId) => {
    // Start the elapsed time counter
    setElapsedTime(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
    }, 1000);

    const intervalId = setInterval(async () => {
      try {
        const response = await axios.get(`${BASE_URL}/status/${videoId}`);
        const { status, message, progress: backendProgress } = response.data;

        // Update UI with real message from backend
        setStatusMessage(message);
        setProgress(backendProgress);

        // If processing is done
        if (status === 'completed') {
          clearInterval(intervalId);
          clearInterval(timerRef.current);
          setCurrentPhase('success');
          
          setTimeout(() => {
            fetchVideos();
            resetUploadState();
          }, 2000);
        } 
        // If an error occurred
        else if (status === 'error') {
          clearInterval(intervalId);
          clearInterval(timerRef.current);
          setCurrentPhase('error');
          setStatusMessage(message);
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 1000);
  };

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Initial UI State
    setIsUploading(true);
    setProgress(0);
    setCurrentPhase('uploading');
    setStatusMessage('Uploading to Server...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId); 

    try {
      // Step 1: Upload the file
      const response = await axios.post(API_ENDPOINTS.INGEST_VIDEO, formData, {
        onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            // Cap upload progress at 99% until backend confirms processing started
            if(percent < 100) setProgress(percent);
            setStatusMessage(`Uploading File... ${percent}%`);
        }
      });
      
      // Step 2: Start polling for backend processing status
      setCurrentPhase('processing');
      setStatusMessage('Initializing AI Models...');
      
      const videoId = response.data.video_id;
      pollProcessingStatus(videoId);
      
    } catch (error) {
      console.error("Upload failed:", error);
      setCurrentPhase('error');
      setStatusMessage("Upload Failed. Check Connection.");
      setTimeout(resetUploadState, 4000);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const resetUploadState = () => {
      setIsUploading(false);
      setProgress(0);
      setCurrentPhase('idle');
      setStatusMessage('');
      setElapsedTime(0);
      if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    fetchVideos();
    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    }
  }, []);

  return (
    <div className="h-full glass-panel rounded-3xl p-6 flex flex-col border border-white/10 shadow-2xl bg-darkBase/50 backdrop-blur-xl">
      
      {/* Sidebar Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <h2 className="text-xl font-bold flex items-center gap-3 text-white tracking-wide bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          <Film className="w-6 h-6 text-accent" />
          Library
        </h2>
        <button 
          onClick={fetchVideos}
          className="p-2 hover:bg-white/10 rounded-full transition-all text-gray-400 hover:text-white group active:scale-95"
          title="Refresh List"
        >
          <RefreshCw size={20} className={`group-hover:rotate-180 transition-transform duration-700 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Hidden Input */}
      <input type="file" ref={fileInputRef} onChange={handleUpload} accept="video/*" className="hidden" />

      {/* Video List Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
        
        {/* Upload Card / Progress Card */}
        <div className="relative overflow-hidden rounded-2xl">
            <button
            onClick={() => !isUploading && fileInputRef.current.click()}
            disabled={isUploading}
            className={`w-full p-6 rounded-2xl border-2 border-dashed transition-all duration-300 group relative overflow-hidden flex flex-col items-center justify-center gap-3 ${
                isUploading 
                ? currentPhase === 'error' ? 'border-red-500/50 bg-red-500/10' : 'border-accent/50 bg-accent/10' 
                : 'border-white/10 hover:border-accent hover:bg-accent/5'
            }`}
            >
            
            {!isUploading ? (
                // Idle State: Show Upload Button
                <>
                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:bg-accent/20 shadow-lg">
                        <CloudUpload size={28} className="text-gray-400 group-hover:text-accent" />
                    </div>
                    <div className="text-center">
                        <p className="text-base font-semibold text-gray-200 group-hover:text-white">Upload New Video</p>
                        <p className="text-xs text-gray-500 mt-1">MP4, MOV, AVI supported</p>
                    </div>
                </>
            ) : (
                // Active State: Show Progress, Message, and Timer
                <div className="w-full">
                    <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-wider">
                        <span className={`flex items-center gap-2 ${
                            currentPhase === 'error' ? 'text-red-400' : 
                            currentPhase === 'success' ? 'text-green-400' : 
                            'text-accent'
                        }`}>
                           {currentPhase === 'processing' && <Activity size={12} className="animate-pulse"/>}
                           {statusMessage}
                        </span>
                        <span className="text-white">{progress}%</span>
                    </div>
                    
                    {/* Progress Bar Track */}
                    <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                            className={`h-full rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)] ${
                                currentPhase === 'error' ? 'bg-red-500' :
                                currentPhase === 'success' ? 'bg-green-500' :
                                'bg-gradient-to-r from-accent via-blue-400 to-accent animate-[shimmer_2s_infinite]'
                            }`}
                        />
                    </div>
                    
                    {/* Elapsed Time Display */}
                    <div className="flex items-center justify-center gap-2 mt-3 text-[10px] text-gray-400 opacity-80">
                        <Clock size={10} />
                        <span>Time Elapsed: {formatTime(elapsedTime)}</span>
                    </div>
                </div>
            )}
            </button>
        </div>

        {/* Divider */}
        {videos.length > 0 && (
            <div className="flex items-center gap-3 py-2 opacity-60">
                <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1"></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Your Videos</span>
                <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1"></div>
            </div>
        )}

        {/* List of Videos */}
        <AnimatePresence>
            {videos.map((video, idx) => {
                const isActive = currentVideo === video.url;
                const displayName = video.display_name || video.filename.replace(/^[\w-]+_/, '').replace(/_/g, ' ');
                
                return (
                <motion.button
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    key={idx}
                    onClick={() => onSelectVideo(video.url)}
                    className={`w-full group flex items-center gap-4 p-4 rounded-xl transition-all duration-300 border relative overflow-hidden ${
                    isActive 
                        ? 'bg-accent/10 border-accent/50 shadow-[0_0_20px_rgba(99,102,241,0.15)]' 
                        : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'
                    }`}
                >
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent shadow-[0_0_10px_#6366f1]"></div>}

                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isActive ? 'bg-accent text-white shadow-lg scale-110' : 'bg-black/30 text-gray-500 group-hover:text-gray-300'
                    }`}>
                        {isActive ? <Play size={20} fill="currentColor" /> : <FileVideo size={20} />}
                    </div>
                    
                    <div className="flex-1 overflow-hidden text-left min-w-0">
                        <p className={`text-sm font-semibold truncate transition-colors ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}`} title={displayName}>
                            {displayName}
                        </p>
                        <span className={`text-[10px] uppercase tracking-wider font-bold flex items-center gap-1 mt-1 ${isActive ? 'text-accent' : 'text-gray-600'}`}>
                            {isActive ? (
                                <>
                                    <Activity size={12} className="text-accent animate-pulse" /> 
                                    Now Playing
                                </>
                            ) : 'Watch'}
                        </span>
                    </div>
                </motion.button>
                );
            })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VideoSidebar;