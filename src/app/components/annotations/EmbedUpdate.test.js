/* globals describe, expect, it */
import React from 'react';
import { mountWithIntlProvider } from '../../../../test/unit/helpers/intl-test';
import { EmbedUpdate } from './EmbedUpdate';

describe('<EmbedUpdate />', () => {
  const authorName = 'Felis Catus';

  it('should render null if no changes', () => {
    const version = { object_changes_json: '{}' };
    const wrapper = mountWithIntlProvider((
      <EmbedUpdate version={version} authorName={authorName} />
    ));
    expect(wrapper.html()).toEqual(null);
  });

  it('should render edited title entry', () => {
    const version = {
      object_changes_json: '{"data":[{"title":"Old title","description":"This is a tweet."},{"title":"New edited title","description":"This is a tweet."}]}',
    };
    const wrapper = mountWithIntlProvider((
      <EmbedUpdate version={version} authorName={authorName} />
    ));
    expect(wrapper.html()).toMatch('Item title edited by Felis Catus: New edited title');
  });

  it('should render edited note entry', () => {
    const version = {
      object_changes_json: '{"data":[{"title":"Same old title","description":"This is a tweet."},{"title":"Same old title","description":"This is an edited description."}]}',
    };
    const wrapper = mountWithIntlProvider((
      <EmbedUpdate version={version} authorName={authorName} />
    ));
    expect(wrapper.html()).toMatch('Item description edited by Felis Catus');
  });

  it('should render created note entry', () => {
    const version = {
      object_changes_json: '{"data":[{"title":"Same old title"},{"title":"Same old title","description":"This is a new description."}]}',
    };
    const wrapper = mountWithIntlProvider((
      <EmbedUpdate version={version} authorName={authorName} />
    ));
    expect(wrapper.html()).toMatch('Item description added by Felis Catus');
  });
});
