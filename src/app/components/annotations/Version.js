import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import RCTooltip from 'rc-tooltip';
import styled from 'styled-components';
import { stripUnit } from 'polished';
import { Link } from 'react-router';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import { withStyles } from '@material-ui/core/styles';
import MoreHoriz from '@material-ui/icons/MoreHoriz';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import { withSetFlashMessage } from '../FlashMessage';
import EmbedUpdate from './EmbedUpdate';
import EmbedCreate from './EmbedCreate';
import VideoAnnotationIcon from '../../../assets/images/video-annotation/video-annotation';
import TaskUpdate from './TaskUpdate';
import SourcePicture from '../source/SourcePicture';
import { guessProjectMediaUrl } from '../media/MediaDetail';
import MediaCondensed from '../media/MediaCondensed';
import ProfileLink from '../layout/ProfileLink';
import ParsedText from '../ParsedText';
import DeleteAnnotationMutation from '../../relay/mutations/DeleteAnnotationMutation';
import DeleteVersionMutation from '../../relay/mutations/DeleteVersionMutation';
import UpdateTaskMutation from '../../relay/mutations/UpdateTaskMutation';
import DatetimeTaskResponse from '../task/DatetimeTaskResponse';
import { can } from '../Can';
import TimeBefore from '../TimeBefore';
import {
  getErrorMessage,
  getStatus,
  getStatusStyle,
  emojify,
  parseStringUnixTimestamp,
} from '../../helpers';
import globalStrings from '../../globalStrings';
import { stringHelper } from '../../customHelpers';
import UserTooltip from '../user/UserTooltip';
import {
  units,
  white,
  opaqueBlack16,
  black38,
  black54,
  black87,
  checkBlue,
  borderWidthLarge,
  caption,
  breakWordStyles,
  Row,
  defaultBorderRadius,
} from '../../styles/js/shared';

const dotSize = borderWidthLarge;

const dotOffset = stripUnit(units(4)) - stripUnit(dotSize);

const StyledDefaultAnnotation = styled.div`
  color: ${black87};
  display: flex;
  font: ${caption};
  ${props => (props.theme.dir === 'rtl' ? 'padding-right' : 'padding-left')}: ${units(10)};

  .annotation__default-content {
    @extend ${breakWordStyles};
    display: block;
    margin-${props => (props.theme.dir === 'rtl' ? 'left' : 'right')}: ${units(2)};
  }
`;

const StyledAnnotationCardWrapper = styled.div`
  width: 100%;
  z-index: initial !important;

  > div > div {
    padding-bottom: 0 !important;
  }

  img {
    cursor: pointer;
  }
`;

const StyledAvatarColumn = styled.div`
  margin-${props => (props.theme.dir === 'rtl' ? 'left' : 'right')}: ${units(3)};
`;

const StyledPrimaryColumn = styled.div`
  flex: 1;

  .annotation__card-content {
    ${breakWordStyles}
    display: flex;
    width: 100%;

    & > span:first-child {
      flex: 1;
    }
  }

  .annotation__card-thumbnail {
    padding: ${units(1)};
  }

  .annotation__status {
    font: ${caption};
    text-transform: uppercase;
    margin: 0 3px;
  }
`;

const StyledAnnotationWrapper = styled.section`
  position: relative;
  display: flex;
  padding: ${units(1)} 0;
  position: relative;

  &:not(.annotation--card) {
    // The timeline dot
    &::before {
      background-color: ${opaqueBlack16};
      border-radius: 100%;
      content: '';
      height: ${units(1)};
      outline: ${dotSize} solid ${white};
      position: absolute;
      top: ${units(2)};
      width: ${units(1)};
      ${props => (props.theme.dir === 'rtl' ? 'right' : 'left')}: ${dotOffset}px;
    }
  }

  .annotation__card-text {
    display: flex;
    padding: ${units(3)} ${units(2)} ${units(1)} !important;
  }

  .annotation__card-activity-move-to-trash {
    background: ${checkBlue};
    color: #fff;
    border-radius: ${defaultBorderRadius};

    .annotation__timestamp {
      color: #fff;
    }
  }

  .annotation__timestamp {
    color: ${black38};
    display: inline;
    flex: 1;
    white-space: pre;
    margin-${props => (props.theme.dir === 'rtl' ? 'left' : 'right')}: ${units(1)};
  }

  .annotation__actions {
    align-self: flex-start;
    display: none;
    flex: 1;
    text-align: ${props => (props.theme.dir === 'rtl' ? 'left' : 'right')};
  }

  .annotation__body {
    ${breakWordStyles}
  }

  .annotation__embedded-media {
    padding-bottom: ${units(1)};
    padding-top: ${units(1)};
  }

  .annotation__tag {
    &::before {
      content: '#';
    }
  }

  .annotation__update-task > span {
    display: block;
  }

  .annotation__card-embedded-medias {
    clear: both;
    margin-top: ${units(0.5)};
  }

  .annotation__keep a {
    text-decoration: underline;
  }
`;

