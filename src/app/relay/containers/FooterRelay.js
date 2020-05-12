import React from 'react';
import Relay from 'react-relay/classic';
import AboutRoute from '../AboutRoute';
import Footer from '../../components/Footer';
import { renderGenericFailure } from '../GenericRelayClassicError';

const FooterContainer = Relay.createContainer(Footer, {
  fragments: {
    about: () => Relay.QL`
      fragment on About {
        name,
        version
      }
    `,
  },
});

const FooterRelay = () => {
  const route = new AboutRoute();
  return (
    <Relay.RootContainer
      Component={FooterContainer}
      renderFailure={renderGenericFailure}
      route={route}
    />
  );
};

export default FooterRelay;
