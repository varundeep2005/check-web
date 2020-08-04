import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { commitMutation, createFragmentContainer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import MenuItem from '@material-ui/core/MenuItem';
import useGenericCommitMutationHandlers from '../../relay/useGenericCommitMutationHandlers';

function commitToggleLockStatus({
  projectMedia, locked, onCompleted, onError,
}) {
  return commitMutation(Relay.Store, {
    // ProjectMedia.last_status_obj is a "Dynamic". So we don't update the
    // ProjectMedia: we update its "Dynamic".
    mutation: graphql`
      mutation ToggleLockStatusMenuItemMutation($input: UpdateDynamicInput!) {
        updateDynamic(input: $input) {
          dynamic {
            id
            locked
          }
        }
      }
    `,
    optimisticResponse: {
      updateDynamic: {
        dynamic: {
          id: projectMedia.last_status_obj.id,
          locked,
        },
      },
    },
    variables: {
      input: {
        id: projectMedia.last_status_obj.id,
        locked,
      },
    },
    onCompleted,
    onError,
  });
}

function ToggleLockStatusMenuItem({ projectMedia, onClick }) {
  const { locked } = projectMedia.last_status_obj;
  const { onCompleted, onError } = useGenericCommitMutationHandlers();

  const handleClick = React.useCallback(() => {
    commitToggleLockStatus({
      projectMedia,
      locked: !locked,
      onCompleted,
      onError,
    });
    onClick();
  }, [projectMedia, locked, onCompleted, onError, onClick]);

  return (
    <MenuItem className="media-actions__lock-status" onClick={handleClick}>
      {locked
        ? <FormattedMessage id="mediaActions.unlockStatus" defaultMessage="Unlock status" />
        : <FormattedMessage id="mediaActions.lockStatus" defaultMessage="Lock status" />
      }
    </MenuItem>
  );
}
ToggleLockStatusMenuItem.propTypes = {
  projectMedia: PropTypes.shape({
    last_status_obj: PropTypes.shape({
      id: PropTypes.string.isRequired,
      locked: PropTypes.bool.isRequired,
    }).isRequired,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default createFragmentContainer(ToggleLockStatusMenuItem, {
  projectMedia: graphql`
    fragment ToggleLockStatusMenuItem_projectMedia on ProjectMedia {
      last_status_obj {
        id
        locked
      }
    }
  `,
});
