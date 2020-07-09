import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { Link } from 'react-router';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { makeStyles } from '@material-ui/core/styles';
import NextPreviousLinks from './NextPreviousLinks';
import MediaActionsBar from './MediaActionsBar';
import { subheading2, black02, black54 } from '../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    padding: theme.spacing(1),
    backgroundColor: black02,
    color: black54,
  },
  titleAndNavBar: {
    display: 'flex',
    flex: '1 1 auto',
    alignItems: 'center',
    padding: theme.spacing(1),
  },
  title: {
    flex: '1 1 auto',
    overflow: 'hidden', // to truncate text
    font: subheading2,
    color: 'inherit',
  },
  nav: {
    flex: '0 0 auto',
  },
}));

function MediaPageHeader({
  listUrl, listTitle, buildSiblingUrl, listQuery, listIndex, search, team, project, projectMedia,
}) {
  const classes = useStyles();

  return (
    <header className={classes.root}>
      <div className={classes.titleAndNavBar}>
        <IconButton component={Link} to={listUrl} className="project-header__back-button">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h2" noWrap className={classes.title}>
          {listTitle}
        </Typography>
        {(buildSiblingUrl && listQuery && search) ? (
          <NextPreviousLinks
            buildSiblingUrl={buildSiblingUrl}
            listQuery={listQuery}
            listIndex={listIndex}
            nTotal={search.number_of_results}
          />
        ) : null}
      </div>
      <MediaActionsBar
        key={projectMedia.dbid /* TODO test MediaActionsBar is sane, then nix key */}
        team={team}
        project={project}
        projectMedia={projectMedia}
      />
    </header>
  );
}
MediaPageHeader.defaultProps = {
  listQuery: null,
  listIndex: null,
  buildSiblingUrl: null,
  search: null,
  project: null,
};
MediaPageHeader.propTypes = {
  listUrl: PropTypes.string.isRequired,
  listTitle: PropTypes.node.isRequired,
  buildSiblingUrl: PropTypes.func, // null or func(projectMediaId, listIndex) => String|null
  listQuery: PropTypes.object, // or null
  listIndex: PropTypes.number, // or null
  search: PropTypes.shape({
    number_of_results: PropTypes.number.isRequired,
  }), // or null
  team: PropTypes.object.isRequired,
  project: PropTypes.object, // or null
  projectMedia: PropTypes.object.isRequired,
};

export default createFragmentContainer(MediaPageHeader, {
  search: graphql`
    fragment MediaPageHeader_search on CheckSearch {
      id
      number_of_results
    }
  `,
  team: graphql`
    fragment MediaPageHeader_team on Team {
      id
      ...MediaActionsBar_team
    }
  `,
  project: graphql`
    fragment MediaPageHeader_project on Project {
      id
      ...MediaActionsBar_project
    }
  `,
  projectMedia: graphql`
    fragment MediaPageHeader_projectMedia on ProjectMedia {
      id
      ...MediaActionsBar_projectMedia
    }
  `,
});
