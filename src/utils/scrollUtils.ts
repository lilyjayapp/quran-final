export const findScrollableContainers = (element: Element): HTMLElement[] => {
  const containers: HTMLElement[] = [];
  let parent = element.parentElement;
  
  // First, try to find iframe if we're embedded
  try {
    const iframe = window.frameElement as HTMLIFrameElement;
    if (iframe) {
      console.log('Found iframe:', iframe);
      containers.push(iframe.contentDocument?.documentElement || document.documentElement);
    }
  } catch (e) {
    console.log('Not in iframe or cross-origin iframe');
  }
  
  while (parent) {
    const hasVerticalScroll = parent.scrollHeight > parent.clientHeight;
    const style = window.getComputedStyle(parent);
    const isScrollable = ['auto', 'scroll'].includes(style.overflowY);
    
    if (hasVerticalScroll || isScrollable) {
      containers.push(parent as HTMLElement);
    }
    parent = parent.parentElement;
  }
  
  // Always include document.documentElement as a fallback
  if (!containers.includes(document.documentElement)) {
    containers.push(document.documentElement);
  }
  
  return containers;
};

export const scrollToVerse = (verseNumber: number) => {
  const verseElement = document.querySelector(`[data-verse="${verseNumber}"]`);
  console.log('Verse element found:', verseElement ? 'yes' : 'no', { verseNumber });
  
  if (!verseElement) return;

  // Find all possible scrollable containers
  const scrollableContainers = findScrollableContainers(verseElement);
  console.log('Found scrollable containers:', scrollableContainers.length);

  // Calculate the position to keep verse near the top
  const topOffset = 100; // Adjust this value to control how far from the top the verse should stay

  // Try each container, starting from the closest to the verse
  scrollableContainers.forEach((container) => {
    try {
      const elementRect = verseElement.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      console.log(`Attempting to scroll container:`, {
        containerType: container.tagName,
        elementTop: elementRect.top,
        containerTop: containerRect.top,
        containerHeight: containerRect.height,
        elementHeight: elementRect.height,
        currentScroll: container.scrollTop
      });

      // Calculate the scroll position to keep verse near the top
      if (container instanceof HTMLElement) {
        const scrollTop = (verseElement as HTMLElement).offsetTop - topOffset;
        
        container.style.scrollBehavior = 'smooth';
        container.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        });
        
        // If in iframe, also try to scroll the iframe
        if (window.frameElement) {
          window.parent.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
          });
          
          // Send message to parent window
          window.parent.postMessage({
            type: 'scrollTo',
            top: scrollTop,
          }, '*');
        }
      }
      
    } catch (error) {
      console.error(`Scroll error for container:`, error);
    }
  });
};
