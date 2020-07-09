import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
// import styled from 'styled-components';
import NextIcon from '@material-ui/icons/KeyboardArrowRight';
import PrevIcon from '@material-ui/icons/KeyboardArrowLeft';
import NextOrPreviousButton from './NextOrPreviousButton';
import { units, black54 } from '../../styles/js/shared';

// const StyledPager = styled.div`
//   position: absolute;
//   top: 0;
//   width: 20%;
//   left: 30%;
//   height: ${units(8)};
//   z-index: 1;
//   display: flex;
//   align-items: center;
//   justify-content: flex-end;
//   font-weight: bold;
//   font-size: ${units(2)};
//   color: ${black54};
//
//   button {
//     background: transparent;
//     border: 0;
//     color: ${black54};
//     cursor: pointer;
//     outline: 0;
//   }
//
//   @media (max-width: 650px) {
//     top: 43px;
//   }
//
//   @media (max-width: 1300px) {
//     width: 20%;
//     right: 24px;
//     left: auto;
//   }
// `;

const useStyles = makeStyles({
  root: {
    flex: '0 0 auto',
    display: 'flex', // to center items vertically
    alignItems: 'center',
    fontWeight: 'bold',
    fontSize: units(2),
    color: black54,
  },
});

export default function NextPreviousLinksComponent({
  buildSiblingUrl, listQuery, listIndex, nTotal,
}) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <NextOrPreviousButton
        className="media-search__previous-item"
        key={`previous-${listIndex}` /* unmount+remount when switching pages */}
        disabled={listIndex < 1}
        tooltipTitle={
          <FormattedMessage id="mediaSearch.previousItem" defaultMessage="Previous item" />
        }
        buildSiblingUrl={buildSiblingUrl}
        listQuery={listQuery}
        listIndex={listIndex - 1}
      >
        <PrevIcon />
      </NextOrPreviousButton>
      <span className="media-search__current-item">
        <FormattedMessage
          id="mediaSearch.xOfY"
          defaultMessage="{current} of {total}"
          values={{ current: listIndex + 1, total: nTotal }}
        />
      </span>
      <NextOrPreviousButton
        className="media-search__next-item"
        key={`next-${listIndex}` /* unmount+remount when switching pages */}
        disabled={listIndex + 1 >= nTotal}
        tooltipTitle={
          <FormattedMessage id="mediaSearch.nextItem" defaultMessage="Next item" />
        }
        buildSiblingUrl={buildSiblingUrl}
        listQuery={listQuery}
        listIndex={listIndex + 1}
      >
        <NextIcon />
      </NextOrPreviousButton>
    </div>
  );
}
NextPreviousLinksComponent.propTypes = {
  buildSiblingUrl: PropTypes.func.isRequired, // func(dbid, listIndex) => location
  listQuery: PropTypes.object.isRequired,
  listIndex: PropTypes.number.isRequired,
  nTotal: PropTypes.number.isRequired,
};
