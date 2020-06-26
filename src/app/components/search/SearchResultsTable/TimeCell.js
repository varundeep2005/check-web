import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import { makeStyles } from '@material-ui/core/styles';
import TimeBefore from '../../TimeBefore';

const useStyles = makeStyles({
  root: {
    whiteSpace: 'nowrap',
  },
});

export default function TimeCell({ unixTimestampInS }) {
  const classes = useStyles();

  return (
    <TableCell classes={classes}>
      <TimeBefore date={new Date(unixTimestampInS * 1000)} />
    </TableCell>
  );
}
TimeCell.propTypes = {
  unixTimestampInS: PropTypes.number.isRequired,
};
