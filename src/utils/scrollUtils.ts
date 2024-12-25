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

  // Try each container, starting from the closest to the verse
  scrollableContainers.forEach((container, index) => {
    try {
      const elementRect = verseElement.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      console.log(`Attempting to scroll container ${index}:`, {
        containerType: container.tagName,
        elementTop: elementRect.top,
        containerTop: containerRect.top,
        containerHeight: containerRect.height,
        elementHeight: elementRect.height,
        currentScroll: container.scrollTop
      });

      // Try multiple scroll methods
      // 1. Direct scrollTop manipulation
      if (container instanceof HTMLElement) {
        const scrollTop = elementRect.top + container.scrollTop - 
          (containerRect.height / 2) + (elementRect.height / 2);
        
        container.style.scrollBehavior = 'smooth';
        container.scrollTop = scrollTop;
        
        // If in iframe, also try to scroll the iframe
        if (window.frameElement) {
          window.parent.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
          });
        }
      }
      
      // 2. scrollIntoView as backup
      verseElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      
      // 3. Force scroll through postMessage if in iframe
      if (window.frameElement) {
        window.parent.postMessage({
          type: 'scrollTo',
          top: verseElement.offsetTop - (window.innerHeight / 2),
        }, '*');
      }
      
    } catch (error) {
      console.error(`Scroll error for container ${index}:`, error);
    }
  });
};