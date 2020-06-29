import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import FormattedGlobalMessage from './FormattedGlobalMessage';
import UserTosForm from './UserTosForm';
import Message from './Message';
import { stringHelper } from '../customHelpers';
import AboutRoute from '../relay/AboutRoute';
import RelayContainer from '../relay/RelayContainer';
import UpdateUserMutation from '../relay/mutations/UpdateUserMutation';

class UserTosComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkedTos: false,
      checkedPp: false,
    };
  }

  handleCheckTos() {
    this.setState({ checkedTos: !this.state.checkedTos });
  }

  handleCheckPp() {
    this.setState({ checkedPp: !this.state.checkedPp });
  }

  handleSubmit() {
    const onFailure = () => {
      this.setState({
        message: (
          <FormattedGlobalMessage
            messageKey="unknownError"
            values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
          />
        ),
      });
    };

    if (this.state.checkedTos && this.state.checkedPp) {
      Relay.Store.commitUpdate(
        new UpdateUserMutation({
          current_user_id: this.props.user.id,
          accept_terms: true,
        }),
        { onFailure },
      );
    }
  }

  handleValidate() {
    if (!this.state.checkedTos || !this.state.checkedPp) {
      this.setState({
        message: <FormattedMessage id="userTos.validation" defaultMessage="You must agree to the Terms of Service and Privacy Policy" />,
      });
    }
  }

  render() {
    const { user, about } = this.props;

    const actions = [
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events
      <div onClick={this.handleValidate.bind(this)} style={{ cursor: 'pointer' }}>
        <Button
          id="tos__save"
          color="primary"
          onClick={this.handleSubmit.bind(this)}
          disabled={!this.state.checkedTos || !this.state.checkedPp}
        >
          <FormattedMessage id="userTos.save" defaultMessage="Save" />
        </Button>
      </div>,
    ];

    const linkStyle = {
      textDecoration: 'underline',
    };

    return (
      <React.Fragment>
        <DialogContent>
          <Message message={this.state.message} />
          <UserTosForm
            user={user}
            showTitle
            termsLastUpdatedAt={about.terms_last_updated_at}
            handleCheckTos={this.handleCheckTos.bind(this)}
            handleCheckPp={this.handleCheckPp.bind(this)}
            checkedTos={this.state.checkedTos}
            checkedPp={this.state.checkedPp}
          />
          { user && !user.last_accepted_terms_at ?
            <p>
              <FormattedMessage
                id="userTos.commGuidelines"
                defaultMessage="We ask that you also read our <cg>Community Guidelines</cg> for using {appName}."
                values={{
                  appName: <FormattedGlobalMessage messageKey="appNameHuman" />,
                  cg: (...chunks) => (
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      style={linkStyle}
                      href="https://meedan.com/en/community_guidelines/"
                    >
                      {chunks}
                    </a>
                  ),
                }}
              />
            </p> : null }
        </DialogContent>
        <DialogActions>
          {actions}
        </DialogActions>
      </React.Fragment>
    );
  }
}

UserTosComponent.propTypes = {
  user: PropTypes.object.isRequired,
  about: PropTypes.object.isRequired,
};

const UserTosContainer = Relay.createContainer(UserTosComponent, {
  fragments: {
    about: () => Relay.QL`
      fragment on About {
        terms_last_updated_at
      }
    `,
  },
});

const UserTos = (props) => {
  const route = new AboutRoute();
  const { user } = props;
  const openDialog = user && user.dbid && !user.accepted_terms;

  return (
    <Dialog open={openDialog}>
      <RelayContainer
        Component={UserTosContainer}
        route={route}
        renderFetched={data =>
          <UserTosContainer user={user} {...data} />
        }
      />
    </Dialog>
  );
};

export default UserTos;
