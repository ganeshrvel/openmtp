export const resetOverFlowY = () => {
  if (typeof document !== 'undefined' && document) {
    document.body.style.overflowY = 'auto';
  }
};
