import React from 'react';
import Relay from 'react-relay/classic';
import { makeStyles } from '@material-ui/core/styles';
import PublicTeamRoute from '../../relay/PublicTeamRoute';
import TeamAvatar from './TeamAvatar';
import teamPublicFragment from '../../relay/teamPublicFragment';
import { HeaderTitle, headerHeight } from '../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    height: headerHeight,
  },
  avatarWrapper: {
    padding: `${theme.spacing(0, 1)}`,
  },
}));

function TeamPublicHeaderComponent(props) {
  const classes = useStyles();
  const settingsPage = props.children.props.route.path === ':team/settings';
  const hideTeamName = /(.*\/project\/[0-9]+)/.test(window.location.pathname) || settingsPage;
  const { team } = props;

  if (!team) {
    return null;
  }

  return (
    <div className={classes.root}>
      <div className={classes.avatarWrapper}>
        <TeamAvatar src={team.avatar} />
      </div>
      {hideTeamName ? null : (
        <HeaderTitle>{team.name}</HeaderTitle>
      )}
    </div>
  );
}

const TeamPublicHeaderContainer = Relay.createContainer(TeamPublicHeaderComponent, {
  fragments: {
    team: () => teamPublicFragment,
  },
});

const TeamPublicHeader = (props) => {
  const teamSlug = (props.params && props.params.team) ? props.params.team : '';
  const route = new PublicTeamRoute({ teamSlug });
  return (
    <Relay.RootContainer
      Component={TeamPublicHeaderContainer}
      route={route}
      renderFetched={data => <TeamPublicHeaderContainer {...props} {...data} />}
    />
  );
};

export default TeamPublicHeader;
