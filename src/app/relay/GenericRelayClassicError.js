import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import AccessDenied from '../components/AccessDenied';

const NotFoundGenericRelayClassicError = () => (
  <Typography color="error" variant="h2">
    <FormattedMessage id="notFound.title" defaultMessage="Not Found" />
  </Typography>
);

// ErrorNames[3] == 'NOT_FOUND'
// lib/error_codes.rb
const ErrorNames = [
  undefined, // 0
  'UNAUTHORIZED', // 1
  'MISSING_PARAMETERS', // 2
  'ID_NOT_FOUND', // 3
  'INVALID_VALUE', // 4
  'UNKNOWN', // 5
  'AUTH', // 6
  'WARNING', // 7
  'MISSING_OBJECT', // 8
  'DUPLICATED', // 9
  'LOGIN_2FA_REQUIRED', // 10
  'CONFLICT', // 11
];

// ErrorCodes.NOT_FOUND == 3
const ErrorCodes = {};
ErrorNames.forEach((id, code) => {
  if (code > 0) {
    ErrorCodes[id] = code;
  }
});


/**
 * Component to render in a `Relay.RootContainer`'s `renderFailure` callback.
 */
function GenericRelayClassicError({ error }) {
  if (error.source && error.source.code) {
    const errorCode = error.source.code;
    const errorName = ErrorNames[errorCode];
    switch (errorCode) {
    case ErrorCodes.NOT_FOUND:
      return <NotFoundGenericRelayClassicError />;
    case ErrorCodes.UNAUTHORIZED:
    case ErrorCodes.AUTH: // TODO verify there's no difference?
      return <AccessDenied />;
    default:
      return <Typography color="error" variant="h2">{errorName}</Typography>;
    }
  }

  return (
    <React.Fragment>
      <Typography color="error">
        {error.message}
      </Typography>
    </React.Fragment>
  );
}
GenericRelayClassicError.propTypes = {
  error: PropTypes.object.isRequired,
};

/**
 * Callback for `Relay.RootContainer`'s `renderFailure` prop.
 *
 * Usage:
 *
 *     <Relay.RootContainer
 *       ...
 *       renderFailure={renderGenericFailure}
 *     />
 *
 * Tested behaviors:
 *
 * [ ] Render "Not Found" (_somewhere_ on the page) on failure.
 * [ ] Render "Join team" (in a dialog) if user has no access to team.
 * [ ] Render "Forbidden" (_somewhere_ on the page) on other auth failure.
 */
function renderGenericFailure(error/* , retry */) {
  return <GenericRelayClassicError error={error} />;
}

export default GenericRelayClassicError;
export { renderGenericFailure };
