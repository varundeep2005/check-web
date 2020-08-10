import React from 'react';
import Card from '@material-ui/core/Card';
import { withPusher, pusherShape } from '../../pusher';
import MediaExpanded from './MediaExpanded';
import { MediaCondensedRootContainer } from './MediaCondensed';

function guessProjectMediaProjectIdForUrl(mediaProjectIds) {
  const { pathname } = window.location;
  const pathMatch = /project\/([0-9]+)/.exec(pathname);
  if (pathMatch) {
    const pathProjectId = +pathMatch[1];
    if (mediaProjectIds.includes(pathProjectId)) {
      return pathProjectId;
    }
  }
  if (mediaProjectIds.length) {
    return mediaProjectIds[0];
  }
  return null;
}

export function guessProjectMediaUrl(team, media) {
  if (!media.dbid) {
    return null;
  }

  const projectId = guessProjectMediaProjectIdForUrl(media.project_ids);
  return projectId
    ? `/${media.team.slug}/project/${projectId}/media/${media.dbid}`
    : `/${media.team.slug}/media/${media.dbid}`;
}

class MediaDetail extends React.Component {
  componentDidMount() {
    if (this.props.parentComponentName === 'MediaRelated') {
      this.subscribe();
    }
  }

  componentWillUnmount() {
    if (this.props.parentComponentName === 'MediaRelated') {
      this.unsubscribe();
    }
  }

  subscribe() {
    const { pusher, media } = this.props;
    pusher.subscribe(media.pusher_channel).bind('media_updated', 'MediaDetail', (data, run) => {
      if (this.props.parentComponentName === 'MediaRelated') {
        if (run) {
          this.props.parentComponent.props.relay.forceFetch();
          return true;
        }
        return {
          id: `parent-media-${this.props.parentComponent.props.media.dbid}`,
          callback: this.props.parentComponent.props.relay.forceFetch,
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
    const {
      end,
      gaps,
      media,
      onPlayerReady,
      onTimelineCommentOpen,
      onVideoAnnoToggle,
      playerRef,
      playing,
      scrubTo,
      seekTo,
      setPlayerState,
      showVideoAnnotation,
      start,
    } = this.props;

    // Build the item URL
    const mediaUrl = guessProjectMediaUrl(media.team, media);

    return (
      <Card className="card media-detail">
        {this.props.condensed ? (
          <MediaCondensedRootContainer
            media={this.props.media}
            mediaUrl={mediaUrl}
            currentRelatedMedia={this.props.currentRelatedMedia}
          />
        ) : (
          <MediaExpanded
            media={this.props.media}
            mediaUrl={mediaUrl}
            {...{
              end,
              gaps,
              onPlayerReady,
              onTimelineCommentOpen,
              onVideoAnnoToggle,
              playerRef,
              playing,
              scrubTo,
              seekTo,
              setPlayerState,
              showVideoAnnotation,
              start,
            }}
          />
        )}
      </Card>
    );
  }
}

MediaDetail.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  pusher: pusherShape.isRequired,
};

export default withPusher(MediaDetail);
