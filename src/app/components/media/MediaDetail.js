import React from 'react';
import PropTypes from 'prop-types';
import Card from '@material-ui/core/Card';
import { withPusher, pusherShape } from '../../pusher';
import MediaExpanded from './MediaExpanded';
import MediaCondensed from './MediaCondensed';

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
      annotated,
      annotatedType,
      end,
      gaps,
      media,
      project,
      team,
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
    let projectDbid = project ? project.dbid : media.project_ids[0];
    if (!projectDbid && annotated && annotatedType === 'Project') {
      projectDbid = annotated.dbid;
    }
    let mediaUrl = null;
    if (media.dbid) {
      mediaUrl = projectDbid
        ? `/${team.slug}/project/${projectDbid}/media/${media.dbid}`
        : `/${team.slug}/media/${media.dbid}`;
    }

    return (
      <Card className="card media-detail">
        {this.props.condensed ? (
          <MediaCondensed
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
  project: PropTypes.object.isRequired,
  team: PropTypes.object.isRequired,
};

export default withPusher(MediaDetail);
