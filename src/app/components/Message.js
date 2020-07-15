import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import styled from 'styled-components';
import CloseIcon from '@material-ui/icons/Close';

const AnchorOrigin = {
  horizontal: 'center',
  vertical: 'top',
};

// TODO don't allow <a> in messages. (Use buttons instead.)
// For now, we use styled-components because it can override nested children.
// (Also, TODO upgrade to react v4, so the <a> would be a direct child of the
// <Snackbar> and not a nested child in a <span>.)
const StyledText = styled.div`
  a, a:visited {
    color: inherit;
    text-decoration: underline;
  }
`;

const Message = (props) => {
  const { message, onClick } = props;
  const handleClickMessage = React.useCallback((ev) => {
    // The snackbar doesn't have an onClick handler. But sometimes, `message`
    // contains an <a> element. When the user clicks the <a> we can assume the
    // user read the message, so let's dismiss it.
    //
    // TODO don't put <a> elements in messages. Instead, use the text-button
    // design at https://material.io/components/snackbars
    if (ev.target.nodeName === 'A') {
      onClick(ev);
    }
  }, [onClick]);

  return (
    <Snackbar
      anchorOrigin={AnchorOrigin}
      open={Boolean(message)}
      onClose={onClick}
      message={message
        ? <StyledText className="message" onClick={handleClickMessage}>{message}</StyledText>
        : null
      }
      action={
        <IconButton size="small" aria-label="close" color="inherit" onClick={onClick}>
          <CloseIcon fontSize="small" />
        </IconButton>
      }
    />
  );
};
Message.defaultProps = {
  message: null,
};
Message.propTypes = {
  message: PropTypes.node, // or null
  onClick: PropTypes.func.isRequired,
};

export default Message;
