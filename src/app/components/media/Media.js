import { createRefetchContainer, graphql } from 'react-relay/compat';
import MediaComponent from './MediaComponent'; // TODO put MediaComponent in this file
import MediaTitle from './MediaTitle'; // eslint-disable-line no-unused-vars
import MediaActionsBar from './MediaActionsBar'; // eslint-disable-line no-unused-vars

export default createRefetchContainer(MediaComponent, {
  team: graphql`
    fragment Media_team on Team {
      id
      ...MediaActionsBar_team
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
  `,
  project: graphql`
    fragment Media_project on Project {
      id
      dbid
      title
      search_id
      search { id, number_of_results }
      medias_count
    }
  `,
  media: graphql`
    fragment Media_media on ProjectMedia {
      id
      ...MediaTitle_projectMedia
      ...MediaActionsBar_projectMedia
      dbid
      title
      metadata
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
            ... on Dynamic {
              id
              parsed_fragment
              content
            }
          }
        }
      }
    }
  `,
}, graphql`
  query MediaRefetchQuery(
    $teamSlug: String!,
    $projectDbid: String!,
    $withProject: Boolean!,
    $projectMediaDbid: String!
  ) {
    team(slug: $teamSlug) {
      ...Media_team
    }
    project(id: $projectDbid) @include(if: $withProject) {
      ...Media_project
    }
    project_media(ids: $projectMediaDbid) {
      ...Media_media
    }
  }
`);
