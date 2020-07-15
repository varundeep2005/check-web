/* global describe, expect, it, jest */
import React from 'react';
import { mount } from 'enzyme';
import Message from './Message';

describe('<Message>', () => {
  it('should show nothing when message=null', () => {
    const root = mount(<Message message={null} onClick={jest.fn()} />);
    expect(root.html()).toEqual('');
  });

  it('should show a String message', () => {
    const root = mount(<Message message="hi" onClick={jest.fn()} />);
    expect(root.text()).toEqual('hi');
  });

  it('should have a close button that calls onClick', () => {
    const onClick = jest.fn();
    const root = mount(<Message message="hi" onClick={onClick} />);
    root.find('button[aria-label="close"]').simulate('click');
    expect(onClick).toHaveBeenCalled();
  });

  it('should not call onClick when clicking the text', () => {
    const onClick = jest.fn();
    const root = mount(<Message message={<div className="x">hi</div>} onClick={onClick} />);
    root.find('.x').simulate('click');
    expect(onClick).not.toHaveBeenCalled();
  });

  it('should call onClick when clicking an <a> within the text', () => {
    const onClick = jest.fn();
    const root = mount(
      <Message message={<div className="x">hi <a href="#">there</a></div>} onClick={onClick} />
    );
    root.find('.x a').simulate('click');
    expect(onClick).toHaveBeenCalled();
  });
});
