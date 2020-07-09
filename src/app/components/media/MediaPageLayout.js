import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Media from './Media';
import MediaPageHeader from './MediaPageHeader';

// const StyledTopBar = styled.div`
//   display: flex;
//   flex-wrap: wrap;
//
//   .media-search__actions-bar {
//     width: 50%;
//     position: absolute;
//     height: 64px;
//     right: 0;
//     top: 0;
//     display: flex;
//     align-items: center;
//     z-index: 2;
//     padding: 0 16px;
//     justify-content: space-between;
//   }
//
//   @media (max-width: 1500px) {
//     .media-search__actions-bar {
//       width: 100%;
//       position: static;
//       margin-top: -28px;
//     }
//   }
// `;

function ListTitle({ project, isTrash }) {
  if (project) {
    return project.title;
  }
  if (isTrash) {
    return <FormattedMessage id="projectHeader.trash" defaultMessage="Trash" />;
  }
  return <FormattedMessage id="projectHeader.allItems" defaultMessage="All items" />;
}

function MediaPageLayout({
  listUrl,
  buildSiblingUrl,
  listQuery,
  listIndex,
  team,
  project,
  projectMedia,
  search,
}) {
  return (
    <React.Fragment>
      <MediaPageHeader
        listUrl={listUrl}
        listTitle={<ListTitle project={project} isTrash={projectMedia.archived} />}
        buildSiblingUrl={buildSiblingUrl}
        listQuery={listQuery}
        listIndex={listIndex}
        team={team}
        project={project}
        projectMedia={projectMedia}
        search={search}
      />
      <Media team={team} project={project} media={projectMedia} />
    </React.Fragment>
  );
}
MediaPageLayout.defaultProps = {
  listQuery: null,
  buildSiblingUrl: null,
  listIndex: null,
  project: null,
  search: null,
};
MediaPageLayout.propTypes = {
  listUrl: PropTypes.string.isRequired,
  buildSiblingUrl: PropTypes.func, // null or func(projectMediaId, listIndex) => String|null
  listQuery: PropTypes.object, // or null
  listIndex: PropTypes.number, // or null
  team: PropTypes.object.isRequired,
  projectMedia: PropTypes.shape({
    archived: PropTypes.bool.isRequired,
  }).isRequired,
  project: PropTypes.shape({
    title: PropTypes.string.isRequired,
  }), // or null
  search: PropTypes.object, // or null
};

export default createFragmentContainer(MediaPageLayout, {
  team: graphql`
    fragment MediaPageLayout_team on Team {
      id
      ...Media_team
      ...MediaPageHeader_team
    }
  `,
  project: graphql`
    fragment MediaPageLayout_project on Project {
      id
      title
      ...Media_project
      ...MediaPageHeader_project
    }
  `,
  projectMedia: graphql`
    fragment MediaPageLayout_projectMedia on ProjectMedia {
      id
      dbid
      archived
      ...Media_media
      ...MediaPageHeader_projectMedia
    }
  `,
  search: graphql`
    fragment MediaPageLayout_search on CheckSearch {
      id
      ...MediaPageHeader_search
    }
  `,
});
