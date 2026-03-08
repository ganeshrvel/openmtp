import { mixins } from '../../../styles/js';

export const styles = (theme) => ({
  root: {},
  btnPositive: {
    ...mixins({ theme }).btnPositive,
  },
  btnNegative: {
    ...mixins({ theme }).btnNegative,
  },
  metadataRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '4px 0',
  },
  metadataLabel: {
    fontWeight: 600,
    minWidth: 100,
  },
  metadataValue: {
    textAlign: 'right',
  },
  sizeIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 0',
  },
  applyToAllWrapper: {
    padding: '12px 0 0',
  },
});
