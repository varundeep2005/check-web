import Relay from 'react-relay/classic';
import { browserHistory } from 'react-router';
import { defineMessages } from 'react-intl';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import { request as requestFunction } from './redux/actions';
import { mapGlobalMessage } from './components/MappedMessage';

const fetchTimeout = config.timeout || 60000;

const messages = defineMessages({
  stillWorking: {
    id: 'network.stillWorking',
    defaultMessage: 'Still working...',
  },
  offline: {
    id: 'network.offline',
    defaultMessage: 'Can\'t connect to {app}, please make sure you\'re connected to the internet. Trying to reconnect...',
  },
  noResponse: {
    id: 'network.noResponse',
    defaultMessage: 'Couldn\'t connect to {app}, please make sure you\'re connected to the internet',
  },
});

function createRequestError(responseStatus, text) {
  const errorReason = `Server response had an error status ${responseStatus} and error ${text}`;

  const error = new Error(errorReason);
  error.status = responseStatus;

  try {
    const payload = JSON.parse(text);
    error.source = payload;
    error.parsed = true;
  } catch (ex) {
    // guess it isn't JSON. No matter.
    error.source = text;
    error.parsed = false;
  }

  return error;
}

async function throwOnServerError(response) {
  if (
    (response.status >= 200 && response.status < 300) ||
    response.status === 404 // check-api returns 404; we treat that as okay
  ) {
    return;
  }
  const text = await response.text();
  throw createRequestError(response.status, text);
}

let pollStarted = false;

/* eslint-disable no-underscore-dangle */

class CheckNetworkLayer extends Relay.DefaultNetworkLayer {
  constructor(path, options) {
    super(path, options);
    this.caller = options.caller;
    // this.startPoll();
  }

  messageCallback(message) {
    if (this.caller) {
      this.caller.setState({ message: this.l(message) });
    }
  }

  startPoll() {
    if (this.caller && !pollStarted) {
      let online = true;
      let poll = () => {};

      const failureCallback = () => {
        if (online) {
          this.messageCallback(messages.offline);
          online = false;
        }
        poll();
      };

      const successCallback = () => {
        if (!online) {
          this.messageCallback(null);
          online = true;
        }
        poll();
      };

      poll = () => {
        setTimeout(() => {
          requestFunction('get', 'ping', failureCallback, successCallback);
        }, 5000);
      };

      poll();
      pollStarted = true;
    }
  }

  l(message) {
    if (!message) {
      return null;
    }
    if (this.caller) {
      return this.caller.props.intl.formatMessage(message, { app: mapGlobalMessage(this.caller.props.intl, 'appNameHuman') });
    }
    return message.defaultMessage;
  }

  _handleHttpError(result) {
    if (result.status === 401 || result.status === 403) {
      // TODO migrate this logic to <GenericRelayClassicError>
      const team = this._init.team();
      if (team !== '') {
        browserHistory.push(`/${team}/join`);
      } else if (window.location.pathname !== '/check/forbidden') {
        browserHistory.push('/check/forbidden');
      }
    }
  }

  _queryHeaders() {
    const headers = {
      ...this._init.headers,
      Accept: '*/*',
      'Content-Type': 'application/json',
      'X-Check-Team': encodeURIComponent(this._init.team()),
      'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    if (window.parent !== window) {
      const token = window.location.search.replace(/^\?token=/, '');
      if (token) {
        headers['X-Check-Token'] = token;
      }
    }

    return headers;
  }

  _sendQuery(request) {
    if (config.pusherDebug) {
      // eslint-disable-next-line no-console
      console.debug('%cSending request to backend ', 'font-weight: bold');
    }
    return fetch(this._uri, {
      body: JSON.stringify({
        query: request.getQueryString(),
        variables: request.getVariables(),
        team: encodeURIComponent(this._init.team()),
      }),
      headers: this._queryHeaders(),
      method: 'POST',
      credentials: 'include',
    });
  }

  _sendMutation(request) {
    const _interopRequireDefault = obj => obj && obj.__esModule ? obj : { default: obj };

    let init;
    const files = request.getFiles();
    // eslint-disable-next-line global-require
    const _extends3 = _interopRequireDefault(require('babel-runtime/helpers/extends'));
    // eslint-disable-next-line global-require
    const _stringify2 = _interopRequireDefault(require('babel-runtime/core-js/json/stringify'));

    if (files) {
      if (!global.FormData) {
        throw new Error('Uploading files without `FormData` not supported.');
      }
      const formData = new FormData();
      formData.append('query', request.getQueryString());
      formData.append('variables', (0, _stringify2.default)(request.getVariables()));
      formData.append('team', encodeURIComponent(this._init.team()));
      Object.getOwnPropertyNames(files).forEach((filename) => {
        formData.append(filename, files[filename]);
      });
      init = (0, _extends3.default)({}, this._init, {
        body: formData,
        method: 'POST',
      });
    } else {
      init = (0, _extends3.default)({}, this._init, {
        body: (0, _stringify2.default)({
          query: request.getQueryString(),
          variables: request.getVariables(),
          team: encodeURIComponent(this._init.team()),
        }),
        headers: (0, _extends3.default)({}, this._init.headers, {
          Accept: '*/*',
          'Content-Type': 'application/json',
          'X-Check-Team': encodeURIComponent(this._init.team()),
          'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
        method: 'POST',
      });
    }

    const timeout = setTimeout(() => {
      this.messageCallback(messages.stillWorking);
    }, fetchTimeout);

    return fetch(this._uri, init).then((response) => {
      this.messageCallback(null);
      clearTimeout(timeout);
      return throwOnServerError(request, response);
    }).catch((error) => {
      if (error.parsed) {
        throw error;
      } else {
        clearTimeout(timeout);

        let { message } = error;
        if (error.name === 'TypeError') {
          message = this.l(messages.noResponse);
        }

        throw createRequestError(0, JSON.stringify({ error: message }));
      }
    });
  }
}

export default CheckNetworkLayer;
