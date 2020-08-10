/* global describe, expect, it */
import React from 'react';
import { mountWithIntlProvider } from '../../../../test/unit/helpers/intl-test';
import { TaskUpdate } from './TaskUpdate';

describe('<TaskUpdate />', () => {
  const authorName = 'Felis Catus';

  it('should render empty string if no changes', () => {
    const version = {
      object_changes_json: '{}',
      meta: '{}',
    };
    const wrapper = mountWithIntlProvider((
      <TaskUpdate version={version} authorName={authorName} />
    ));
    expect(wrapper.html()).toEqual(null);
  });

  it('should render edited title entry', () => {
    const version = {
      object_changes_json: '{"data":[{"label":"Old title","description":"This is a task"},{"label":"New edited title","description":"This is a task"}]}',
      meta: '{}',
    };
    const wrapper = mountWithIntlProvider((
      <TaskUpdate version={version} authorName={authorName} />
    ));
    expect(wrapper.html()).toMatch('Task edited by Felis Catus: New edited title');
  });

  it('should render edited note entry', () => {
    const version = {
      object_changes_json: '{"data":[{"label":"Same old title","description":"This is a task"},{"label":"Same old title","description":"This is an edited description."}]}',
      meta: '{}',
    };
    const wrapper = mountWithIntlProvider((
      <TaskUpdate version={version} authorName={authorName} />
    ));
    expect(wrapper.html()).toMatch('Task note edited by Felis Catus: Same old title');
  });

  it('should render created note entry', () => {
    const version = {
      object_changes_json: '{"data":[{"label":"Same old title"},{"label":"Same old title","description":"This is a new description."}]}',
      meta: '{}',
    };
    const wrapper = mountWithIntlProvider((
      <TaskUpdate version={version} authorName={authorName} />
    ));
    expect(wrapper.html()).toMatch('Task note added by Felis Catus: Same old title');
  });
});
