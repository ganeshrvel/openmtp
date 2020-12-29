import { isProcessRunning } from './process';

export const isGoogleAndroidFileTransferActive = async () => {
  const isAftRunning = await isProcessRunning('Android File transfer.app');
  const isAftAgentRunning = await isProcessRunning(
    'Android File Transfer Agent.app'
  );

  return isAftRunning && isAftAgentRunning;
};
