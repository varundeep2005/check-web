import React from 'react';
import Relay from 'react-relay/classic';
import { createRefetchContainer, graphql } from 'react-relay/compat';
import MediaRoute from '../../relay/MediaRoute';
import MediaComponent from './MediaComponent';
import MediasLoading from './MediasLoading';
// TODO put MediaComponent in this file
// eslint-disable-next-line no-unused-vars
import MediaTitle from './MediaTitle';
// eslint-disable-next-line no-unused-vars
import MediaDetail from './MediaDetail';

// TODO name things better. This is called `Media` because that's the filename,
// and relay-compat needs the container name to match the filename for the
// `...Media_media` in the refetch query.
const Media = createRefetchContainer(
  MediaComponent,
  {
    media: graphql`
      fragment Media_media on ProjectMedia {
        id
        ...MediaTitle_projectMedia
        ...MediaDetail_media
        dbid
        title
        metadata
        read_by_someone: is_read
        read_by_me: is_read(by_me: true)
        permissions
        pusher_channel
        project_ids
        requests_count
        media {
          url
          quote
          embed_path
          metadata
          type
        }
        comments: annotations(first: 10000, annotation_type: "comment") {
          edges {
            node {
              __typename
              ... on Comment {
                id
                dbid
                text
                parsed_fragment
                annotator {
                  id
                  name
                  profile_image
                }
                comments: annotations(first: 10000, annotation_type: "comment") {
                  edges {
                    node {
                      __typename
                      ... on Comment {
                        id
                        created_at
                        text
                        annotator {
                          id
                          name
                          profile_image
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        clips: annotations(first: 10000, annotation_type: "clip") {
          edges {
            node {
              __typename
              ... on Dynamic {
                id
                data
                parsed_fragment
              }
            }
          }
        }
        tags(first: 10000) {
          edges {
            node {
              id
              dbid
              fragment
              parsed_fragment
              annotated_id
              annotated_type
              annotated_type
              tag_text_object {
                id
                text
              }
            }
          }
        }
        geolocations: annotations(first: 10000, annotation_type: "geolocation") {
          edges {
            node {
              __typename
              ... on Dynamic {
                id
                parsed_fragment
                content
              }
            }
          }
        }
        team {
          id
          dbid
          slug
          name
          team_bots(first: 10000) {
            edges {
              node {
                login
              }
            }
          }
        }
      }
    `,
  },
  graphql`
    query MediaRefetchQuery($mediaID: ID!) {
      media: node(id: $mediaID) {
        ...Media_media
      }
    }
  `,
);

const MediaRootContainer = (props) => {
  const { projectMediaId } = props;
  const ids = `${projectMediaId}`;
  const route = new MediaRoute({ ids });

  return (
    <Relay.RootContainer
      Component={Media}
      route={route}
      renderLoading={() => <MediasLoading count={1} />}
    />
  );
};

export default MediaRootContainer;
