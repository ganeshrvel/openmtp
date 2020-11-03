import React, { PureComponent } from 'react';
import { quickHash } from '../../../utils/funcs';
import { fileExplorerKeymaps } from '../../../constants/keymaps';

export default class KbdRender extends PureComponent {
  render() {
    const { styles } = this.props;

    return Object.keys(fileExplorerKeymaps).map((a) => {
      const item = fileExplorerKeymaps[a];

      return (
        <div key={a}>
          <div className={styles.kbdWrapper}>
            <span className={styles.kbdTitle}>{item.label}</span>
            <div className={styles.kbdInnerWrapper}>
              {item.keys.map((key, keyIndex) => {
                const keySplit = key.split('+');

                return (
                  <span key={quickHash(key)}>
                    {keySplit.map((f, fIndex) => {
                      return (
                        <span key={quickHash(f)}>
                          <kbd>{f}</kbd>
                          {fIndex === keySplit.length - 1 ? null : `+`}
                        </span>
                      );
                    })}
                    {keyIndex === item.keys.length - 1 ? null : ` or `}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      );
    });
  }
}
