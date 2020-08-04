import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { commitMutation, createFragmentContainer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import MenuItem from '@material-ui/core/MenuItem';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import { FlashMessageSetterContext } from '../FlashMessage';
import { getErrorMessageForRelayModernProblem } from '../../helpers';

function commitRefreshMediaMenuItem({ projectMedia, onSuccess, onFailure }) {
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
    onError: onFailure,
    onCompleted: ({ data, errors }) => {
      if (errors) {
        return onFailure(errors);
      }
      return onSuccess(data);
    },
  });
}

function RefreshMediaMenuItem({ projectMedia }) {
  const setFlashMessage = React.useContext(FlashMessageSetterContext);
  const handleClick = React.useCallback(() => {
    commitRefreshMediaMenuItem({
      projectMedia,
      onSuccess: () => {},
      onFailure: (errors) => {
        console.error(errors); // eslint-disable-line no-console
        setFlashMessage((
          getErrorMessageForRelayModernProblem(errors) || <GenericUnknownErrorMessage />
        ));
      },
    });
  }, [projectMedia, setFlashMessage]);

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
};

export default createFragmentContainer(RefreshMediaMenuItem, {
  projectMedia: graphql`
    fragment RefreshMediaMenuItem_projectMedia on ProjectMedia {
      id
    }
  `,
});