const StyledAnnotationMetadata = styled(Row)`
  color: ${black54};
  flex-flow: wrap row;
  font: ${caption};
  margin-top: ${units(3)};

  .annotation__card-author {
    color: ${black87};
    padding-${props => (props.theme.dir === 'rtl' ? 'left' : 'right')}: ${units(1)};
  }
`;

const StyledRequestHeader = styled(Row)`
  color: ${black54};
  flex-flow: wrap row;
  font: ${caption};
  margin-bottom: ${units(3)};

  .circle_delimeter:before {
    content: '\\25CF';
    font-size: ${units(1.5)};
  }
`;

const StyledAnnotationActionsWrapper = styled.div`
  margin-${props => (props.theme.dir === 'rtl' ? 'right' : 'left')}: auto;
`;

const FlagName = ({ flag }) => {
  switch (flag) {
  case 'adult': return <FormattedMessage id="annotation.flagAdult" defaultMessage="Adult" />;
  case 'medical': return <FormattedMessage id="annotation.flagMedical" defaultMessage="Medical" />;
  case 'violence': return <FormattedMessage id="annotation.flagViolence" defaultMessage="Violence" />;
  case 'racy': return <FormattedMessage id="annotation.flagRacy" defaultMessage="Racy" />;
  case 'spam': return <FormattedMessage id="annotation.flagSpam" defaultMessage="Spam" />;
  default: return null;
  }
};
FlagName.propTypes = {
  flag: PropTypes.oneOf(['adult', 'medical', 'violence', 'racy', 'spam']).isRequired,
};

const FlagLikelihood = ({ likelihood }) => {
  switch (likelihood) {
  case 0: return <FormattedMessage id="annotation.flagLikelihood0" defaultMessage="Unknown" />;
  case 1: return <FormattedMessage id="annotation.flagLikelihood1" defaultMessage="Very unlikely" />;
  case 2: return <FormattedMessage id="annotation.flagLikelihood2" defaultMessage="Unlikely" />;
  case 3: return <FormattedMessage id="annotation.flagLikelihood3" defaultMessage="Possible" />;
  case 4: return <FormattedMessage id="annotation.flagLikelihood4" defaultMessage="Likely" />;
  case 5: return <FormattedMessage id="annotation.flagLikelihood5" defaultMessage="Very likely" />;
  default: return null;
  }
};
FlagLikelihood.propTypes = {
  likelihood: PropTypes.oneOf([0, 1, 2, 3, 4, 5]).isRequired,
};

// TODO Fix a11y issues
/* eslint jsx-a11y/click-events-have-key-events: 0 */
class Version extends Component {
  constructor(props) {
    super(props);

    this.state = {
      zoomedCommentImage: false,
    };
  }

  handleCloseCommentImage() {
    this.setState({ zoomedCommentImage: false });
  }

  handleOpenCommentImage(image) {
    this.setState({ zoomedCommentImage: image });
  }

  handleOpenMenu = (e) => {
    e.stopPropagation();
    this.setState({ anchorEl: e.currentTarget });
  };

  handleCloseMenu = () => {
    this.setState({ anchorEl: null });
  };

  handleDelete(id) {
    const onSuccess = () => {};

    // Either to destroy versions or annotations
    const destroy_attr = {
      parent_type: this.props.task ? 'task' : 'project_media',
      annotated: (this.props.task || this.props.projectMedia),
      id,
    };
    if (this.props.version.annotation.version === null) {
      // It's a non-versioned annotation
      Relay.Store.commitUpdate(
        new DeleteAnnotationMutation(destroy_attr),
        { onSuccess, onFailure: this.fail },
      );
    } else {
      // It's a versioned annotation
      destroy_attr.id = this.props.version.annotation.version.id;
      Relay.Store.commitUpdate(
        new DeleteVersionMutation(destroy_attr),
        { onSuccess, onFailure: this.fail },
      );
    }
  }

  fail = (transaction) => {
    const message = getErrorMessage(
      transaction,
      (
        <FormattedMessage
          {...globalStrings.unknownError}
          values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
        />
      ),
    );
    this.props.setFlashMessage(message);
  };

  handleSuggestion(vid, accept) {
    const onSuccess = () => {};

    const task = { id: this.props.task.id };
    if (accept) {
      task.accept_suggestion = vid;
    } else {
      task.reject_suggestion = vid;
    }

    Relay.Store.commitUpdate(
      new UpdateTaskMutation({
        operation: 'suggest',
        task,
      }),
      { onSuccess, onFailure: this.fail },
    );
  }

