import React from 'react';
import PropTypes from 'prop-types';
import Avatar from '@material-ui/core/Avatar';
import { makeStyles } from '@material-ui/core/styles';
import { separationGray, white } from '../../styles/js/shared';

const HugeSize = 9;
const NormalSize = 5;

const useStyles = makeStyles(theme => ({
  root: ({ huge }) => ({
    background: white,
    border: `2px solid ${separationGray}`,
    width: theme.spacing(huge ? HugeSize : NormalSize),
    height: theme.spacing(huge ? HugeSize : NormalSize),
  }),
}));

export default function TeamAvatar(props) {
  const { src, huge, ...other } = props;
  const classes = useStyles({ huge });

  return (
    <Avatar
      classes={classes}
      variant="rounded"
      src={src}
      {...other}
    >
      <div />
    </Avatar>
  );
}
TeamAvatar.defaultProps = {
  huge: false,
};
TeamAvatar.propTypes = {
  src: PropTypes.string.isRequired,
  huge: PropTypes.bool, // false (default) => 5-unit size. true => 9-unit size
};
