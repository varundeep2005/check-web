import React from 'react';
import PropTypes from 'prop-types';
import { FormattedDate, FormattedMessage } from 'react-intl';

/**
 * Renders "Joined June 29, 2020 • 3 workspaces"
 */
const UserJoinedDateAndWorkspaceCount = ({ createdAt, nWorkspaces }) => (
  <FormattedDate value={createdAt} year="numeric" month="short" day="numeric">
    {dateString => (
      <FormattedMessage
        id="userTooltip.dateJoined"
        defaultMessage="Joined {date} • {teamsCount, plural, =0 {No workspaces} one {1 workspace} other {# workspaces}}"
        values={{
          date: dateString,
          teamsCount: nWorkspaces,
        }}
      />
    )}
  </FormattedDate>
);
UserJoinedDateAndWorkspaceCount.propTypes = {
  createdAt: PropTypes.instanceOf(Date).isRequired,
  nWorkspaces: PropTypes.number.isRequired,
};
export default UserJoinedDateAndWorkspaceCount;
