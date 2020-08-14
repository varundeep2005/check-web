import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import MenuItem from '@material-ui/core/MenuItem';
import EditTitleAndDescriptionDialog from './EditTitleAndDescriptionDialog';

const EditTitleAndDescriptionMenuItem = React.forwardRef((props, ref) => {
  const { projectMedia, className, onClick } = props;
  const [open, setOpen] = React.useState(false);
  const handleClickOpen = React.useCallback(() => {
    setOpen(true);
    onClick();
  }, [setOpen]);
  const handleCloseDialog = React.useCallback(() => setOpen(false), [setOpen]);

  return (
    <MenuItem key="mediaActions.edit" className={className} onClick={handleClickOpen} ref={ref}>
      <FormattedMessage id="mediaActions.edit" defaultMessage="Edit title and description" />
      <EditTitleAndDescriptionDialog
        projectMedia={projectMedia}
        open={open}
        onClose={handleCloseDialog}
      />
    </MenuItem>
  );
});
EditTitleAndDescriptionMenuItem.propTypes = {
  projectMedia: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  className: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired, // func() => close menu
};
EditTitleAndDescriptionMenuItem.displayName = 'EditTitleAndDescriptionMenuItem';

export default createFragmentContainer(EditTitleAndDescriptionMenuItem, {
  projectMedia: graphql`
    fragment EditTitleAndDescriptionMenuItem_projectMedia on ProjectMedia {
      id
      ...EditTitleAndDescriptionDialog_projectMedia
    }
  `,
});
