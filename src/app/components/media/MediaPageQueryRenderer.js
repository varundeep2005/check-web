import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import NotFound from '../NotFound';
import MediaPageLayout from './MediaPageLayout';
import MediasLoading from './MediasLoading';

export default function MediaPageQueryRenderer({
  listUrl, buildSiblingUrl, listQuery, listIndex, teamSlug, projectDbid, projectMediaDbid,
}) {
  const render = React.useCallback(({ error, props }) => {
    if (error) {
      return <div className="TODO-handle-error">{error.message}</div>;
    } else if (props) {
      const {
        team, project, search, project_media: projectMedia,
      } = props;
      if (
        !team // Team not found
        || !projectMedia // Media not found
        || (projectDbid && !project) // Project requested and not found
        || (projectMedia.team.id !== team.id) // Media not in team
        || (project && project.team.id !== team.id) // Project not in team
        || (project && !projectMedia.project_ids.includes(project.dbid)) // Media not in project
      ) {
        return <NotFound />;
      }

      return (
        <MediaPageLayout
          team={team}
          projectMedia={projectMedia}
          project={project}
          search={search}
          listUrl={listUrl}
          buildSiblingUrl={buildSiblingUrl}
          listQuery={listQuery}
          listIndex={listIndex}
        />
      );
    }

    return <MediasLoading count={1} />;
  }, [listUrl, buildSiblingUrl, listQuery, listIndex, projectDbid]);

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query MediaPageQueryRendererQuery(
          $queryJson: String!,
          $withSearch: Boolean!,
          $teamSlug: String!,
          $projectDbid: String!,
          $withProject: Boolean!,
          $projectMediaDbid: String!
        ) {
          search(query: $queryJson) @include(if: $withSearch) {
            id
            ...MediaPageLayout_search
          }
          team(slug: $teamSlug) {
            id
            ...MediaPageLayout_team
          }
          project(id: $projectDbid) @include(if: $withProject) {
            id
            dbid
            team {
              id
            }
            ...MediaPageLayout_project
          }
          project_media(ids: $projectMediaDbid) {
            id
            team {
              id
            }
            project_ids
            ...MediaPageLayout_projectMedia
          }
        }
      `}
      variables={{
        queryJson: JSON.stringify(listQuery),
        withSearch: listIndex !== null,
        teamSlug,
        projectDbid: projectDbid ? String(projectDbid) : '',
        withProject: projectDbid !== null,
        projectMediaDbid: String(projectMediaDbid),
      }}
      render={render}
    />
  );
}
MediaPageQueryRenderer.defaultProps = {
  listQuery: null,
  buildSiblingUrl: null,
  listIndex: null,
  projectDbid: null,
};
MediaPageQueryRenderer.propTypes = {
  listUrl: PropTypes.string.isRequired,
  buildSiblingUrl: PropTypes.func, // null or func(projectMediaDbid, listIndex) => String|null
  listQuery: PropTypes.object, // or null
  listIndex: PropTypes.number, // or null
  teamSlug: PropTypes.string.isRequired,
  projectDbid: PropTypes.number, // or null
  projectMediaDbid: PropTypes.number.isRequired,
};