  static renderTaskResponse(type, object) {
    if (type === 'multiple_choice') {
      const response = JSON.parse(object.value);
      const selected = response.selected || [];
      if (response.other) {
        selected.push(response.other);
      }
      return <ul>{selected.map(s => <li><ParsedText text={s} /></li>)}</ul>;
    } else if (type === 'geolocation') {
      const geojson = JSON.parse(object.value);
      const { geometry: { coordinates }, properties: { name } } = geojson;
      if (!coordinates[0] || !coordinates[1]) {
        return (
          <a
            style={{ textDecoration: 'underline' }}
            href={`http://www.openstreetmap.org/?mlat=${coordinates[0]}&mlon=${coordinates[1]}&zoom=12#map=12/${coordinates[0]}/${coordinates[1]}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            <ParsedText text={name} block />
          </a>
        );
      }
      return <ParsedText text={name} block />;
    } else if (type === 'datetime') {
      return <DatetimeTaskResponse response={object.value} />;
    }
    return <ParsedText text={object.value} block />;
  }

  render() {
    const {
      version, projectMedia, task, version: { annotation }, classes,
    } = this.props;

    let annotationActions = null;
    if (annotation && annotation.annotation_type) {
      const permission = `destroy ${annotation.annotation_type
        .charAt(0)
        .toUpperCase()}${annotation.annotation_type.slice(1)}`;
      // TODO: Improve hide when item is archived logic. Not all annotated types have archived flag.
      const hasActions = (
        can(annotation.permissions, permission) && (task || !projectMedia.archived)
      );
      annotationActions = hasActions ? (
        <div>
          <Tooltip title={
            <FormattedMessage id="annotation.menuTooltip" defaultMessage="Annotation actions" />
          }
          >
            <IconButton
              className="menu-button"
              onClick={this.handleOpenMenu}
            >
              <MoreHoriz />
            </IconButton>
          </Tooltip>
          <Menu
            id="customized-menu"
            anchorEl={this.state.anchorEl}
            keepMounted
            open={Boolean(this.state.anchorEl)}
            onClose={this.handleCloseMenu}
          >
            {can(annotation.permissions, permission) ? (
              <MenuItem
                className="annotation__delete"
                onClick={this.handleDelete.bind(this, annotation.id)}
              >
                <FormattedMessage id="annotation.deleteButton" defaultMessage="Delete" />
              </MenuItem>
            ) : null}
            <MenuItem>
              <a
                href={`#annotation-${version.dbid}`}
                style={{ textDecoration: 'none', color: black87 }}
              >
                <FormattedMessage
                  id="annotation.permalink"
                  defaultMessage="Permalink"
                />
              </a>
            </MenuItem>
          </Menu>
        </div>)
        : null;
    }

    const updatedAt = parseStringUnixTimestamp(version.created_at);
    const timestamp = updatedAt
      ? <span className="annotation__timestamp"><TimeBefore date={updatedAt} /></span>
      : null;
    // version.user.team_user is null during CreateCommentMutation optimistic update
    let authorName = (version.user && version.user.team_user)
      ? <ProfileLink className="annotation__author-name" teamUser={version.user.team_user} /> : null;
    const object = JSON.parse(version.object_after);
    const content = object.data;
    const isVideoAnno = object.fragment !== undefined;
    let activityType = version.event_type;
    let contentTemplate = null;
    let showCard = false;

    switch (activityType) {
    case 'create_comment': {
      const commentText = content.text;
      const commentContent = JSON.parse(annotation.content);
      contentTemplate = (
        <div>
          <div className="annotation__card-content">
            <div className={isVideoAnno ? classes.videoAnnoText : ''} onClick={isVideoAnno ? () => this.props.onTimelineCommentOpen(object.fragment) : null}>
              {isVideoAnno ? <VideoAnnotationIcon fontSize="small" className={classes.VideoAnnotationIcon} /> : null} <ParsedText text={commentText} />
            </div>
            {/* thumbnail */}
            {commentContent.original ?
              <div onClick={this.handleOpenCommentImage.bind(this, commentContent.original)}>
                <img
                  src={commentContent.thumbnail}
                  className="annotation__card-thumbnail"
                  alt=""
                />
              </div> : null}
          </div>
          {/* embedded medias */}
          <div className="annotation__card-embedded-medias">
            {annotation.medias.edges.map(media => (
              <Card key={media.node.id} className="card media-detail">
                <MediaCondensed
                  media={media.node}
                  mediaUrl={guessProjectMediaUrl(projectMedia.team, media.node)}
                />
              </Card>
            ))}
          </div>

          {/* lightbox */}
          {commentContent.original && !!this.state.zoomedCommentImage
            ? <Lightbox
              onCloseRequest={this.handleCloseCommentImage.bind(this)}
              mainSrc={this.state.zoomedCommentImage}
            />
            : null}
        </div>
      );
      break;
    }
    case 'create_tag':
      if (version.tag && version.tag.tag_text) {
        contentTemplate = (
          <span>
            <FormattedMessage
              id="annotation.taggedHeader"
              defaultMessage="Tagged #{tag} by {author}"
              values={{
                tag: version.tag.tag_text.replace(/^#/, ''),
                author: authorName,
              }}
            />
          </span>
        );
      }
      break;
    case 'destroy_comment':
      contentTemplate = (
        <em className="annotation__deleted">
          <FormattedMessage
            id="annotation.deletedComment"
            defaultMessage="Comment deleted by {author}: {comment}"
            values={{
              author: authorName,
              comment: <ParsedText text={content.text} block />,
            }}
          />
        </em>);
      break;
    case 'create_task':
      contentTemplate = (
        <span className="annotation__task-created">
          <FormattedMessage
            id="annotation.taskCreated"
            defaultMessage="Task created by {author}: {task}"
            values={{
              task: content.label,
              author: authorName,
            }}
          />
        </span>
      );
      break;
    case 'create_relationship': {
      const meta = JSON.parse(version.meta);
      if (meta) {
        const { target } = meta;
        contentTemplate = (
          <span>
            <FormattedMessage
              id="annotation.relationshipCreated"
              defaultMessage="Related item added by {author}: {title}"
              values={{
                title: emojify(target.title),
                author: authorName,
              }}
            />
          </span>
        );
      }
      break;
    }
    case 'destroy_relationship': {
      const meta = JSON.parse(version.meta);
      if (meta) {
        const { target } = meta;
        contentTemplate = (
          <span>
            <FormattedMessage
              id="annotation.relationshipDeleted"
              defaultMessage="Related item removed by {author}: {title}"
              values={{
                title: emojify(target.title),
                author: authorName,
              }}
            />
          </span>
        );
      }
      break;
    }
    case 'create_assignment': {
      const meta = JSON.parse(version.meta);
      if (meta) {
        const { type, title, user_name } = meta;
        const values = {
          title,
          name: user_name,
          author: authorName,
        };
        if (type === 'task') {
          contentTemplate = (
            <span>
              <FormattedMessage
                id="annotation.taskAssignmentCreated"
                defaultMessage="Task assigned to {name} by {author}: {title}"
                values={values}
              />
            </span>
          );
        }
        if (type === 'media') {
          contentTemplate = (
            <span>
              <FormattedMessage
                id="annotation.mediaAssignmentCreated"
                defaultMessage="Item assigned to {name} by {author}"
                values={values}
              />
            </span>
          );
        }
      }
      break;
    }
    case 'destroy_assignment': {
      const meta = JSON.parse(version.meta);
      if (meta) {
        const { type, title, user_name } = meta;
        const values = {
          title,
          name: user_name,
          author: authorName,
        };
        if (type === 'task') {
          contentTemplate = (
            <span>
              <FormattedMessage
                id="annotation.taskAssignmentDeleted"
                defaultMessage="Task unassigned from {name} by {author}: {title}"
                values={values}
              />
            </span>
          );
        }
        if (type === 'media') {
          contentTemplate = (
            <span>
              <FormattedMessage
                id="annotation.mediaAssignmentDeleted"
                defaultMessage="Item unassigned from {name} by {author}"
                values={values}
              />
            </span>
          );
        }
      }
      break;
    }
    case 'create_dynamic':
    case 'update_dynamic':
      if (object.annotation_type === 'flag') {
        showCard = true;
        const { flags } = object.data;
        // #8220 remove "spam" until we get real values for it.
        const flagsContent = (
          <ul>
            { Object.keys(flags).filter(flag => flag !== 'spam').map(flag => (
              <li style={{ margin: units(1), listStyle: 'disc' }}>
                <FlagName flag={flag} />
                {': '}
                <FlagLikelihood likelihood={flags[flag]} />
              </li>
            ))}
          </ul>
        );
        contentTemplate = (
          <div>
            <FormattedMessage
              id="annotation.flag"
              defaultMessage="Classification result:"
            />
            {flagsContent}
          </div>
        );
      } else if (object.annotation_type === 'verification_status') {
        const statusChanges = JSON.parse(version.object_changes_json);
        if (statusChanges.locked) {
          if (statusChanges.locked[1]) {
            contentTemplate = (
              <FormattedMessage
                id="annotation.statusLocked"
                defaultMessage="Item status locked by {author}"
                values={{ author: authorName }}
              />
            );
          } else {
            contentTemplate = (
              <FormattedMessage
                id="annotation.statusUnlocked"
                defaultMessage="Item status unlocked by {author}"
                values={{ author: authorName }}
              />
            );
          }
        } else if (statusChanges.assigned_to_id) {
          const assignment = JSON.parse(version.meta);
          if (assignment.assigned_to_name) {
            contentTemplate = (
              <FormattedMessage
                id="annotation.mediaAssigned"
                defaultMessage="Item assigned to {name} by {author}"
                values={{
                  name: assignment.assigned_to_name,
                  author: authorName,
                }}
              />
            );
          } else {
            contentTemplate = (
              <FormattedMessage
                id="annotation.mediaUnassigned"
                defaultMessage="Item unassigned from {name} by {author}"
                values={{
                  name: assignment.assigned_from_name,
                  author: authorName,
                }}
              />
            );
          }
        }
      }
      break;
    case 'create_dynamicannotationfield':
    case 'update_dynamicannotationfield':
    {
      if (object.field_name === 'metadata_value' && activityType === 'update_dynamicannotationfield') {
        contentTemplate = (
          <EmbedUpdate
            version={version}
            authorName={authorName}
          />);
      }

      if (object.field_name === 'verification_status_status' && config.appName === 'check' && activityType === 'update_dynamicannotationfield') {
        const statusValue = object.value;
        const statusCode = statusValue.toLowerCase().replace(/[ _]/g, '-');
        const status = getStatus(this.props.projectMedia.team.verification_statuses, statusValue);
        contentTemplate = (
          <span>
            <FormattedMessage
              id="annotation.statusSetHeader"
              defaultMessage="Status set to {status} by {author}"
              values={{
                status: (
                  <span
                    className={`annotation__status annotation__status--${statusCode}`}
                    style={{ color: getStatusStyle(status, 'color') }}
                  >
                    {status.label}
                  </span>
                ),
                author: authorName,
              }}
            />
          </span>
        );
      }

      if (object.field_name === 'team_bot_response_formatted_data') {
        activityType = 'bot_response';
        const botResponse = JSON.parse(object.value);
        contentTemplate = (
          <div>
            <div className="annotation__card-content annotation__bot-response">
              <span>
                <b>{botResponse.title}</b><br />
                <ParsedText text={botResponse.description} />
              </span>
              <div>
                { botResponse.image_url ?
                  <div
                    style={{
                      background: `transparent url('${botResponse.image_url}') top left no-repeat`,
                      backgroundSize: 'cover',
                      border: '1px solid #ccc',
                      width: 80,
                      height: 80,
                      cursor: 'pointer',
                      display: 'inline-block',
                    }}
                    className="annotation__card-thumbnail annotation__bot-response-thumbnail"
                    onClick={this.handleOpenCommentImage.bind(this, botResponse.image_url)}
                  /> : null }
              </div>
            </div>

            { botResponse.image_url && !!this.state.zoomedCommentImage ?
              <Lightbox
                onCloseRequest={this.handleCloseCommentImage.bind(this)}
                mainSrc={this.state.zoomedCommentImage}
              /> : null}
          </div>
        );
      }

      if (/^suggestion_/.test(object.field_name)) {
        activityType = 'task_answer_suggestion';
        const suggestion = JSON.parse(object.value);
        const review = version.meta ? JSON.parse(version.meta) : null;
        contentTemplate = (
          <div>
            <div className="annotation__card-content annotation__task-answer-suggestion">
              <ParsedText text={suggestion.comment} />
            </div>
            <br />
            <p>
              <small>
                <Link to={`/check/bot/${version.user.bot.dbid}`}>
                  <FormattedMessage
                    id="annotation.seeHowThisBotWorks"
                    defaultMessage="See how this bot works"
                  />
                </Link>
              </small>
            </p>
            { review ?
              <div style={{ fontStyle: 'italic' }}>
                <small>
                  { review.accepted ?
                    <FormattedMessage
                      id="annotation.suggestionAccepted"
                      defaultMessage="Accepted by {user}"
                      values={{
                        user: <ProfileLink teamUser={review.user.team_user} />,
                      }}
                    /> :
                    <FormattedMessage
                      id="annotation.suggestionRejected"
                      defaultMessage="Rejected by {user}"
                      values={{
                        user: <ProfileLink teamUser={review.user.team_user} />,
                      }}
                    />
                  }
                </small>
              </div> :
              <div>
                <Button
                  onClick={this.handleSuggestion.bind(this, version.dbid, true)}
                  style={{ border: `1px solid ${black38}` }}
                  color="primary"
                >
                  <FormattedMessage
                    id="annotation.acceptSuggestion"
                    defaultMessage="Accept"
                  />
                </Button>
                &nbsp;
                <Button
                  onClick={this.handleSuggestion.bind(this, version.dbid, false)}
                  style={{ border: `1px solid ${black38}` }}
                  color="primary"
                >
                  <FormattedMessage
                    id="annotation.rejectSuggestion"
                    defaultMessage="Reject"
                  />
                </Button>
              </div>
            }
          </div>
        );
      }

      if (/^response_/.test(object.field_name) && version.task) {
        contentTemplate = (
          <span className="annotation__task-resolved">
            <FormattedMessage
              id="annotation.taskResolve"
              defaultMessage="Task completed by {author}: {task}{response}"
              values={{
                task: version.task.label,
                author: authorName,
                response: Version.renderTaskResponse(version.task.type, object),
              }}
            />
          </span>
        );
      }

      // TODO Replace with Pender-supplied names.
      const archivers = {
        archive_is_response: 'Archive.is',
        archive_org_response: 'Archive.org',
        perma_cc_response: 'Perma.cc',
        video_archiver_response: 'Video Archiver',
      };
      if (object.annotation_type === 'archiver' && activityType === 'create_dynamicannotationfield') {
        const archiveContent = JSON.parse(annotation.content);
        const archive = archiveContent.filter(item => item.field_name === object.field_name);
        const archiveResponse = JSON.parse(archive[0].value);
        const archiveLink = archiveResponse.location;
        const archiveStatus = parseInt(archiveResponse.status, 10);
        const archiveName = archivers[object.field_name];
        contentTemplate = null;
        if (archiveLink) {
          contentTemplate = (
            <span className="annotation__keep">
              <FormattedHTMLMessage
                id="annotation.archiverSuccess"
                defaultMessage='In case this item goes offline, you can <a href="{link}" target="_blank" rel="noopener noreferrer">access a backup at {name}</a>.'
                values={{ link: archiveLink, name: archiveName }}
              />
            </span>
          );
        } else if (archiveResponse.error || archiveStatus >= 400) {
          contentTemplate = (
            <span className="annotation__keep">
              <FormattedHTMLMessage
                id="annotation.archiverError"
                defaultMessage='Sorry, the following error occurred while archiving the item to {name}: "{message}". Please refresh the item to try again and contact {supportEmail} if the condition persists.'
                values={{ name: archiveName, message: archiveResponse.error.message, supportEmail: stringHelper('SUPPORT_EMAIL') }}
              />
            </span>
          );
        } else {
          contentTemplate = (
            <span className="annotation__keep">
              <FormattedHTMLMessage
                id="annotation.archiverWait"
                defaultMessage="This item is being archived at {name}. The archive link will be displayed here when it's ready."
                values={{ name: archiveName }}
              />
            </span>
          );
        }
      }

      if (object.field_name === 'embed_code_copied') {
        contentTemplate = (
          <span className="annotation__embed-code-copied">
            <FormattedMessage
              id="annotation.embedCodeCopied"
              defaultMessage="An embed code of the item has been generated and copied. The item may now be publicly viewable."
            />
          </span>
        );
      }

      if (object.field_name === 'pender_archive_response' && activityType === 'create_dynamicannotationfield') {
        const penderResponse = JSON.parse(JSON.parse(annotation.content)[0].value);
        contentTemplate = null;
        if (penderResponse.error) {
          contentTemplate = (
            <span className="annotation__pender-archive">
              <FormattedHTMLMessage
                id="annotation.penderArchiveResponseError"
                defaultMessage="Sorry, an error occurred while taking a screenshot of the item. Please refresh the item to try again and contact {supportEmail} if the condition persists."
                values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
              />
            </span>
          );
        } else if (penderResponse.screenshot_taken) {
          activityType = 'screenshot_taken';
          authorName = null;
          contentTemplate = (
            <div>
              <div className="annotation__card-content annotation__pender-archive">
                <FormattedHTMLMessage
                  id="annotation.penderArchiveResponse"
                  defaultMessage="Keep has taken a screenshot of this URL."
                />
                <div>
                  <div
                    style={{
                      background: `transparent url('${penderResponse.screenshot_url}') top left no-repeat`,
                      backgroundSize: 'cover',
                      border: '1px solid #ccc',
                      width: 80,
                      height: 80,
                      cursor: 'pointer',
                      display: 'inline-block',
                    }}
                    className="annotation__card-thumbnail annotation__pender-archive-thumbnail"
                    onClick={this.handleOpenCommentImage.bind(this, penderResponse.screenshot_url)}
                  />
                </div>
              </div>

              {/* lightbox */}
              {penderResponse.screenshot_url && !!this.state.zoomedCommentImage ?
                <Lightbox
                  onCloseRequest={this.handleCloseCommentImage.bind(this)}
                  mainSrc={this.state.zoomedCommentImage}
                /> : null}
            </div>
          );
        } else {
          contentTemplate = (
            <span className="annotation__pender-archive">
              <FormattedHTMLMessage
                id="annotation.penderArchiveWait"
                defaultMessage="The screenshot of this item is being taken by Keep. Come back in a few minutes to see it."
              />
            </span>
          );
        }
        contentTemplate = null;
      }

      if (object.field_name === 'smooch_data' && activityType === 'create_dynamicannotationfield') {
        showCard = true;
        const objectValue = JSON.parse(object.value);
        const messageType = objectValue.source.type;
        const messageText = objectValue.text ? objectValue.text.trim() : null;
        const smoochSlackUrl = version.smooch_user_slack_channel_url;
        contentTemplate = (
          <div>
            <StyledRequestHeader>
              <span className="annotation__card-header">
                <span>
                  {emojify(objectValue.name)}
                </span>
                <span style={{ margin: `0 ${units(0.5)}` }} className="circle_delimeter" />
                <span >
                  <TimeBefore date={updatedAt} />
                </span>
                <span style={{ margin: `0 ${units(0.5)}` }} className="circle_delimeter" />
                <span>
                  {messageType.charAt(0).toUpperCase() + messageType.slice(1)}
                </span>
                {smoochSlackUrl ?
                  <span style={{ margin: `0 ${units(0.5)}` }} className="circle_delimeter">
                    <a
                      target="_blank"
                      style={{ margin: `0 ${units(0.5)}`, textDecoration: 'underline' }}
                      rel="noopener noreferrer"
                      href={smoochSlackUrl}
                    >
                      <FormattedMessage id="annotation.slackChannel" defaultMessage="Slack channel" />
                    </a>
                  </span> :
                  null
                }
              </span>
            </StyledRequestHeader>
            <div className="annotation__card-content">
              {messageText ? (
                <ParsedText text={emojify(messageText)} />
              ) : (
                <FormattedMessage
                  id="annotation.smoochNoMessage"
                  defaultMessage="No message was sent with the request"
                />
              )}
            </div>
          </div>
        );
      }

      break;
    }
    case 'update_embed':
      contentTemplate = (
        <EmbedUpdate
          version={version}
          authorName={authorName}
        />);
      break;
    case 'create_embed':
      contentTemplate = (
        <EmbedCreate
          projectMedia={projectMedia}
          content={content}
          authorName={authorName}
        />);
      break;
    case 'update_projectmediaproject':
      if (version.projects.edges.length > 0 && version.user) {
        const previousProject = version.projects.edges[0].node;
        const currentProject = version.projects.edges[1].node;
        const urlPrefix = `/${projectMedia.team.slug}/project/`;
        contentTemplate = (
          <span>
            <FormattedMessage
              id="annotation.projectMoved"
              defaultMessage="Moved from list {previousProject} to {currentProject} by {author}"
              values={{
                previousProject: (
                  <Link to={urlPrefix + previousProject.dbid}>
                    {previousProject.title}
                  </Link>
                ),
                currentProject: (
                  <Link to={urlPrefix + currentProject.dbid}>
                    {currentProject.title}
                  </Link>
                ),
                author: authorName,
              }}
            />
          </span>
        );
      } else if (version.object_changes_json === '{"archived":[false,true]}') {
        contentTemplate = (
          <span>
            <FormattedMessage
              id="annotation.movedToTrash"
              defaultMessage="Moved to the trash by {author}"
              values={{
                author: authorName,
              }}
            />
          </span>
        );
      } else if (version.object_changes_json === '{"archived":[true,false]}') {
        contentTemplate = (
          <span>
            <FormattedMessage
              id="annotation.movedFromTrash"
              defaultMessage="Moved out of the trash by {author}"
              values={{
                author: authorName,
              }}
            />
          </span>
        );
      }
      break;
    case 'copy_projectmedia':
      if (version.teams.edges.length > 0 && version.user) {
        const previousTeam = version.teams.edges[0].node;
        const previousTeamUrl = `/${previousTeam.slug}/`;
        contentTemplate = (
          <span>
            <FormattedMessage
              id="annotation.teamCopied"
              defaultMessage="Copied from workspace {previousTeam} by {author}"
              values={{
                previousTeam: (
                  <Link to={previousTeamUrl}>
                    {previousTeam.name}
                  </Link>
                ),
                author: authorName,
              }}
            />
          </span>
        );
      }
      break;
    case 'update_task':
      contentTemplate = <TaskUpdate version={version} authorName={authorName} />;
      break;
    default:
      contentTemplate = null;
      break;
    }

    if (contentTemplate === null) {
      return null;
    }

    const cardActivities = ['create_comment', 'screenshot_taken', 'bot_response', 'task_answer_suggestion'];
    const useCardTemplate = (cardActivities.indexOf(activityType) > -1 || showCard);
    const templateClass = `annotation--${useCardTemplate ? 'card' : 'default'}`;
    const typeClass = annotation ? `annotation--${annotation.annotation_type}` : '';

    return (
      <StyledAnnotationWrapper
        className={`annotation ${templateClass} ${typeClass}`}
        id={`annotation-${version.dbid}`}
      >
        {useCardTemplate ?
          <StyledAnnotationCardWrapper>
            <Card>
              <CardContent
                className={`annotation__card-text annotation__card-activity-${activityType.replace(
                  /_/g,
                  '-',
                )}`}
              >
                {authorName ?
                  <RCTooltip placement="top" overlay={<UserTooltip teamUser={version.user.team_user} />}>
                    <StyledAvatarColumn className="annotation__avatar-col">
                      <SourcePicture
                        className="avatar"
                        type="user"
                        size="small"
                        object={version.user.source}
                      />
                    </StyledAvatarColumn>
                  </RCTooltip> : null}

                <StyledPrimaryColumn>
                  {contentTemplate}
                  <StyledAnnotationMetadata>
                    <span className="annotation__card-footer">
                      {authorName ?
                        <ProfileLink
                          className="annotation__card-author"
                          teamUser={version.user.team_user}
                        /> : null}
                      <span>
                        {timestamp}
                      </span>
                    </span>

                    <StyledAnnotationActionsWrapper>
                      {annotationActions}
                    </StyledAnnotationActionsWrapper>
                  </StyledAnnotationMetadata>
                </StyledPrimaryColumn>

              </CardContent>
            </Card>
          </StyledAnnotationCardWrapper> :
          <StyledDefaultAnnotation className="annotation__default">
            <span>
              <span className="annotation__default-content">{contentTemplate}</span>
              {timestamp}
            </span>
          </StyledDefaultAnnotation>}
      </StyledAnnotationWrapper>
    );
  }
}
Version.defaultProps = {
  projectMedia: null, // if "task" is passed
  task: null, // if "projectMedia" is passed
};
Version.propTypes = {
  setFlashMessage: PropTypes.func.isRequired,
  projectMedia: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }), // or null, if task is set
  task: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }), // or null, if projectMedia is set
  version: PropTypes.shape({
    annotation: PropTypes.shape({
      task: PropTypes.shape({
      }),
    }), // sometimes it's null
  }).isRequired,
};

