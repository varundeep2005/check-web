import Relay from 'react-relay/classic';

class DeleteProjectMediaProjectMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation destroyProjectMediaProject {
      destroyProjectMediaProject
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on DestroyProjectMediaProjectPayload {
        check_search_project {
          id
          number_of_results
          medias
        }
        project {
          id
          dbid
          title
          medias_count
          search_id
          team {
            slug
          }
        }
        project_media {
          project_ids
        }
      }
    `;
  }

  getOptimisticResponse() {
    const { project, project_media: projectMedia } = this.props;

    return {
      deletedId: projectMedia.id,
      project: {
        id: project.id,
        medias_count: project.medias_count - 1,
      },
      projectMedia: {
        id: projectMedia.id,
        project_ids: projectMedia.project_ids.filter(i => i !== projectMedia.id),
      }
    };
  }

  getVariables() {
    return {
      project_id: this.props.project.dbid,
      project_media_id: this.props.projectMedia.dbid,
    };
  }

  getConfigs() {
    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: {
          check_search_project: this.props.project.search_id,
          project: this.props.project.id,
        },
      },
      {
        type: 'RANGE_DELETE',
        parentName: 'check_search_project',
        parentID: this.props.project.search_id,
        connectionName: 'medias',
        pathToConnection: ['check_search_project', 'medias'],
        deletedIDFieldName: 'deletedId',
      },
    ];
  }

  static fragments = {
    project: Relay.QL`
      id
      dbid
      media_counts
    `,
    projectMedia: Relay.QL`
      id
      dbid
      project_ids
    `,
  }
}

export default DeleteProjectMediaProjectMutation;
