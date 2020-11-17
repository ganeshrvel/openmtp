export const initialState = {};

export default function App(state = initialState, action) {
  const { type } = action;

  switch (type) {
    default:
      return state;
  }
}
