import React from 'react';
import { FormattedMessage } from 'react-intl';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { browserHistory, Link } from 'react-router';
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import InputAdornment from '@material-ui/core/InputAdornment';
import styled from 'styled-components';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import {
  caption,
  checkBlue,
  units,
} from '../../styles/js/shared';

const TeamUrlRow = styled.div`
  align-items: flex-start;
  display: flex;
  font-size: 12px;
  margin-top: 24px;
  height: ${units(10)};
  label {
    font: ${caption};
    color: ${checkBlue};
  }
`;

function FindTeamCardComponent({
  queryTeamSlug, onSubmitTeamSlug, isLoading, isFound,
}) {
  // teamSlug: what the user sees
  const [teamSlug, setTeamSlug] = React.useState(queryTeamSlug);

  const handleChangeTeamSlug = React.useCallback((ev) => {
    setTeamSlug(ev.target.value);
  }, [setTeamSlug]);

  const handleSubmit = React.useCallback((ev) => {
    ev.preventDefault();
    onSubmitTeamSlug(teamSlug);
  }, [onSubmitTeamSlug, teamSlug]);

  const isNotFound = !!queryTeamSlug && queryTeamSlug === teamSlug && !isLoading && !isFound;

  return (
    <div>
      <Card className="find-team-card">
        <CardHeader
          titleStyle={{ fontSize: '20px', lineHeight: '32px' }}
          title={
            <FormattedMessage
              id="findTeamCard.mainHeading"
              defaultMessage="Find an existing workspace"
            />
          }
          subheader={
            <FormattedMessage
              id="findTeamCard.blurb"
              defaultMessage="Request to join an existing workspace by adding its URL here:"
            />
          }
        />
        <form className="find-team__form" disabled={queryTeamSlug && isLoading}>
          <CardContent>
            <TeamUrlRow>
              <FormattedMessage id="findTeamCard.teamSlugHint" defaultMessage="workspace-url">
                {teamSlugHint => (
                  <TextField
                    type="text"
                    id="team-slug-container"
                    className="find-team__team-slug-input"
                    value={teamSlug}
                    onChange={handleChangeTeamSlug}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">{config.selfHost}/</InputAdornment>
                      ),
                    }}
                    label={
                      <FormattedMessage id="findTeamCard.url" defaultMessage="Workspace URL" />
                    }
                    placeholder={teamSlugHint}
                    error={isNotFound}
                    helperText={isNotFound ? (
                      <FormattedMessage
                        id="findTeamCard.teamNotFound"
                        defaultMessage="Workspace not found!"
                      />
                    ) : null}
                    autoComplete="off"
                    fullWidth
                  />
                )}
              </FormattedMessage>
            </TeamUrlRow>
          </CardContent>
          <CardActions>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              className="find-team__submit-button"
              onClick={handleSubmit}
            >
              <FormattedMessage id="findTeamCard.submitButton" defaultMessage="Find workspace" />
            </Button>
          </CardActions>
        </form>
      </Card>
      <div style={{ marginTop: units(2) }}>
        <Link to="/check/teams/new" className="find-team__toggle-create">
          <FormattedMessage
            id="findTeamCard.createYourOwn"
            defaultMessage="You can also create your own workspace."
          />
        </Link>
      </div>
    </div>
  );
}

export default function FindTeamCard({ teamSlug }) {
  const [queryTeamSlug, setQueryTeamSlug] = React.useState(teamSlug || '');

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={queryTeamSlug ? graphql`
        query FindTeamCardQuery($teamSlug: String!) {
          find_public_team(slug: $teamSlug) {
            id  # TODO nix
            slug
          }
        }
      ` : null}
      variables={{ teamSlug: queryTeamSlug }}
      render={({ error, props }) => {
        if (props && props.find_public_team) {
          // Start redirecting.
          browserHistory.push(`/${props.find_public_team.slug}/join`);
          // We still need to render the component! It'll have `isLoading=false`, `isFound=true`.
        }

        return (
          <FindTeamCardComponent
            queryTeamSlug={queryTeamSlug}
            onSubmitTeamSlug={setQueryTeamSlug}
            isLoading={!error && !props}
            isFound={props && props.find_public_team}
          />
        );
      }}
    />
  );
}
