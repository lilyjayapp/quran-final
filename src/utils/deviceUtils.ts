export const isMobileDevice = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod|android/.test(userAgent);
};

export const isIOSDevice = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
};

export const isAndroidDevice = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return /android/.test(userAgent);
};