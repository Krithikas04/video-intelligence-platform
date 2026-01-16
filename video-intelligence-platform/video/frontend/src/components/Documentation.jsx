import React from 'react';
// Import Framer Motion for high-level animations (fade-ins, sliding)
import { motion } from 'framer-motion';
// Import all necessary icons from Lucide React
import { BookOpen, Cpu, Video, ArrowRight, Terminal, Sparkles, Clock } from 'lucide-react';
// Import the Header component to maintain consistent navigation
import Header from './Header';
//  Import the centralized documentation URL from config to avoid hardcoding
import { DOCS_URL } from '../config';

//  Animation variants for the parent container
// This creates a "staggered" effect where children elements appear one by one
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { 
      //  Delay the start of children animations by 0.3s
      delayChildren: 0.3, 
      // Each child will appear 0.2s after the previous one
      staggerChildren: 0.2 
    }
  }
};

//  Animation variants for individual items (Cards, Sections)
// They will slide up (y: 20 -> y: 0) and fade in
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { type: "spring", stiffness: 100 } 
  }
};

const Documentation = () => {
  return (
    //  Main container with dark background, full height, and overflow handling
    <div className="min-h-screen bg-darkBase text-white font-sans selection:bg-accent/30 overflow-x-hidden pb-20">
      
      {/*  Render Header with 'isDocsPage' prop set to true. 
          This tells the Header to show the 'Back to App' button instead of 'Documentation'. */}
      <Header isDocsPage={true} />

      {/*  Main Content Area with top padding to account for the fixed Header */}
      <main className="pt-28 px-4 sm:px-8 max-w-5xl mx-auto relative">
        
        {/*  DECORATIVE BACKGROUND ELEMENTS (BLOBS) */}
        {/*  Top-left glowing blob */}
        <div className="absolute top-20 -left-20 w-96 h-96 bg-accent/30 rounded-full filter blur-[120px] opacity-50 animate-pulse-slow pointer-events-none"></div>
        {/* Bottom-right purple glowing blob */}
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-purple-500/20 rounded-full filter blur-[120px] opacity-40 animate-pulse-slow pointer-events-none" style={{animationDelay: '1s'}}></div>


        {/*  HERO SECTION */}
        <motion.div 
          //  Initial state (invisible and slightly lower)
          initial={{ opacity: 0, y: 30 }}
          //  Final state (visible and at original position)
          animate={{ opacity: 1, y: 0 }}
          //  Smooth easing duration
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-20"
        >
            {/* Badge/Tag above the title */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 text-accent text-sm font-bold mb-6 animate-fade-in">
                <Sparkles size={16} /> Next-Gen Video Intelligence
            </div>
          
          {/*  Main Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Understand video content <br />
            {/*  Gradient Text Effect */}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent via-purple-400 to-pink-400">
              at superhuman speed.
            </span>
          </h1>
          
          {/*  Subtitle / Description */}
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            VideoRAG Pro uses advanced AI to analyze your videos, allowing you to ask questions and jump instantly to the exact answer.
          </p>
        </motion.div>

        {/*  FEATURES GRID SECTION */}
        <motion.div 
          // Apply the staggered container variants here
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
        >
            {/* Feature 1 - Instant Ingestion */}
            <FeatureCard 
                icon={<Video className="text-accent" />}
                title="Instant Ingestion"
                description="Upload any video format. Our backend processes, transcribes, and indexes the content in the background automatically."
            />
             {/* Feature 2 - AI Brain */}
            <FeatureCard 
                icon={<Cpu className="text-purple-400" />}
                title="RAG V2 AI Brain"
                description="Powered by OpenAI GPT-4o and FlashRank reranking for highly accurate, context-aware answers."
            />
             {/*  Feature 3 - Timestamps */}
            <FeatureCard 
                icon={<Clock className="text-pink-400" />}
                title="Precise Timestamps"
                description="Don't just get answers. Get taken directly to the exact second in the video where the answer lies."
            />
        </motion.div>

        {/* HOW IT WORKS SECTION */}
         <motion.div variants={itemVariants} className="glass-panel p-8 rounded-3xl mb-20 relative overflow-hidden">
             {/* Background gradient overlay for the panel */}
             <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent pointer-events-none"></div>
             
             {/* Section Title */}
             <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 relative z-10">
                <BookOpen className="text-accent"/> How It Works
             </h2>
             
             {/* List of Steps */}
             <div className="space-y-6 relative z-10">
                <Step number="1" title="Upload" desc="Select your video file from the sidebar. The system begins processing immediately." />
                <Step number="2" title="Analyze" desc="The AI extracts audio, transcribes speech, and creates a searchable vector index." />
                <Step number="3" title="Ask" desc="Type any question in the chat interface related to the video content." />
                <Step number="4" title="Discover" desc="Receive an instant answer with clickable timestamps that control the video player." />
             </div>
         </motion.div>

        {/* API REFERENCE SECTION */}
        <motion.div 
            variants={itemVariants}
            className="text-center p-10 rounded-3xl bg-gradient-to-r from-accent/20 to-purple-500/20 border border-accent/20"
        >
            <Terminal size={40} className="mx-auto text-white mb-4 opacity-80" />
            <h2 className="text-3xl font-bold mb-4">Developer API</h2>
            <p className="text-gray-300 mb-8 max-w-xl mx-auto">
                Want to integrate VideoRAG into your own applications? Explore our comprehensive Swagger API documentation.
            </p>
            
            {/* Button linking to Swagger Docs */}
            <a 
                //Use the dynamic URL from config.js instead of hardcoding
                href={DOCS_URL} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-accent hover:bg-accent/80 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-xl shadow-accent/20 group"
            >
                View Swagger Docs <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
            </a>
        </motion.div>

      </main>
    </div>
  );
};

// HELPER COMPONENT - Feature Card
// Renders a single feature with an icon, title, and description
const FeatureCard = ({ icon, title, description }) => (
    <motion.div variants={itemVariants} className="glass-panel p-6 rounded-2xl border-white/5 hover:border-accent/30 transition-colors group">
        {/*  Icon Container */}
        <div className="p-3 bg-white/5 rounded-xl inline-block mb-4 group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </motion.div>
);

//  HELPER COMPONENT - Step
// Renders a numbered step for the "How It Works" section
const Step = ({number, title, desc}) => (
    <div className="flex items-start gap-4">
        {/*  Number Circle */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent flex items-center justify-center font-bold text-white shadow-lg shadow-accent/30">
            {number}
        </div>
        {/* Text Content */}
        <div>
            <h4 className="text-lg font-bold mb-1">{title}</h4>
            <p className="text-gray-400">{desc}</p>
        </div>
    </div>
);

export default Documentation;