import React from 'react';
import Relay from 'react-relay/classic';
import PublicTeamRoute from '../../relay/PublicTeamRoute';
import teamPublicFragment from '../../relay/teamPublicFragment';
import { renderGenericFailure } from '../../relay/GenericRelayClassicError';
import TeamHeaderComponent from './TeamHeaderComponent';

const TeamPublicHeaderContainer = Relay.createContainer(TeamHeaderComponent, {
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
      renderFailure={renderGenericFailure}
      renderFetched={data => <TeamPublicHeaderContainer {...props} {...data} />}
    />
  );
};

export default TeamPublicHeader;
