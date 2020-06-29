import React from 'react';
import { FormattedMessage } from 'react-intl';
import Favicon from 'react-favicon';
import Typography from '@material-ui/core/Typography';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import FormattedGlobalMessage from './FormattedGlobalMessage';
import Message from './Message';
import FooterRelay from '../relay/containers/FooterRelay';
import Login from './Login';
import { stringHelper } from '../customHelpers';
import PageTitle from './PageTitle';
import { FadeIn, ContentColumn, units } from '../styles/js/shared';

const LoginContainer = props => (
  <Typography component="div" variant="body2" gutterBottom>
    <PageTitle>
      <ContentColumn style={{ maxWidth: units(82) }} id="login-container" className="login-container">
        <Favicon url={`/images/logo/${config.appName}.ico`} animated={false} />

        <p style={{ marginTop: 16, textAlign: 'center' }}>
          <FormattedMessage
            id="browser.support.message"
            defaultMessage="Best viewed with <a>Chrome for Desktop</a>"
            values={{
              a: (...chunks) => (
                <a
                  href="https://www.google.com/chrome/browser/desktop/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {chunks}
                </a>
              ),
            }}
          />
        </p>

        <Message message={props.message} />

        <FadeIn>
          <Login loginCallback={props.loginCallback} />
        </FadeIn>

        <p style={{ textAlign: 'center' }}>
          <FormattedMessage
            id="loginContainer.agreeTerms"
            defaultMessage="By signing in, you agree to the {appName} <tos>Terms of Service</tos> and <pp>Privacy Policy</pp>"
            values={{
              appName: <FormattedGlobalMessage messageKey="appNameHuman" />,
              tos: (...chunks) => (
                <a
                  className="login-container__footer-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={stringHelper('TOS_URL')}
                >
                  {chunks}
                </a>
              ),
              pp: (...chunks) => (
                <a
                  className="login-container__footer-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={stringHelper('PP_URL')}
                >
                  {chunks}
                </a>
              ),
            }}
          />
        </p>

        <p style={{ textAlign: 'center' }}>
          <FormattedMessage
            id="login.contactSupport"
            defaultMessage="For support contact <a>{supportEmail}</a>"
            values={{
              a: (...chunks) => (
                <a
                  href={`mailto:${stringHelper('SUPPORT_EMAIL')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {chunks}
                </a>
              ),
              supportEmail: stringHelper('SUPPORT_EMAIL'),
            }}
          />
        </p>
        <FooterRelay {...props} />
      </ContentColumn>
    </PageTitle>
  </Typography>
);

export default LoginContainer;
