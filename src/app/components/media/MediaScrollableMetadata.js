import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { black16 } from '../../styles/js/shared';

const useStyles = makeStyles({
  root: {
    height: 'calc(100vh - 170px)',
    display: 'flex',
    flexDirection: 'column',
    borderTop: `1px solid ${black16}`,
    borderBottom: `1px solid ${black16}`,
  },
});

/**
 * Container in which to put an "overflow-y: auto" component.
 *
 * Height is set to the height of the <MediaPage> minus headers. If children
 * are set to "flex: 1 1 auto; overflow-y: auto", then the contents will fit the
 * page by default.
 */
export default function MediaScrollableMetadata({ id, children }) {
  const classes = useStyles();

  return (
    <div className={classes.root} id={id}>
      {children}
    </div>
  );
}
MediaScrollableMetadata.defaultProps = {
  id: undefined,
};
MediaScrollableMetadata.propTypes = {
  children: PropTypes.node.isRequired,
  id: PropTypes.string, // or undefined
};
