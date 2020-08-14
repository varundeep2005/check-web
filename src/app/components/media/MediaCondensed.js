import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import CardHeader from '@material-ui/core/CardHeader';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import IconButton from '@material-ui/core/IconButton';
import IconMoreVert from '@material-ui/icons/MoreVert';
import { can } from '../Can';
import { withSetFlashMessage } from '../FlashMessage';
import TimeBefore from '../TimeBefore';
import MediaTypeDisplayName from './MediaTypeDisplayName';
import MediaRoute from '../../relay/MediaRoute';
import DeleteRelationshipMutation from '../../relay/mutations/DeleteRelationshipMutation';
import UpdateRelationshipMutation from '../../relay/mutations/UpdateRelationshipMutation';
import EditTitleAndDescriptionMenuItem from './EditTitleAndDescriptionMenuItem';
import { truncateLength, parseStringUnixTimestamp } from '../../helpers';
import { stringHelper } from '../../customHelpers';
import { black87 } from '../../styles/js/shared';

class MediaCondensedComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      broken: false,
    };
  }

  getDescription() {
    return (typeof this.state.description === 'string') ? this.state.description.trim() : this.props.media.description;
  }

  getTitle() {
    return (typeof this.state.title === 'string') ? this.state.title.trim() : this.props.media.title;
  }

  handleCancel() {
    this.setState({
      title: null,
      description: null,
    });
  }

  canSubmit = () => {
    const { title, description } = this.state;
    const permissions = JSON.parse(this.props.media.permissions);
    return (permissions['update Dynamic'] !== false && (typeof title === 'string' || typeof description === 'string'));
  };

  handleChangeTitle(e) {
    this.setState({ title: e.target.value });
  }

  handleChangeDescription(e) {
    this.setState({ description: e.target.value });
  }

  handleBreakRelationship() {
    const onFailure = () => {
      const message = (
        <FormattedMessage
          id="mediaCondensed.breakRelationshipError"
          defaultMessage="Sorry, an error occurred while breaking the relationship. Please try again and contact {supportEmail} if the condition persists."
          values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
        />
      );
      this.props.setFlashMessage(message);
      this.setState({ broken: false });
    };

    const { id, source, target } = this.props.media.relationship;

    Relay.Store.commitUpdate(
      new DeleteRelationshipMutation({
        id,
        source,
        target,
        media: this.props.media,
        target_id: this.props.target_id || null,
        source_id: this.props.source_id || null,
        current: this.props.currentRelatedMedia,
      }),
      { onFailure },
    );

    this.setState({ broken: true, anchorEl: null });
  }

  handlePromoteRelationship() {
    const { id, source, target } = this.props.media.relationship;

    const onFailure = () => {
      const message = (
        <FormattedMessage
          id="mediaCondensed.updateRelationshipError"
          defaultMessage="Sorry, an error occurred while updating the relationship. Please try again and contact {supportEmail} if the condition persists."
          values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
        />
      );
      this.props.setFlashMessage(message);
    };

    const onSuccess = () => {
      if (/(\/project\/[0-9]+)?\/media\/[0-9]+$/.test(window.location.pathname)) {
        const currentMediaId = window.location.pathname.match(/[0-9]+$/)[0];
        if (target.dbid !== parseInt(currentMediaId, 10)) {
          window.location = window.location.href.replace(/[0-9]+$/, `${target.dbid}?reload=true`);
        }
      }
    };

    Relay.Store.commitUpdate(
      new UpdateRelationshipMutation({
        id,
        source,
        target,
        media: this.props.media,
        current: this.props.currentRelatedMedia || this.props.media,
      }),
      { onFailure, onSuccess },
    );

    this.setState({ anchorEl: null });
  }

  handleOpenMenu = (e) => {
    this.setState({ anchorEl: e.currentTarget });
  };

  handleCloseMenu = () => {
    this.setState({ anchorEl: null });
  };

  render() {
    if (this.state.broken) {
      return null;
    }

    const { media } = this.props;

    let smoochBotInstalled = false;
    if (media.team && media.team.team_bot_installations) {
      media.team.team_bot_installations.edges.forEach((edge) => {
        if (edge.node.team_bot.identifier === 'smooch') {
          smoochBotInstalled = true;
        }
      });
    }

    const { mediaUrl } = this.props;

    return (
      <span style={{ display: 'block', position: 'relative' }}>
        <CardHeader
          title={
            <Link to={mediaUrl} className="media-condensed__title">
              <span style={{ color: black87 }}>
                {truncateLength(media.title, 120)}
              </span>
            </Link>}
          subheader={
            <p>
              <Link to={mediaUrl}>
                <span><MediaTypeDisplayName mediaType={media.type} /></span>
                { smoochBotInstalled ?
                  <span>
                    <span style={{ margin: '0 8px' }}> - </span>
                    <span>
                      <FormattedMessage
                        id="mediaCondensed.requests"
                        defaultMessage="{count} requests"
                        values={{
                          count: media.requests_count,
                        }}
                      />
                    </span>
                  </span> : null
                }
                <span style={{ margin: '0 8px' }}> - </span>
                <TimeBefore date={parseStringUnixTimestamp(media.last_seen)} />
              </Link>
            </p>
          }
          avatar={
            <Link to={mediaUrl}>
              <img
                alt=""
                style={{ height: '100px', width: '100px', objectFit: 'cover' }}
                src={media.picture}
              />
            </Link>
          }
          style={{
            cursor: 'pointer',
            padding: 0,
            height: 100,
          }}
        />
        { !media.archived ?
          <div>
            <IconButton
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
              }}
              tooltip={
                <FormattedMessage id="mediaCondensed.tooltip" defaultMessage="Item actions" />
              }
              onClick={this.handleOpenMenu}
            >
              <IconMoreVert className="media-condensed__actions_icon" />
            </IconButton>
            <Menu
              anchorEl={this.state.anchorEl}
              keepMounted
              open={Boolean(this.state.anchorEl)}
              onClose={this.handleCloseMenu}
            >
              {(media.relationships && media.relationships.sources_count > 0 && can(media.relationship.permissions, 'update Relationship')) ? (
                <MenuItem key="promote" className="media-condensed__promote-relationshp" onClick={this.handlePromoteRelationship.bind(this)}>
                  <FormattedMessage id="mediaCondensed.promote" defaultMessage="Promote to primary item" />
                </MenuItem>
              ) : null}
              {(media.relationships && media.relationships.sources_count > 0 && can(media.relationship.permissions, 'destroy Relationship')) ? (
                <MenuItem key="break" className="media-condensed__break-relationship" onClick={this.handleBreakRelationship.bind(this)} >
                  <FormattedMessage id="mediaCondensed.break" defaultMessage="Break relation to primary item" />
                </MenuItem>
              ) : null}
              {can(media.permissions, 'update ProjectMedia') ? (
                <EditTitleAndDescriptionMenuItem
                  projectMedia={media}
                  className="media-condensed__edit"
                  onClick={this.handleCloseMenu}
                />
              ) : null}
            </Menu>
          </div> : null }
      </span>
    );
  }
}

