import { variables, mixins } from '../../../styles/js';

export const styles = (theme) => ({
  root: {
    width: '100%',
    ...mixins({ theme }).noselect,
  },
  tableWrapper: {
    ...mixins({ theme }).noOutline,
    height: `calc(100vh - 120px)`,
    overflowY: 'auto',
    overflowX: 'auto',
    borderBottom: `solid 1px ${theme.palette.fileExplorerThinLineDividerColor}`,
    borderLeft: `solid 1px ${theme.palette.fileExplorerThinLineDividerColor}`,
    [`&.onHoverDropZone`]: {
      backgroundColor: theme.palette.fileDrop,
    },
    [`&.statusBarActive`]: {
      height: `calc(100vh - 150px) !important`,
    },
  },
});
