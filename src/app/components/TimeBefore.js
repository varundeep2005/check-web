import React from 'react';
import PropTypes from 'prop-types';
import { FormattedDate, FormattedRelativeTime } from 'react-intl';
import { selectUnit } from '@formatjs/intl-utils';

/**
 * A <time> indicating "1 second ago" or some-such.
 *
 * Features:
 *
 * * `title` shows the full, formatted datetime.
 * * `<time dateTime=...>` is provided.
 * * Unit (days, seconds, etc.) is chosen sensibly.
 */
function TimeBefore({ date }) {
  const { value, unit } = selectUnit(date - new Date());
  return (
    <FormattedDate
      value={date}
      year="numeric"
      month="long"
      day="numeric"
      hour="numeric"
      minute="numeric"
    >
      {title => (
        <time dateTime={date.toISOString()} title={title}>
          <FormattedRelativeTime value={value} unit={unit} />
        </time>
      )}
    </FormattedDate>
  );
}
TimeBefore.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
};

export default TimeBefore;
