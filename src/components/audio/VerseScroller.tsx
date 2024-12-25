import React, { useEffect } from 'react';
import { scrollToVerse } from '@/utils/scrollUtils';

interface VerseScrollerProps {
  currentVerseNumber: number;
}

const VerseScroller: React.FC<VerseScrollerProps> = ({ currentVerseNumber }) => {
  useEffect(() => {
    if (currentVerseNumber) {
      scrollToVerse(currentVerseNumber);
    }
  }, [currentVerseNumber]);

  return null;
};

export default VerseScroller;