import React from 'react';
import { Sparkles, Github, BookOpen, Home } from 'lucide-react';
// English Comment: Import Link for smooth client-side navigation without page refresh
import { Link } from 'react-router-dom';

const Header = ({ isDocsPage = false }) => {
  return (
    <header className="w-full h-16 flex items-center justify-between px-8 border-b border-white/10 bg-darkBase/80 backdrop-blur-md fixed top-0 z-50">
      
      {/* English Comment: Logo now acts as a Home Button */}
      <Link to="/" className="flex items-center gap-3 group">
        <div className="p-2 bg-accent/20 rounded-lg border border-accent/50 group-hover:bg-accent/30 transition-colors">
          <Sparkles className="text-accent w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          VideoRAG <span className="text-accent">Pro</span>
        </h1>
      </Link>
      
      <div className="flex items-center gap-4">
        {/* English Comment: Conditional Rendering Logic
            - If we are on Docs Page -> Show "Back to App" button
            - If we are on Home Page -> Show "Documentation" button
        */}
        {isDocsPage ? (
           <Link 
            to="/" 
            className="px-4 py-2 text-sm font-bold text-white bg-accent hover:bg-accent/80 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-accent/20"
          >
            <Home size={16} />
            Back to App
          </Link>
        ) : (
           <Link 
            to="/docs" 
            className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-2 hover:bg-white/5 rounded-lg font-medium"
          >
            <BookOpen size={16} />
            Documentation
          </Link>
        )}

        {/* GitHub Button (Optional) */}
        <a 
          href="#"
          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium transition-all flex items-center gap-2 text-white hidden sm:flex"
        >
          <Github size={16} />
          GitHub
        </a>
      </div>
    </header>
  );
};

export default Header;