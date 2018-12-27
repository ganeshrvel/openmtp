'use strict';

export const resetOverFlowY = () => {
  if (document) {
    document.body.style.overflowY = 'hidden';
  }
};
