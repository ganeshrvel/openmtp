export function getError(error) {
  if (isConsoleError(error)) {
    return error.message;
  }

  return error;
}

export function isConsoleError(e) {
  return e && e.stack;
}
