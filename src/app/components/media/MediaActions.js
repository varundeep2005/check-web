import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import IconMoreVert from '@material-ui/icons/MoreVert';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import { can } from '../Can';
import { getCurrentProjectId } from '../../helpers';

class MediaActions extends Component {
  state = {
    anchorEl: null,
  }

  handleOpenMenu = (e) => {
    this.setState({ anchorEl: e.currentTarget });
  }

  handleCloseMenu = () => {
    this.setState({ anchorEl: null });
  }

  handleOption(func) {
    this.setState({ anchorEl: null });
    func();
  }

  handleAssign = () => this.handleOption(this.props.onAssign);
  handleEdit = () => this.handleOption(this.props.onEdit);
  handleRefresh = () => this.handleOption(this.props.onRefresh);
  handleRestore = () => this.handleOption(this.props.onRestore);
  handleSendToTrash = () => this.handleOption(this.props.onSendToTrash);
  handleStatusLock = () => this.handleOption(this.props.onStatusLock);

  render() {
    const {
      media,
      onAssign,
      onEdit,
      onRefresh,
      onRestore,
      onSendToTrash,
      onStatusLock,
    } = this.props;

    const menuItems = [];

    if (can(media.permissions, 'update ProjectMedia') && !media.archived && onEdit) {
      menuItems.push((
        <MenuItem key="edit" className="media-actions__edit" onClick={this.handleEdit}>
          <FormattedMessage id="mediaActions.edit" defaultMessage="Edit title and description" />
        </MenuItem>
      ));
    }

    if (
      can(media.permissions, 'update ProjectMedia')
      && !media.archived
      && media.media.url
      && onRefresh
    ) {
      menuItems.push((
        <MenuItem key="refresh" className="media-actions__refresh" onClick={this.handleRefresh}>
          <FormattedMessage id="mediaActions.refresh" defaultMessage="Refresh" />
        </MenuItem>
      ));
    }

    if (can(media.permissions, 'update Status') && !media.archived && onAssign) {
      menuItems.push((
        <MenuItem key="assign" className="media-actions__assign" onClick={this.handleAssign}>
          <FormattedMessage id="mediaActions.assignOrUnassign" defaultMessage="Assignment" />
        </MenuItem>
      ));
    }

    if (can(media.permissions, 'lock Annotation') && !media.archived && onStatusLock) {
      menuItems.push((
        <MenuItem
          key="status-lock"
          className="media-actions__lock-status"
          onClick={this.handleStatusLock}
        >
          {media.last_status_obj.locked
            ? <FormattedMessage id="mediaActions.unlockStatus" defaultMessage="Unlock status" />
            : <FormattedMessage id="mediaActions.lockStatus" defaultMessage="Lock status" />
          }
        </MenuItem>
      ));
    }

    if (can(media.permissions, 'update ProjectMedia') && !media.archived && onSendToTrash) {
      menuItems.push((
        <MenuItem
          key="send-to-trash"
          className="media-actions__send-to-trash"
          onClick={this.handleSendToTrash}
        >
          <FormattedMessage id="mediaActions.sendToTrash" defaultMessage="Send to trash" />
        </MenuItem>
      ));
    }

    if (can(media.permissions, 'restore ProjectMedia') && media.archived && onRestore) {
      menuItems.push((
        <MenuItem key="restore" className="media-actions__restore" onClick={this.handleRestore}>
          <FormattedMessage id="mediaActions.restore" defaultMessage="Restore from trash" />
        </MenuItem>
      ));
    }

    return (
      <React.Fragment>
        <Tooltip title={
          <FormattedMessage id="mediaActions.tooltip" defaultMessage="Item actions" />
        }
        >
          <IconButton onClick={this.handleOpenMenu}>
            <IconMoreVert className="media-actions__icon" />
          </IconButton>
        </Tooltip>
        <Menu
          className="media-actions"
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handleCloseMenu}
        >
          {menuItems}
        </Menu>
      </React.Fragment>
    );
  }
}

export default MediaActions;
