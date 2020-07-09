import Relay from 'react-relay/classic';

class UpdateProjectMediaProjectMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateProjectMediaProject {
      updateProjectMediaProject
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UpdateProjectMediaProjectPayload {
        project_media_projectEdge,
        check_search_project {
          id
          number_of_results
          medias
        }
        check_search_project_was {
          id
          number_of_results
          medias
        }
        project_media_project {
          project_media {
            id
            project_ids
            projects
          }
        }
        project {
          id
          medias_count
          project_medias
        }
        project_was {
          id
          medias_count
          project_medias
        }
      }
    `;
  }

  getVariables() {
    const vars = {
      project_media_id: this.props.projectMedia.dbid,
      project_id: this.props.project.dbid,
      previous_project_id: this.props.previousProject.dbid,
    };
    return vars;
  }

  getConfigs() {
    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: {
          check_search_project: this.props.project.search_id,
          check_search_project_was: this.props.previousProject.search_id,
          project: this.props.project.id,
          project_was: this.props.previousProject.id,
          // FIXME need project_media: this.props.projectMedia.id, from the API
        },
      },
    ];
  }

  static fragments = {
    projectMedia: () => Relay.QL`
      fragment on ProjectMedia {
        id
        dbid
      }
    `,
    project: () => Relay.QL`
      fragment on Project {
        id
        dbid
        search_id
      }
    `,
    previousProject: () => Relay.QL`
      fragment on Project {
        id
        dbid
        search_id
      }
    `,
  }
}

export default UpdateProjectMediaProjectMutation;
