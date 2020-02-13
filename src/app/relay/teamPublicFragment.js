import Relay from 'react-relay/compat';

const teamPublicFragment = Relay.QL`
  fragment on PublicTeam {
      id,
      name,
      avatar,
      dbid,
      private,
      slug,
      team_graphql_id,
      verification_statuses,
      translation_statuses,
      trash_count,
      pusher_channel,
    }
`;

module.exports = teamPublicFragment;
