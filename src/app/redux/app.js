import { SET_CONTEXT } from './ActionTypes';

export default function app(state_ = { session: null }, action) {
  const state = state_;
  if (action.type === SET_CONTEXT) {
    state.context = action;
    return state;
  }
  return action;
}
