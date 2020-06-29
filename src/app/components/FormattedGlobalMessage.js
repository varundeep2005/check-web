import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import globalStrings from '../globalStrings';

function FormattedGlobalMessage({ messageKey, ...rest }) {
  const message = globalStrings[messageKey];
  return <FormattedMessage {...message} {...rest} />;
}
FormattedGlobalMessage.propTypes = {
  messageKey: PropTypes.oneOf(Object.keys(globalStrings)).isRequired,
};

export default FormattedGlobalMessage;
