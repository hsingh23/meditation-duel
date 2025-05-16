import React from 'react';
import './ProgressBar.css';

interface ProgressBarProps {
  visible: boolean;
  position?: 'top' | 'bottom';
}

const ProgressBar: React.FC<ProgressBarProps> = ({ visible, position = 'top' }) => {
  if (!visible) {
    return null;
  }

  return (
    <div className={`progress-bar-container ${position}`}>
      <div className="progress-bar"></div>
    </div>
  );
};

export default ProgressBar;
