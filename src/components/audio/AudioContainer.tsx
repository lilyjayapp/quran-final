import React from 'react';
import '../../styles/fixedPositioning.css';

interface AudioContainerProps {
  children: React.ReactNode;
}

const AudioContainer: React.FC<AudioContainerProps> = ({ children }) => {
  return (
    <div className="fixed-header gpu-accelerated shadow-md border-b border-gray-200">
      <div className="container mx-auto p-2 sm:p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AudioContainer;