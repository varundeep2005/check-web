import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import deepEqual from 'deep-equal';
import styled from 'styled-components';
import MediaUtil from './MediaUtil';
import ParsedText from '../ParsedText';
import { units, Row, Offset, black05, defaultBorderRadius, caption } from '../../styles/js/shared';

// If there is an AuthorPicture
// as a large icon or small favicon
const StyledAuthorImage = styled.img`
  border: 1px solid ${black05};
  border-radius: ${defaultBorderRadius};
  max-width: ${units(10)};
  max-height: ${units(10)};
  margin-top: 2px; // visual alignment
`;

// If it is a link to a jpg, png, or gif
const StyledContentImage = styled.img`
  border: 1px solid ${black05};
  border-radius: ${defaultBorderRadius};
  max-width: 100%;
  max-height: ${units(60)};
  margin-top: ${units(1)};
`;

const StyledLinkWrapper = styled.div`
  font: ${caption};
`;

class WebPageMediaCard extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return !deepEqual(nextProps, this.props) || !deepEqual(nextState, this.state);
  }

  render() {
    const { media, data, heading, isRtl, authorName, authorUsername } = this.props;
    const url = MediaUtil.url(media, data);
    const authorPictureUrl = (() => {
      if (data.picture && !data.picture.match(/\/screenshots\//)) {
        return (data.picture);
      } else if (data.favicon) {
        return (data.favicon);
      }
      return (null);
    })();

    const authorPicture = (authorPictureUrl)
      ? (<Offset isRtl={isRtl}>
        <StyledAuthorImage alt="" src={authorPictureUrl} />
      </Offset>)
      : null;

    // Todo: move webPageName logic to Pender
    const hasUniqueAuthorUsername =
      (authorName && authorUsername && (authorName !== authorUsername));
    const webPageName = hasUniqueAuthorUsername
      ? (<a href={data.author_url} target="_blank" rel="noopener noreferrer">
        {authorUsername}
      </a>)
      : null;

    const webPageUrl = url
    ? (<StyledLinkWrapper>
      <a href={url} target="_blank" rel="noopener noreferrer">
        {url}
      </a>
    </StyledLinkWrapper>)
    : null;

    const imageRegex = /\/.*\.(gifv?|jpe?g|png)(\?|#)?.*$/;
    const contentPicture = (() => {
      if (url && url.match(imageRegex)) {
        return (<StyledContentImage src={url} alt="" />);
      }
      return (null);
    })();

    return (
      <article>
        <Row alignTop>
          { authorPicture }
          <Offset isRtl={isRtl}>
            { heading}
            { webPageName }
            { data.description && <div><ParsedText text={data.description} /></div> }
            {webPageUrl}
            {contentPicture}
          </Offset>
        </Row>
      </article>
    );
  }
}

export default injectIntl(WebPageMediaCard);