const annotationStyles = theme => ({
  VideoAnnotationIcon: {
    marginRight: theme.spacing(1),
    position: 'relative',
    top: theme.spacing(0.5),
  },
  videoAnnoText: {
    cursor: 'pointer',
  },
});

export default createFragmentContainer(
  withStyles(annotationStyles)(withSetFlashMessage(Version)),
  {
    projectMedia: graphql`
      fragment Version_projectMedia on ProjectMedia {
        id
        archived
        ...EmbedCreate_projectMedia
        team { # TODO move to top level; nix ProjectMedia.team everywhere
          id
          verification_statuses
        }
      }
    `,
    task: graphql`
      fragment Version_task on Task {
        id
      }
    `,
    version: graphql`
      fragment Version_version on Version @argumentDefinitions(
        teamSlug: { type: "String!"},
      ) {
        id
        dbid
        event_type
        created_at
        object_after
        object_changes_json
        meta
        ...EmbedUpdate_version
        ...TaskUpdate_version
        teams(first: 2) {  # copy_projectmedia
          edges {
            node {
              id
              slug
              name
            }
          }
        }
        projects(first: 2) {  # update_projectmediaproject
          edges {
            node {
              id
              dbid
              title
            }
          }
        }
        user {
          id
          dbid
          team_user(team_slug: $teamSlug) {
            id
            ...ProfileLink_teamUser
            ...UserTooltip_teamUser
          }
          bot {
            id
            dbid
          }
          source {  # SourcePicture
            id,
            dbid,
            image,
          }
        }
        task {  # annotation__task-resolved
          id
          label
          type
        }
        tag {  # create_tag
          id
          tag_text
        }
        annotation {
          id
          annotation_type
          content
          permissions
          medias(first: 10000) {
            edges {
              node {
                id
                dbid  # MediaDetail.js:guessProjectMediaUrl
                project_ids  # MediaDetail.js:guessProjectMediaUrl
                ...MediaCondensed_media
              }
            }
          }
          version {
            # annotation__delete ... this version is presumably different from
            # this.props.version; and it may be null.
            # [adamhooper, 2020-08-07] Nobody knows how this works.
            id
            item_id
            item_type
          }
        }
      }
    `,
  },
);
