import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import FindTeamCard from './FindTeamCard';
import PageTitle from '../PageTitle';
import { ContentColumn } from '../../styles/js/shared';

const FindTeamPage = ({ params }) => (
  <main>
    <PageTitle prefix={
      <FormattedMessage id="addTeamPage.titleFind" defaultMessage="Find an existing workspace" />
    }
    />
    <ContentColumn narrow>
      <FindTeamCard teamSlug={params.team} />
    </ContentColumn>
  </main>
);
FindTeamPage.propTypes = {
  params: PropTypes.shape({
    team: PropTypes.string, // or null
  }).isRequired,
};
export default FindTeamPage;
