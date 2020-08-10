/* globals describe, expect, it */
import React from 'react';
import { mountWithIntlProvider } from '../../../../test/unit/helpers/intl-test';
import { EmbedCreate } from './EmbedCreate';

describe('<EmbedCreate />', () => {
  const authorName = 'Felis Catus';

  it('should render new report entry', () => {
    const wrapper = mountWithIntlProvider((
      <EmbedCreate
        content={{ title: 'This is a quote' }}
        projectMedia={{ media: { quote: 'This is a quote' } }}
        authorName={authorName}
      />
    ));
    expect(wrapper.html()).toMatch('Item added by Felis Catus');
  });

  it('should render edited title entry', () => {
    const wrapper = mountWithIntlProvider((
      <EmbedCreate
        content={{ title: 'This is an edited title' }}
        projectMedia={{ media: { quote: 'This is a quote' } }}
        authorName={authorName}
      />
    ));
    expect(wrapper.html()).toMatch('Item title edited by Felis Catus: This is an edited title');
  });

  it('should render created note entry', () => {
    const wrapper = mountWithIntlProvider((
      <EmbedCreate
        content={{ description: 'A description' }}
        projectMedia={{ media: {} }}
        authorName={authorName}
      />
    ));
    expect(wrapper.html()).toMatch('Item description added by Felis Catus');
  });
});
