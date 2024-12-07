import React from 'react';

interface AudioContainerProps {
  children: React.ReactNode;
}

const AudioContainer: React.FC<AudioContainerProps> = ({ children }) => {
  return (
    <div className="w-full bg-background">
      <div className="flex flex-col gap-4">
        {children}
      </div>
    </div>
  );
};

export default AudioContainer;