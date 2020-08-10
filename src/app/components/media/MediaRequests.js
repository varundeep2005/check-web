import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import { withPusher, pusherShape } from '../../pusher';
import MediaRoute from '../../relay/MediaRoute';
import MediasLoading from './MediasLoading';
import Versions from '../annotations/Versions';
import MediaScrollableMetadata from './MediaScrollableMetadata';

class MediaRequestsComponent extends Component {
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
    const { pusher, clientSessionId, media } = this.props;
    pusher.subscribe(media.pusher_channel).bind('media_updated', 'MediaRequests', (data, run) => {
      const annotation = JSON.parse(data.message);
      if (annotation.annotated_id === media.dbid && clientSessionId !== data.actor_session_id) {
        if (run) {
          this.props.relay.forceFetch();
          return true;
        }
        return {
          id: `media-requests-${media.dbid}`,
          callback: this.props.relay.forceFetch,
        };
      }
      return false;
    });
  }

  unsubscribe() {
    const { pusher, media } = this.props;
    pusher.unsubscribe(media.pusher_channel);
  }

  render() {
    const { media } = this.props;

    return (
      <MediaScrollableMetadata id="media__requests">
        <Versions
          versions={media.media_requests_log.edges.map(({ node }) => node)}
          projectMedia={media}
          noActivityMessage={
            <FormattedMessage id="MediaRequests.noRequest" defaultMessage="No requests" />
          }
        />
      </MediaScrollableMetadata>
    );
  }
}

MediaRequestsComponent.propTypes = {
  pusher: pusherShape.isRequired,
  clientSessionId: PropTypes.string.isRequired,
};

const pageSize = 30;
const eventTypes = ['create_dynamicannotationfield'];
const fieldNames = ['smooch_data'];
const annotationTypes = [];
const whoDunnit = ['smooch'];

const MediaRequestsContainer = Relay.createContainer(withPusher(MediaRequestsComponent), {
  initialVariables: {
    pageSize,
    eventTypes,
    fieldNames,
    annotationTypes,
    whoDunnit,
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
        pusher_channel
        ${Versions.getFragment('projectMedia')}
        media_requests_log: log(last: $pageSize, event_types: $eventTypes, field_names: $fieldNames, annotation_types: $annotationTypes, who_dunnit: $whoDunnit, include_related: true) {
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

const MediaRequests = (props) => {
  const ids = `${props.media.dbid}`;
  const route = new MediaRoute({ ids });

  return (
    <Relay.RootContainer
      Component={MediaRequestsContainer}
      renderFetched={data =>
        <MediaRequestsContainer {...data} />
      }
      route={route}
      renderLoading={() => <MediasLoading count={1} />}
    />
  );
};

export default MediaRequests;
