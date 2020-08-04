import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { commitMutation, createFragmentContainer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import MenuItem from '@material-ui/core/MenuItem';
import useGenericCommitMutationHandlers from '../../relay/useGenericCommitMutationHandlers';

function commitRefreshMediaMenuItem({ projectMedia, onCompleted, onError }) {
  return commitMutation(Relay.Store, {
    mutation: graphql`
      mutation RefreshMediaMenuItemMutation($input: UpdateProjectMediaInput!) {
        updateProjectMedia(input: $input) {
          # mutations _must_ have a selection of subfields. So we add a spurious
          # affectedId.
          affectedId
        }
      }
    `,
    variables: {
      input: {
        id: projectMedia.id,
        refresh_media: 1,
      },
    },
    onCompleted,
    onError,
  });
}

function RefreshMediaMenuItem({ projectMedia, onClick }) {
  const { onCompleted, onError } = useGenericCommitMutationHandlers();
  const handleClick = React.useCallback(() => {
    commitRefreshMediaMenuItem({ projectMedia, onCompleted, onError });
    onClick();
  }, [projectMedia, onClick, onCompleted, onError]);

  return (
    <MenuItem className="media-actions__refresh" onClick={handleClick}>
      <FormattedMessage id="mediaActions.refresh" defaultMessage="Refresh" />
    </MenuItem>
  );
}
RefreshMediaMenuItem.propTypes = {
  projectMedia: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default createFragmentContainer(RefreshMediaMenuItem, {
  projectMedia: graphql`
    fragment RefreshMediaMenuItem_projectMedia on ProjectMedia {
      id
    }
  `,
});
