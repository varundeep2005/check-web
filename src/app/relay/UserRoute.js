import Relay from 'react-relay/compat';

class UserRoute extends Relay.Route {
  static queries = {
    user: () => Relay.QL`query User { user(id: $userId) }`,
  };
  static paramDefinitions = {
    userId: { required: true },
  };
  static routeName = 'UserRoute';
}

export default UserRoute;
