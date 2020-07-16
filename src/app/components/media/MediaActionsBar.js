import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import { browserHistory, Link } from 'react-router';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';
import IconReport from '@material-ui/icons/Receipt';
import MediaVerificationStatus from './MediaVerificationStatus';
import MediaActions from './MediaActions';
import Attribution from '../task/Attribution';
import CreateProjectMediaProjectMutation from '../../relay/mutations/CreateProjectMediaProjectMutation';
import UpdateProjectMediaMutation from '../../relay/mutations/UpdateProjectMediaMutation';
import UpdateProjectMediaProjectMutation from '../../relay/mutations/UpdateProjectMediaProjectMutation';
import DeleteProjectMediaProjectMutation from '../../relay/mutations/DeleteProjectMediaProjectMutation';
import UpdateStatusMutation from '../../relay/mutations/UpdateStatusMutation';
import MoveDialog from './MoveDialog';
import CheckContext from '../../CheckContext';
import globalStrings from '../../globalStrings';
import { withSetFlashMessage } from '../FlashMessage';
import { stringHelper } from '../../customHelpers';
import { getErrorMessage } from '../../helpers';

const Styles = theme => ({
  root: {
    display: 'flex',
    flex: '1 1 auto', // take full width on smaller screens
    height: theme.spacing(8),
    alignItems: 'center',
    padding: theme.spacing(0, 2),
    justifyContent: 'space-between',
  },
  spacedButton: {
    marginRight: theme.spacing(1),
  },
});

class MediaActionsBarComponent extends Component {
  static handleReportDesigner() {
    const path = `${window.location.pathname}/report`;
    browserHistory.push(path);
  }