MediaCondensedComponent.propTypes = {
  setFlashMessage: PropTypes.func.isRequired,
};

const ConnectedMediaCondensedComponent = withSetFlashMessage(MediaCondensedComponent);

const MediaCondensedContainer = Relay.createContainer(ConnectedMediaCondensedComponent, {
  fragments: {
    media: () => Relay.QL`
      fragment on ProjectMedia {
        id
        dbid
        title
        ${EditTitleAndDescriptionMenuItem.getFragment('projectMedia')}
        description
        archived
        type
        overridden
        metadata
        picture
        last_seen
        share_count
        permissions
        requests_count
        team {
          id
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
        relationship {
          id
          source { id, dbid }
          target { id, dbid }
          permissions
        }
        relationships {
          sources_count
        }
      }
    `,
  },
});

const MediaCondensedRootContainer = (props) => {
  const ids = `${props.media.dbid}`;
  const route = new MediaRoute({ ids });

  if (props.media.dbid === 0) {
    return (
      <ConnectedMediaCondensedComponent {...props} />
    );
  }

  return (
    <Relay.RootContainer
      Component={MediaCondensedContainer}
      renderFetched={data =>
        <MediaCondensedContainer {...props} {...data} />}
      route={route}
    />
  );
};

export default MediaCondensedContainer;
export { MediaCondensedRootContainer };
