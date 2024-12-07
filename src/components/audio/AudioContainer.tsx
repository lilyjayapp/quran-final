import React from 'react';

interface AudioContainerProps {
  children: React.ReactNode;
}

const AudioContainer: React.FC<AudioContainerProps> = ({ children }) => {
  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {children}
      </div>
    </div>
  );
};

export default AudioContainer;