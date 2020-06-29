import React from 'react';
import EditIcon from '@material-ui/icons/Edit';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import AccountChips from './AccountChips';
import Can from '../Can';
import ParsedText from '../ParsedText';
import { parseStringUnixTimestamp, truncateLength } from '../../helpers';
import UserJoinedDateAndWorkspaceCount from '../user/UserJoinedDateAndWorkspaceCount';
import EditUserLink from '../user/EditUserLink';
import FormattedGlobalMessage from '../FormattedGlobalMessage';
import SourcePicture from './SourcePicture';
import {
  StyledContactInfo,
  StyledTwoColumns,
  StyledSmallColumn,
  StyledBigColumn,
  StyledName,
  StyledDescription,
} from '../../styles/js/HeaderCard';
import { Row } from '../../styles/js/shared';

const UserInfo = (props) => {
  if (props.user.source === null) return null;

  return (
    <StyledTwoColumns>
      <StyledSmallColumn>
        <SourcePicture
          size="large"
          object={props.user.source}
          type="user"
          className="source__avatar"
        />
      </StyledSmallColumn>

      <StyledBigColumn>
        <div className="source__primary-info">
          <StyledName className="source__name">
            <Row>
              {props.user.name}
              <Can permissions={props.user.permissions} permission="update User">
                <Tooltip title={<FormattedGlobalMessage messageKey="edit" />}>
                  <IconButton
                    className="source__edit-source-button"
                    component={EditUserLink}
                    userDbid={props.user.dbid}
                    isUserSelf={props.isUserSelf}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              </Can>
            </Row>
          </StyledName>
          <StyledDescription>
            <p>
              <ParsedText text={truncateLength(props.user.source.description, 600)} />
            </p>
          </StyledDescription>
        </div>

        <AccountChips
          accounts={props.user.source.account_sources.edges.map(as => as.node.account)}
        />

        <StyledContactInfo>
          <UserJoinedDateAndWorkspaceCount
            createdAt={parseStringUnixTimestamp(props.user.source.created_at)}
            nWorkspaces={props.user.team_users.edges.length}
          />
        </StyledContactInfo>
      </StyledBigColumn>
    </StyledTwoColumns>
  );
};

export default UserInfo;
