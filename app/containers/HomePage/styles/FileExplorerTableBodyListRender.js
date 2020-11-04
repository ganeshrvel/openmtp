export const tableCellFileExplorerTableRowsRender = {
  borderBottom: `unset`,
  [`&.checkboxCell`]: {
    width: 50,
  },
  [`&.nameCell`]: {
    display: 'flex',
    alignItems: 'center',
    whiteSpace: `nowrap`,
    overflow: `hidden`,
    textOverflow: `ellipsis`,
  },
  [`&.sizeCell`]: {
    whiteSpace: `nowrap`,
    overflow: `hidden`,
    textOverflow: `ellipsis`,
    width: `auto`,
    minWidth: 100,
  },
  [`&.dateAddedCell`]: {
    whiteSpace: `nowrap`,
    overflow: `hidden`,
    textOverflow: `ellipsis`,
    width: `auto`,
    minWidth: 100,
    paddingRight: 10,
  },
};

export const styles = (_) => {
  return {
    tableRowSelected: {
      backgroundColor: 'rgba(41, 121, 255, 0.15) !important',
    },
    tableCell: tableCellFileExplorerTableRowsRender,
    fileTypeIconWrapper: {
      paddingTop: 5,
      paddingBottom: 5,
      paddingLeft: 2,
      textAlign: 'center',
    },
    fileTypeIcon: {
      verticalAlign: `middle`,
      height: 20,
      width: 'auto',
    },
    truncate: {
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      maxWidth: 310,
      whiteSpace: 'nowrap',
    },
  };
};
