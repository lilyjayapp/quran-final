import React from 'react';

interface AudioContainerProps {
  children: React.ReactNode;
}

const AudioContainer: React.FC<AudioContainerProps> = ({ children }) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background shadow-md border-b border-gray-200">
      <div className="container mx-auto p-2 sm:p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AudioContainer;