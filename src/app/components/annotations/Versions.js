import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import styled from 'styled-components';
import Version from './Version';
import { units, black38, opaqueBlack16, borderWidthMedium, Text } from '../../styles/js/shared';

const StyledVersions = styled.div`
  // accept vertical size from parent
  flex: 1 1 auto;
  overflow-y: auto;

  // use display: flex so we always use 100% of vertical space
  display: flex;
  flex-direction: column;

  .annotations__list-item {
    flex: 0 0 auto; // _most_ items have fixed sizes
    position: relative;
    margin: 0 ${units(1)};
    // The timeline line
    &::before {
      background-color: ${opaqueBlack16};
      content: '';
      display: block;
      position: absolute;
      bottom: 0;
      top: 0;
      width: ${borderWidthMedium};
      ${props => (props.theme.dir === 'rtl' ? 'right' : 'left')}: ${units(4)};
    }
    &:last-child {
      // the _last_ item takes all remaining vertical space, so the line
      // beside it goes to the bottom of the component.
      //
      // Also applies to the noActivityMessage
      flex-grow: 1;
    }
  }
`;

function Versions({
  versions, projectMedia, onTimelineCommentOpen, noActivityMessage,
}) {
  const ref = React.useRef();
  React.useLayoutEffect(() => {
    ref.current.scrollTop = ref.current.scrollHeight;
  });

  return (
    <StyledVersions className="annotations" ref={ref}>
      {versions.length
        ? versions.map(version => (
          <div key={version.id} className="annotations__list-item">
            <Version
              team={projectMedia.team /* TODO pass team separately */}
              projectMedia={projectMedia}
              annotatedType="ProjectMedia"
              version={version}
              onTimelineCommentOpen={onTimelineCommentOpen}
            />
          </div>
        ))
        : <Text style={{ margin: 'auto', color: black38 }}>{noActivityMessage}</Text>
      }
    </StyledVersions>
  );
}
Versions.propTypes = {
  projectMedia: PropTypes.object.isRequired,
  versions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired).isRequired,
  noActivityMessage: PropTypes.node.isRequired,
};

export default createFragmentContainer(Versions, {
  projectMedia: graphql`
    fragment Versions_projectMedia on ProjectMedia {
      id
      ...Version_projectMedia
    }
  `,
  versions: graphql`
    fragment Versions_versions on Version @argumentDefinitions(
      teamSlug: { type: "String!" },
    ) @relay(plural: true) {
      id
      ...Version_version @arguments(teamSlug: $teamSlug)
    }
  `,
});
