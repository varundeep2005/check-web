import React from 'react';
import { FormattedMessage } from 'react-intl';
import CreateTeamCard from './CreateTeamCard';
import PageTitle from '../PageTitle';
import { ContentColumn } from '../../styles/js/shared';

const AddTeamPage = () => (
  <main className="create-team">
    <PageTitle
      prefix={<FormattedMessage id="addTeamPage.titleCreate" defaultMessage="Create a workspace" />}
    />
    <ContentColumn narrow>
      <CreateTeamCard />
    </ContentColumn>
  </main>
);
export default AddTeamPage;
