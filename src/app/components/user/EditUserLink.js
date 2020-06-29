import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

/**
 * <a href="/check/.../edit">{children}</a> for a user.
 *
 * Props are all passed to the `<a>` component (so on-hover effects and
 * class names will behave as expected).
 */
const EditUserLink = React.forwardRef(function EditUserLink(props, ref) {
  const {
    userDbid, isUserSelf, children, ...rest
  } = props;
  return (
    <Link
      innerRef={ref}
      to={isUserSelf ? '/check/me/edit' : `/check/user/${userDbid}/edit`}
      {...rest}
    >
      {children}
    </Link>
  );
});
EditUserLink.propTypes = {
  userDbid: PropTypes.number.isRequired,
  isUserSelf: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
};
export default EditUserLink;
