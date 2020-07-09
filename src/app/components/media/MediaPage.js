import React from 'react';
import PropTypes from 'prop-types';
import MediaPageQueryRenderer from './MediaPageQueryRenderer';
import { getListUrlQueryAndIndex } from '../../urlHelpers';
import NotFound from '../NotFound';

export default function MediaPage({ routeParams, location }) {
  const {
    listUrl,
    listQuery,
    listIndex,
    buildSiblingUrl,
  } = getListUrlQueryAndIndex(routeParams, location.query);

  const projectDbid = parseInt(routeParams.projectId, 10) || null;
  const projectMediaDbid = parseInt(routeParams.mediaId, 10) || null;
  const teamSlug = routeParams.team;

  if (projectMediaDbid === null) {
    return <NotFound />;
  }

  return (
    <MediaPageQueryRenderer
      listUrl={listUrl}
      listQuery={listQuery}
      listIndex={listIndex}
      buildSiblingUrl={buildSiblingUrl}
      teamSlug={teamSlug}
      projectDbid={projectDbid}
      projectMediaDbid={projectMediaDbid}
    />
  );
}

MediaPage.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    projectId: PropTypes.string, // or undefined
    mediaId: PropTypes.string.isRequired,
  }).isRequired,
  location: PropTypes.shape({
    query: PropTypes.object.isRequired,
  }).isRequired,
};
