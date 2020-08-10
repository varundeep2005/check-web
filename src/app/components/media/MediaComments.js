import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import { makeStyles } from '@material-ui/core/styles';
import { withPusher, pusherShape } from '../../pusher';
import MediaRoute from '../../relay/MediaRoute';
import MediasLoading from './MediasLoading';
import MediaScrollableMetadata from './MediaScrollableMetadata';
import Versions from '../annotations/Versions';
import AddAnnotation from '../annotations/AddAnnotation';
import { can } from '../Can';

const useStyles = makeStyles({
  flex0: {
    flex: '0 0 auto',
  },
});

function Flex0Div({ children }) {
  const classes = useStyles();
  return <div className={classes.flex0}>{children}</div>;
}

class MediaCommentsComponent extends Component {
  componentDidMount() {
    this.subscribe();
  }

  componentWillUpdate(nextProps) {
    if (this.props.media.dbid !== nextProps.media.dbid) {
      this.unsubscribe();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.media.dbid !== prevProps.media.dbid) {
      this.subscribe();
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  subscribe() {
    const {
      pusher,
      clientSessionId,
      media,
      relay,
    } = this.props;
    if (pusher) {
      pusher.subscribe(media.pusher_channel).bind('media_updated', 'MediaComments', (data, run) => {
        const annotation = JSON.parse(data.message);
        if (annotation.annotated_id === media.dbid && clientSessionId !== data.actor_session_id) {
          if (run) {
            relay.forceFetch();
            return true;
          }
          return {
            id: `media-comments-${media.dbid}`,
            callback: relay.forceFetch,
          };
        }
        return false;
      });
    }
  }

  unsubscribe() {
    const { pusher, media } = this.props;
    if (pusher) {
      pusher.unsubscribe(media.pusher_channel);
    }
  }

  render() {
    const { media } = this.props;
    return (
      <MediaScrollableMetadata id="media__comments">
        <Versions
          versions={media.media_comments_log.edges.map(({ node }) => node)}
          projectMedia={media}
          onTimelineCommentOpen={this.props.onTimelineCommentOpen}
          noActivityMessage={
            <FormattedMessage id="mediaComments.noNote" defaultMessage="No note" />
          }
        />
        {!media.archived && can(media.permissions, 'create Comment') ? (
          <Flex0Div>
            <AddAnnotation projectMedia={media} />
          </Flex0Div>
        ) : null}
      </MediaScrollableMetadata>
    );
  }
}

MediaCommentsComponent.propTypes = {
  clientSessionId: PropTypes.string.isRequired,
  pusher: pusherShape.isRequired,
  media: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    archived: PropTypes.bool.isRequired,
    permissions: PropTypes.string.isRequired,
    pusher_channel: PropTypes.string.isRequired,
    media_comments_log: PropTypes.object.isRequired,
  }).isRequired,
};

const pageSize = 30;
const eventTypes = ['create_comment'];
const fieldNames = [];
const annotationTypes = [];

const MediaCommentsContainer = Relay.createContainer(withPusher(MediaCommentsComponent), {
  initialVariables: {
    pageSize,
    eventTypes,
    fieldNames,
    annotationTypes,
    teamSlug: null,
  },
  prepareVariables: vars => ({
    ...vars,
    teamSlug: /^\/([^/]+)/.test(window.location.pathname) ? window.location.pathname.match(/^\/([^/]+)/)[1] : null,
  }),
  fragments: {
    media: ({ teamSlug }) => Relay.QL`
      fragment on ProjectMedia {
        id
        dbid
        archived
        permissions
        pusher_channel
        ${Versions.getFragment('projectMedia')}
        ${AddAnnotation.getFragment('projectMedia')}
        media_comments_log: log(last: $pageSize, event_types: $eventTypes, field_names: $fieldNames, annotation_types: $annotationTypes) {
          edges {
            node {
              ${Versions.getFragment('versions', { teamSlug })}
            }
          }
        }
      }
    `,
  },
});

const MediaComments = (props) => {
  const ids = `${props.media.dbid}`;
  const route = new MediaRoute({ ids });

  return (
    <Relay.RootContainer
      Component={MediaCommentsContainer}
      renderFetched={data => (
        <MediaCommentsContainer
          {...data}
          onTimelineCommentOpen={props.onTimelineCommentOpen}
        />)}
      route={route}
      renderLoading={() => <MediasLoading count={1} />}
    />
  );
};

export default MediaComments;
