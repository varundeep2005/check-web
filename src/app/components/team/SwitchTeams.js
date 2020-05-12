import React from 'react';
import Relay from 'react-relay/classic';
import { injectIntl } from 'react-intl';
import MeRoute from '../../relay/MeRoute';
import userFragment from '../../relay/userFragment';
import { renderGenericFailure } from '../../relay/GenericRelayClassicError';
import SwitchTeamsComponent from './SwitchTeamsComponent';

const SwitchTeamsContainer = Relay.createContainer(
  injectIntl(SwitchTeamsComponent),
  {
    fragments: {
      user: () => userFragment,
    },
  },
);

const SwitchTeams = () => {
  const route = new MeRoute();
  return (
    <Relay.RootContainer
      Component={SwitchTeamsContainer}
      route={route}
      renderFailure={renderGenericFailure}
      forceFetch
    />
  );
};

export default SwitchTeams;