  constructor(props) {
    super(props);

    this.state = {
      openAddToListDialog: false,
      openMoveDialog: false,
      openAssignDialog: false,
      dstProj: null,
      isEditing: false,
      title: null,
      description: null,
    };
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  getDescription() {
    return (typeof this.state.description === 'string') ? this.state.description : this.props.projectMedia.description;
  }

  getTitle() {
    return (typeof this.state.title === 'string') ? this.state.title : this.props.projectMedia.title;
  }

  handleAddToList = () => {
    this.setState({ openAddToListDialog: true });
  }

  handleAddItemToList() {
    const { team } = this.props;
    const onSuccess = (response) => {
      const { project } = response.createProjectMediaProject;
      const message = (
        <FormattedMessage
          id="mediaMetadata.addedToList"
          defaultMessage="Added to list {listName}"
          values={{
            listName: (
              <Link to={`/${team.slug}/project/${project.dbid}`}>
                {project.title}
              </Link>
            ),
          }}
        />
      );
      this.props.setFlashMessage(message);
    };

    Relay.Store.commitUpdate(
      new CreateProjectMediaProjectMutation({
        project: this.state.dstProj,
        project_media: this.props.projectMedia,
      }),
      { onSuccess, onFailure: this.fail },
    );

    this.setState({ openAddToListDialog: false });
  }

  handleMove = () => {
    this.setState({ openMoveDialog: true });
  }

  fail(transaction) {
    const fallbackMessage = (
      <FormattedMessage
        {...globalStrings.unknownError}
        values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
      />
    );
    const message = getErrorMessage(transaction, fallbackMessage);
    this.props.setFlashMessage(message);
  }

  handleMoveProjectMedia() {
    const { team, project, projectMedia } = this.props;
    const { dstProj: { dbid: projectId } } = this.state;

    const onFailure = (transaction) => {
      this.fail(transaction);
    };

    const path = `/${team.slug}/project/${projectId}`;
    this.props.setFlashMessage((
      <FormattedMessage
        id="mediaActionsBar.movingItem"
        defaultMessage="Moving item..."
      />
    ));

    const onSuccess = () => {
      browserHistory.push(path);
    };

    Relay.Store.commitUpdate(
      new UpdateProjectMediaProjectMutation({
        projectMedia,
        previousProject: project,
        project: this.state.dstProj,
      }),
      { onSuccess, onFailure },
    );

    this.setState({ openMoveDialog: false });
  }

  handleRemoveFromList = () => {
    const { team, project, projectMedia } = this.props;

    const onSuccess = () => {
      const message = (
        <FormattedMessage
          id="mediaActionsBar.removedFromList"
          defaultMessage="Removed from list"
        />
      );
      this.props.setFlashMessage(message);
      const path = `/${team.slug}/media/${projectMedia.dbid}`;
      browserHistory.push(path);
    };

    Relay.Store.commitUpdate(
      new DeleteProjectMediaProjectMutation({
        project,
        projectMedia,
      }),
      { onSuccess, onFailure: this.fail },
    );
  }

  canSubmit = () => {
    const { projectMedia } = this.props;
    const { title, description } = this.state;
    const permissions = JSON.parse(projectMedia.permissions);
    return (permissions['update Dynamic'] !== false && (typeof title === 'string' || typeof description === 'string'));
  };

  handleChangeTitle(e) {
    this.setState({ title: e.target.value });
  }

  handleChangeDescription(e) {
    this.setState({ description: e.target.value });
  }

  handleSave = (ev) => {
    if (ev) {
      ev.preventDefault();
    }

    const { projectMedia } = this.props;

    const embed = {
      title: this.getTitle().trim(),
      description: this.getDescription().trim(),
    };

    if (embed.title === '' && projectMedia.media.embed_path) {
      embed.title = projectMedia.media.embed_path.split('/').pop().replace('embed_', '');
    }

    const onFailure = (transaction) => {
      const fallbackMessage = (
        <FormattedMessage
          id="mediaDetail.editReportError"
          defaultMessage="Sorry, an error occurred while updating the item. Please try again and contact {supportEmail} if the condition persists."
          values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
        />
      );
      const message = getErrorMessage(transaction, fallbackMessage);
      this.props.setFlashMessage(message);
    };

    if (this.canSubmit()) {
      Relay.Store.commitUpdate(
        new UpdateProjectMediaMutation({
          media: projectMedia,
          metadata: JSON.stringify(embed),
          id: projectMedia.id,
          srcProj: null,
          dstProj: null,
        }),
        { onFailure },
      );
    }

    this.handleCancel();
  }

  handleSendToTrash() {
    const { team, projectMedia, project } = this;
    const onSuccess = () => {
      const message = (
        <FormattedMessage
          id="mediaActionsBar.movedToTrash"
          defaultMessage="Sent to {trash}"
          values={{
            trash: (
              <Link to={`/${team.slug}/trash`}>
                <FormattedMessage id="mediaDetail.trash" defaultMessage="Trash" />
              </Link>
            ),
          }}
        />
      );
      this.props.setFlashMessage(message);
    };

    const context = this.getContext();
    if (context.team && !context.team.public_team) {
      context.team.public_team = Object.assign({}, context.team);
    }

    Relay.Store.commitUpdate(
      new UpdateProjectMediaMutation({
        archived: 1,
        check_search_team: team.search,
        check_search_project: project ? project.search : null,
        check_search_trash: team.check_search_trash,
        media: projectMedia,
        context,
        id: projectMedia.id,
        srcProj: null,
        dstProj: null,
      }),
      { onSuccess, onFailure: this.fail },
    );
  }

  handleCancel() {
    this.setState({
      isEditing: false,
      title: null,
      description: null,
    });
  }

  handleCloseDialogs() {
    this.setState({
      isEditing: false,
      openAddToListDialog: false,
      openMoveDialog: false,
      openAssignDialog: false,
      dstProj: null,
    });
  }

  handleSelectDestProject(dstProj) {
    this.setState({ dstProj });
  }

  handleEdit() {
    this.setState({ isEditing: true });
  }

  handleRefresh() {
    const { projectMedia } = this.props;
    Relay.Store.commitUpdate(
      new UpdateProjectMediaMutation({
        refresh_media: 1,
        id: projectMedia.id,
        srcProj: null,
        dstProj: null,
      }),
      { onFailure: this.fail },
    );
  }

  handleStatusLock() {
    const { projectMedia } = this.props;

    const statusAttr = {
      parent_type: 'project_media',
      annotated: projectMedia,
      annotation: {
        status_id: projectMedia.last_status_obj.id,
        locked: !projectMedia.last_status_obj.locked,
      },
    };

    Relay.Store.commitUpdate(
      new UpdateStatusMutation(statusAttr),
      { onFailure: this.fail },
    );
  }

  handleAssign() {
    this.setState({ openAssignDialog: true });
  }

  handleAssignProjectMedia() {
    const { projectMedia } = this.props;

    const onSuccess = () => {
      const message = (
        <FormattedMessage
          id="mediaActionsBar.assignmentsUpdated"
          defaultMessage="Assignments updated successfully!"
        />
      );
      this.props.setFlashMessage(message);
    };

    const status_id = projectMedia.last_status_obj ? projectMedia.last_status_obj.id : '';

    const assignment = document.getElementById(`attribution-media-${projectMedia.dbid}`).value;

    const statusAttr = {
      parent_type: 'project_media',
      annotated: projectMedia,
      annotation: {
        status_id,
        assigned_to_ids: assignment,
      },
    };

    Relay.Store.commitUpdate(
      new UpdateStatusMutation(statusAttr),
      { onSuccess, onFailure: this.fail },
    );

    this.setState({ openAssignDialog: false });
  }

  handleRestore() {
    const { projectMedia, team, project } = this.props;

    const onSuccess = () => {
      const message = (
        <FormattedMessage id="mediaActionsBar.movedBack" defaultMessage="Restored from trash" />
      );
      this.props.setFlashMessage(message);
    };

    Relay.Store.commitUpdate(
      new UpdateProjectMediaMutation({
        id: projectMedia.id,
        media: projectMedia,
        archived: 0,
        check_search_team: team.search,
        // FIXME update _all_ projects, not just the current one
        check_search_project: project ? project.search : null,
        check_search_trash: team.check_search_trash,
        srcProj: null,
        dstProj: null,
      }),
      { onSuccess, onFailure: this.fail },
    );
  }

  render() {
    const {
      classes, projectMedia, project, team,
    } = this.props;

    const addToListDialogActions = [
      <Button
        key="cancel"
        color="primary"
        onClick={this.handleCloseDialogs.bind(this)}
      >
        <FormattedMessage
          id="mediaActionsBar.cancelButton"
          defaultMessage="Cancel"
        />
      </Button>,
      <Button
        key="add"
        color="primary"
        className="media-actions-bar__add-button"
        onClick={this.handleAddItemToList.bind(this)}
        disabled={!this.state.dstProj}
      >
        <FormattedMessage id="mediaActionsBar.add" defaultMessage="Add" />
      </Button>,
    ];

    const moveDialogActions = [
      <Button
        key="cancel"
        color="primary"
        onClick={this.handleCloseDialogs.bind(this)}
      >
        <FormattedMessage
          id="mediaActionsBar.cancelButton"
          defaultMessage="Cancel"
        />
      </Button>,
      <Button
        key="move"
        color="primary"
        className="media-actions-bar__move-button"
        onClick={this.handleMoveProjectMedia.bind(this)}
        disabled={!this.state.dstProj}
      >
        <FormattedMessage id="mediaActionsBar.move" defaultMessage="Move" />
      </Button>,
    ];

    const smoochBotInstalled = team.team_bot_installations.edges
      .some(({ node }) => node.team_bot.identifier === 'smooch');
    let isChild = false;
    let isParent = false;
    if (projectMedia.relationship) {
      if (projectMedia.relationship.target_id === projectMedia.dbid) {
        isChild = true;
      } else if (projectMedia.relationship.source_id === projectMedia.dbid) {
        isParent = true;
      }
    }
    const readonlyStatus = smoochBotInstalled && isChild && !isParent;
    const published = (projectMedia.dynamic_annotation_report_design && projectMedia.dynamic_annotation_report_design.data && projectMedia.dynamic_annotation_report_design.data.state === 'published');

    const assignments = projectMedia.last_status_obj.assignments.edges;

    const assignDialogActions = [
      <Button
        color="primary"
        onClick={this.handleCloseDialogs.bind(this)}
        key="mediaActionsBar.cancelButton"
      >
        <FormattedMessage id="mediaActionsBar.cancelButton" defaultMessage="Cancel" />
      </Button>,
      <Button
        color="primary"
        onClick={this.handleAssignProjectMedia.bind(this)}
        key="mediaActionsBar.done"
      >
        <FormattedMessage id="mediaActionsBar.done" defaultMessage="Done" />
      </Button>,
    ];

    const editDialog = (
      <Dialog
        open={this.state.isEditing}
        onClose={this.handleCloseDialogs.bind(this)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <FormattedMessage id="mediaDetail.editReport" defaultMessage="Edit" />
        </DialogTitle>
        <DialogContent>
          <form onSubmit={this.handleSave} name="edit-media-form">
            <TextField
              id="media-detail__title-input"
              label={<FormattedMessage id="mediaDetail.mediaTitle" defaultMessage="Title" />}
              value={this.getTitle()}
              onChange={this.handleChangeTitle.bind(this)}
              fullWidth
              margin="normal"
            />

            <TextField
              id="media-detail__description-input"
              label={
                <FormattedMessage id="mediaDetail.mediaDescription" defaultMessage="Description" />
              }
              value={this.getDescription()}
              onChange={this.handleChangeDescription.bind(this)}
              fullWidth
              multiline
              margin="normal"
            />
          </form>
        </DialogContent>
        <DialogActions>
          <span style={{ display: 'flex' }}>
            <Button
              onClick={this.handleCancel.bind(this)}
              className="media-detail__cancel-edits"
            >
              <FormattedMessage
                id="mediaDetail.cancelButton"
                defaultMessage="Cancel"
              />
            </Button>
            <Button
              onClick={this.handleSave}
              className="media-detail__save-edits"
              disabled={!this.canSubmit()}
              color="primary"
            >
              <FormattedMessage
                id="mediaDetail.doneButton"
                defaultMessage="Done"
              />
            </Button>
          </span>
        </DialogActions>
      </Dialog>
    );

    return (
      <div className={classes.root}>
        { !projectMedia.archived ?
          <div>
            <Button
              id="media-actions-bar__add-to"
              variant="contained"
              className={classes.spacedButton}
              color="primary"
              onClick={this.handleAddToList}
            >
              <FormattedMessage
                id="mediaActionsBar.addTo"
                defaultMessage="Add to..."
              />
            </Button>

            { project ?
              <Button
                id="media-actions-bar__move-to"
                variant="contained"
                className={classes.spacedButton}
                color="primary"
                onClick={this.handleMove}
              >
                <FormattedMessage
                  id="mediaActionsBar.moveTo"
                  defaultMessage="Move to..."
                />
              </Button> : null }

            { project ?
              <Button
                id="media-actions-bar__remove-from-list"
                variant="outlined"
                className={classes.spacedButton}
                onClick={this.handleRemoveFromList}
              >
                <FormattedMessage
                  id="mediaActionsBar.removeFromList"
                  defaultMessage="Remove from list"
                />
              </Button> : null }

            <Button
              onClick={MediaActionsBarComponent.handleReportDesigner}
              id="media-detail__report-designer"
              variant="outlined"
              className={classes.spacedButton}
              startIcon={<IconReport />}
            >
              <FormattedMessage
                id="mediaActionsBar.reportDesigner"
                defaultMessage="Report"
              />
            </Button>
          </div> : <div />}

        <div
          style={{
            display: 'flex',
          }}
        >
          <MediaVerificationStatus
            media={projectMedia}
            team={team}
            readonly={
              projectMedia.archived
              || projectMedia.last_status_obj.locked
              || readonlyStatus
              || published
            }
          />

          <MediaActions
            media={projectMedia}
            onAssign={this.handleAssign.bind(this)}
            onEdit={this.handleEdit.bind(this)}
            onRefresh={this.handleRefresh.bind(this)}
            onRestore={this.handleRestore.bind(this)}
            onSendToTrash={this.handleSendToTrash.bind(this)}
            onStatusLock={this.handleStatusLock.bind(this)}
          />
        </div>

        {this.state.isEditing ? editDialog : null}

        <MoveDialog
          actions={addToListDialogActions}
          open={this.state.openAddToListDialog}
          onClose={this.handleCloseDialogs.bind(this)}
          team={team}
          excludeProjectDbids={projectMedia.project_ids}
          value={this.state.dstProj}
          onChange={this.handleSelectDestProject.bind(this)}
          title={
            <FormattedMessage
              id="mediaActionsBar.dialogAddToListTitle"
              defaultMessage="Add to a different list"
            />
          }
        />

        <MoveDialog
          actions={moveDialogActions}
          open={this.state.openMoveDialog}
          onClose={this.handleCloseDialogs.bind(this)}
          excludeProjectDbids={projectMedia.project_ids}
          team={team}
          value={this.state.dstProj}
          onChange={this.handleSelectDestProject.bind(this)}
          title={
            <FormattedMessage
              id="mediaActionsBar.dialogMoveTitle"
              defaultMessage="Move to a different list"
            />
          }
        />

        <Dialog
          open={this.state.openAssignDialog}
          onClose={this.handleCloseDialogs.bind(this)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <FormattedMessage
              id="mediaActionsBar.assignDialogHeader"
              defaultMessage="Assignment"
            />
          </DialogTitle>
          <DialogContent>
            <Attribution
              multi
              selectedUsers={assignments}
              id={`media-${projectMedia.dbid}`}
            />
          </DialogContent>
          <DialogActions>
            {assignDialogActions}
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

MediaActionsBarComponent.propTypes = {
  setFlashMessage: PropTypes.func.isRequired,
};

MediaActionsBarComponent.contextTypes = {
  store: PropTypes.object,
};

const ConnectedMediaActionsBarComponent =
  withStyles(Styles)(withSetFlashMessage(MediaActionsBarComponent));

export default createFragmentContainer(ConnectedMediaActionsBarComponent, {
  team: graphql`
    fragment MediaActionsBar_team on Team {
      ...MoveDialog_team
      ...MediaVerificationStatus_team
      id
      dbid  # here, and UpdateProjectMediaProjectMutation_projectMedia
      slug
      medias_count
      trash_count
      public_team {
        id
      }
      search {
        id
        number_of_results
      }
      check_search_trash {
        id
        number_of_results
      }
      team_bot_installations(first: 10000) {
        edges {
          node {
            id
            team_bot: bot_user {
              id
              identifier
            }
          }
        }
      }
    }
  `,
  project: graphql`
    fragment MediaActionsBar_project on Project {
      id
      dbid  # here, and UpdateProjectMediaProjectMutation_previousProject
      search_id  # UpdateProjectMediaProjectMutation_previousProject
      medias_count  # UpdateProjectMediaProjectMutation_previousProject
      title
      search {
        id
        number_of_results
      }
    }
  `,
  projectMedia: graphql`
    fragment MediaActionsBar_projectMedia on ProjectMedia {
      id
      ...MediaVerificationStatus_media
      dbid
      project_ids
      title
      demand
      description
      permissions
      metadata
      overridden
      url
      quote
      archived
      dynamic_annotation_report_design {
        id
        data
      }
      media {
        url
        embed_path
        metadata
      }
      targets_by_users(first: 50) {
        edges {
          node {
            id
            dbid
            last_status
          }
        }
      }
      last_status
      last_status_obj {
        id
        dbid
        locked
        content
        assignments(first: 10000) {
          edges {
            node {
              id
              dbid
              name
            }
          }
        }
      }
      relationship {
        id
        dbid
        target_id
        source_id
      }
    }
  `,
});
