import React, { useState } from 'react';
import styles from '../styles/MarkdownHelpButton.module.css';

const MarkdownHelpButton = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  const handleOpenCheatSheet = () => {
    if (window.electronAPI) {
      window.electronAPI.openMarkdownCheatSheet();
    } else {
      console.warn('Electron API not available');
      // Fallback for browser environment (development)
      window.open('/markdown-cheatsheet', '_blank', 'width=900,height=700');
    }
  };

  return (
    <button 
      className={styles.markdownHelpButton}
      onClick={handleOpenCheatSheet}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Open Markdown Cheat Sheet"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      {isHovered && <span className={styles.tooltip}>Markdown Cheat Sheet</span>}
    </button>
  );
};

export default MarkdownHelpButton;