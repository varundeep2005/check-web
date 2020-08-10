import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import { withPusher, pusherShape } from '../../pusher';
import MediaRoute from '../../relay/MediaRoute';
import MediasLoading from './MediasLoading';
import MediaScrollableMetadata from './MediaScrollableMetadata';
import Versions from '../annotations/Versions';

class MediaLogComponent extends Component {
  static propTypes = {
    pusher: pusherShape.isRequired,
    clientSessionId: PropTypes.string.isRequired,
  };

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
    pusher.subscribe(media.pusher_channel).bind('media_updated', 'MediaLog', (data, run) => {
      const annotation = JSON.parse(data.message);
      if (annotation.annotated_id === media.dbid && clientSessionId !== data.actor_session_id) {
        if (run) {
          this.props.relay.forceFetch();
          return true;
        }
        return {
          id: `media-log-${media.dbid}`,
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
      <MediaScrollableMetadata>
        <Versions
          projectMedia={media}
          versions={media.media_log_log.edges.map(({ node }) => node)}
          noActivityMessage={
            <FormattedMessage id="annotation.noAnnotationsYet" defaultMessage="No activity" />
          }
        />
      </MediaScrollableMetadata>
    );
  }
}

const pageSize = 30;

const eventTypes = [
  'create_tag', 'destroy_comment', 'create_task', 'create_relationship',
  'destroy_relationship', 'create_assignment', 'destroy_assignment', 'create_dynamic',
  'update_dynamic', 'create_dynamicannotationfield', 'update_dynamicannotationfield',
  'create_flag', 'update_embed', 'create_embed', 'update_projectmedia', 'copy_projectmedia',
  'update_task', 'update_projectmediaproject',
];

const fieldNames = [
  'suggestion_free_text', 'suggestion_yes_no', 'suggestion_single_choice',
  'suggestion_multiple_choice', 'suggestion_geolocation', 'suggestion_datetime',
  'response_free_text', 'response_yes_no', 'response_single_choice', 'response_multiple_choice',
  'response_geolocation', 'response_datetime', 'metadata_value', 'verification_status_status',
  'team_bot_response_formatted_data', 'reverse_image_path', 'archive_is_response',
  'archive_org_response', 'keep_backup_response', 'embed_code_copied',
  'pender_archive_response', 'perma_cc_response', 'video_archiver_response',
  'suggestion_image_upload', 'response_image_upload',
];

const annotationTypes = ['verification_status', 'flag'];

const MediaLogContainer = Relay.createContainer(withPusher(MediaLogComponent), {
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
        pusher_channel
        ${Versions.getFragment('projectMedia')}
        media_log_log: log(last: $pageSize, event_types: $eventTypes, field_names: $fieldNames, annotation_types: $annotationTypes) {
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

const MediaLog = (props) => {
  const ids = `${props.media.dbid}`;
  const route = new MediaRoute({ ids });

  return (
    <Relay.RootContainer
      Component={MediaLogContainer}
      renderFetched={data => <MediaLogContainer {...data} />}
      route={route}
      renderLoading={() => <MediasLoading count={1} />}
    />
  );
};

export default MediaLog;
