import Relay from 'react-relay/compat';

class SearchRoute extends Relay.Route {
  static queries = {
    search: () => Relay.QL`query Search { search(query: $query) }`,
  };
  static paramDefinitions = {
    query: { required: true },
  };
  static routeName = 'SearchRoute';
}

export default SearchRoute;
