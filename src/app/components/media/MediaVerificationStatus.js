import React, { Component } from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import CreateStatusMutation from '../../relay/mutations/CreateStatusMutation';
import UpdateStatusMutation from '../../relay/mutations/UpdateStatusMutation';
import MediaStatusCommon from './MediaStatusCommon';

// FIXME move <MediaStatusCommon> into this file
class MediaVerificationStatus extends Component {
  setStatus = (context, media, status) => {
    const status_id = media.last_status_obj ? media.last_status_obj.id : '';
    const status_attr = {
      parent_type: 'project_media',
      annotated: media,
      annotation: {
        status,
        annotated_type: 'ProjectMedia',
        annotated_id: media.dbid,
        status_id,
      },
    };

    const onFailure = (transaction) => {
      context.fail(transaction);
    };

    const onSuccess = (data) => {
      const pm = data.updateDynamic.project_media;
      if (pm.project_ids.length !== media.project_ids.length) {
        const newPath = window.location.pathname.replace(/project\/[0-9]+/, `project/${pm.project_ids.pop()}`);
        window.location = `${newPath}?reload=true`;
      } else if (this.props.callback) {
        this.props.callback();
      } else {
        context.success('status');
      }
    };

    // Add or Update status
    if (status_id && status_id.length) {
      Relay.Store.commitUpdate(new UpdateStatusMutation(status_attr), { onSuccess, onFailure });
    } else {
      Relay.Store.commitUpdate(new CreateStatusMutation(status_attr), { onSuccess, onFailure });
    }
  }

  render() {
    return <MediaStatusCommon {...this.props} setStatus={this.setStatus} />;
  }
}

export { MediaVerificationStatus }; // DELETEME: use default export in ReportDesignerTopBar
export default createFragmentContainer(MediaVerificationStatus, {
  team: graphql`
    fragment MediaVerificationStatus_team on Team {
      id
      verification_statuses
    }
  `,
  media: graphql`
    fragment MediaVerificationStatus_media on ProjectMedia {
      id
      last_status
      permissions
    }
  `,
});
