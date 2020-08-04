import React from 'react';
import { FlashMessageSetterContext } from '../components/FlashMessage';
import GenericUnknownErrorMessage from '../components/GenericUnknownErrorMessage';
import { getErrorMessage } from '../helpers';

/**
 * Generic error-handling routines.
 *
 * Usage:
 *
 * ```
 * const onSuccess = data => {};
 * const { onCompleted, onError } = useGenericRelayModernResponseHandlers(onSuccess);
 * commitMutation(environment, {
 *   ...,
 *   onCompleted,
 *   onError,
 * });
 * ```
 *
 * The behaviors:
 *
 * * If onError is called, we decipher it and set the global flash message.
 * * If onCompleted is called with { errors }, we decipher one and set the
 *   global flash message.
 * * Otherwise we do nothing, and there's no problem.
 *
 * TODO nix the generic-ness! Allow custom messages -- or better yet, custom
 * _actions_.
 */
export default function useGenericRelayModernResponseHandlers(onSuccess) {
  const setFlashMessage = React.useContext(FlashMessageSetterContext);

  const onCompleted = React.useCallback(({ data, errors }) => {
    if (errors) {
      // TODO use application-level errors, not Relay-level errors. Then
      // this code will never be called.
      console.error('Error(s) from API server', errors); // eslint-disable-line no-console
      const message = errors.map(e => e.message).filter(m => Boolean(m));
      setFlashMessage(message || <GenericUnknownErrorMessage />);
      return;
    }
    if (onSuccess) {
      onSuccess(data);
    }
  }, [onSuccess, setFlashMessage]);
  const onError = React.useCallback((error) => {
    // TODO make the network layer never throw
    console.error('Error from GraphQL network layer', error); // eslint-disable-line no-console
    const message = getErrorMessage(error);
    setFlashMessage(message || <GenericUnknownErrorMessage />);
  }, [setFlashMessage]);
  return React.useMemo(() => ({ onCompleted, onError }), [onCompleted, onError]);
}
