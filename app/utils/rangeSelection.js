/**
 * description - Shift+click selection, like Finder: adds every item between the anchor (the last selected item)
 * and the clicked item, in display order, to the current selection. The anchor stays last, so further
 * Shift+clicks extend from the same item.
 *
 * @param {string[]} orderedPaths - paths in the order they are displayed
 * @param {string[]} selected - currently selected paths, in selection order
 * @param {string} path - the clicked path
 * @return {string[]|null} the new selection, or null if there is no usable anchor
 */
export function rangeSelection(orderedPaths, selected, path) {
  const anchor = selected[selected.length - 1];
  const from = orderedPaths.indexOf(anchor);
  const to = orderedPaths.indexOf(path);

  if (from === -1 || to === -1 || from === to) {
    return null;
  }

  const range = orderedPaths.slice(Math.min(from, to), Math.max(from, to) + 1);

  if (from < to) {
    range.reverse();
  }

  const inRange = new Set(range);

  return [...selected.filter((p) => !inRange.has(p)), ...range];
}
