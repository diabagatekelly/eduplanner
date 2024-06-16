export function getWindowLocationHash(window) {
  return {
    type: 'POPULATE',
    window: window.location.hash
  };
}