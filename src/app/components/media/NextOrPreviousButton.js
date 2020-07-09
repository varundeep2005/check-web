import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import MediaSearchRedirect from './MediaSearchRedirect';

/**
 * <Button> that renders a <MediaSearchRedirect> when clicked.
 *
 * Once the user clicks this `<Button>`, it becomes "unfriendly": simply having
 * it mounted will cause an eventual redirect. Callers should use the `key` prop
 * to unmount the component if any of its props are going to change.
 */
export default function NextOrPreviousButton({
  children, className, disabled, tooltipTitle, buildSiblingUrl, listQuery, listIndex, edge,
}) {
  const [loading, setLoading] = React.useState(false);
  const handleClick = React.useCallback(() => setLoading(true), [setLoading]);

  return (
    <IconButton
      disabled={disabled || loading}
      className={className}
      onClick={handleClick}
      edge={edge}
    >
      {loading ? (
        <MediaSearchRedirect
          buildSiblingUrl={buildSiblingUrl}
          listQuery={listQuery}
          listIndex={listIndex}
        />
      ) : (
        <Tooltip title={tooltipTitle}>
          {children}
        </Tooltip>
      )}
    </IconButton>
  );
}
NextOrPreviousButton.defaultProps = {
  className: null,
  disabled: false,
  edge: false,
};
NextOrPreviousButton.propTypes = {
  buildSiblingUrl: PropTypes.func.isRequired, // func(dbid, listIndex) => location
  disabled: PropTypes.bool,
  edge: PropTypes.oneOf([false, 'start', 'end']), // default false
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  tooltipTitle: PropTypes.node.isRequired, // <FormattedMessage>
  listQuery: PropTypes.object.isRequired,
  listIndex: PropTypes.number.isRequired,
};
