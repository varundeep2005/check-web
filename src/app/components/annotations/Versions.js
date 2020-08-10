import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import styled from 'styled-components';
import AddAnnotation from './AddAnnotation';
import Version from './Version';
import { units, black16, black38, opaqueBlack16, borderWidthMedium, Text } from '../../styles/js/shared';

const StyledVersions = styled.div`
  display: flex;
  flex-direction: column;
  .annotations__list {
    ${props => props.showAddAnnotation ?
    'height: calc(100vh - 260px);' :
    'height: calc(100vh - 160px);'
}
    overflow: auto;
    display: flex;
    flex-direction: column;
    border-top: 1px solid ${black16};
    border-bottom: 1px solid ${black16};

    .annotations__list-item {
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
      &:last-of-type {
        height: 100%;
      }
    }
  }
`;

const StyledVersionCardActions = styled(CardActions)`
  margin-top: auto;
`;

class Versions extends React.Component {
  componentDidMount() {
    this.scrollToBottom();
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  scrollToBottom = () => {
    const container = document.getElementsByClassName('annotations__list');
    if (container && container.length > 0) {
      container[0].scrollTop = container[0].scrollHeight;
    }
  };

  render() {
    const { props } = this;
    return (
      <StyledVersions
        className="annotations"
        showAddAnnotation={props.showAddAnnotation}
        annotationCount={props.versions.length}
      >
        <Card style={props.style}>
          <div className="annotations__list">
            {!props.versions.length
              ? <Text style={{ margin: 'auto', color: black38 }}>{props.noActivityMessage}</Text>
              : props.versions.map(version => (
                <div key={version.id} className="annotations__list-item">
                  <Version
                    team={props.projectMedia.team /* TODO pass team separately */}
                    projectMedia={props.projectMedia}
                    annotatedType="ProjectMedia"
                    version={version}
                    onTimelineCommentOpen={props.onTimelineCommentOpen}
                  />
                </div>))}
          </div>
          <StyledVersionCardActions>
            {props.showAddAnnotation ? <AddAnnotation projectMedia={props.projectMedia} /> : null}
          </StyledVersionCardActions>
        </Card>
      </StyledVersions>);
  }
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
      ...AddAnnotation_projectMedia
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
