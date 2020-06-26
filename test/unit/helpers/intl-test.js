// from: https://gist.github.com/mirague/c05f4da0d781a9b339b501f1d5d33c37/#file-intl-enzyme-test-helper-js

/**
 * Components using the react-intl module require access to the intl context.
 * This is not available when mounting single components in Enzyme.
 * These helper functions aim to address that and wrap a valid,
 * English-locale intl context around them.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { IntlProvider, createIntl, createIntlCache } from 'react-intl';
import { mount, shallow } from 'enzyme';

/**
 * When using React-Intl `injectIntl` on components, props.intl is required.
 */
function nodeWithIntlProp(node) {
  const cache = createIntlCache();
  const intl = createIntl({ locale: 'en', messages: {} }, cache);
  return React.cloneElement(node, { intl });
}

const store = {
  currentUser: {
  },

  team: {
    projects: {
      edges: [
        { node: { dbid: 1 } },
      ],
    },
  },

  getState() {
    return {
      app: {
        context: {
          team: this.team,
          currentUser: this.currentUser,
        },
      },
    };
  },
};

/**
 * You can manipulate the global context through this function, e.g.:
 *
 * getStore().currentUser = { foo: 'foo', bar: 'bar' }
 */
export function getStore() {
  return store;
}

/**
 * DEPRECATED. Does lots of things. TODO callers, use mountWithIntlProvider() only.
 */
export function mountWithIntl(node) {
  return mountWithIntlProvider(node, {}, {
    context: { store },
    childContextTypes: { store: PropTypes.object },
  });
}

export function mountWithIntlProvider(node, intlProviderProps = {}, extraProps = {}) {
  return mount(node, {
    wrappingComponent: IntlProvider,
    wrappingComponentProps: {
      locale: 'en',
      ...intlProviderProps,
    },
    ...extraProps,
  });
}
