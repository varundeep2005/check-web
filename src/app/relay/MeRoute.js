import Relay from 'react-relay/compat';

class MeRoute extends Relay.Route {
  static queries = {
    user: () => Relay.QL`query User { me }`,
  };
  static paramDefinitions = {
  };
  static routeName = 'MeRoute';
}

export default MeRoute;
