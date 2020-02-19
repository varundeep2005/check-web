import React from 'react';
import { commitMutation, graphql } from 'react-relay';
import { defineMessages, injectIntl } from 'react-intl';
import CreateTaskMenu from '../task/CreateTaskMenu';
import EditTaskDialog from '../task/EditTaskDialog';
import environment from '../../CheckNetworkLayerModern';

const messages = defineMessages({
  error: {
    id: 'createTeamTask.error',
    defaultMessage: 'Failed to create default task',
  },
});

class CreateTeamTask extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      createType: null,
      message: null,
    };
  }

  handleSelectType = (createType) => {
    this.setState({ createType });
  };

  handleClose = () => {
    this.setState({ createType: null });
  }

  handleSubmitTask = (task) => {
    const mutation = graphql`
      mutation CreateTeamTaskModernMutation(
        $input: CreateTeamTaskInput!
      ) {
        createTeamTask(input: $input) {
          team_taskEdge {
            node {
              id
              dbid
              label
              description
              options
              type
              project_ids
              required
              json_schema
            }
          }
          team {
            id
            team_tasks(first: 10000) {
              edges {
                node {
                  id
                  dbid
                  label
                  description
                  options
                  type
                  project_ids
                  required
                  json_schema
                }
              }
            }
          }
        }
      }
    `;

    const variables = {
      input: {
        team_id: this.props.team.dbid,
        label: task.label,
        description: task.description,
        required: Boolean(task.required),
        task_type: this.state.createType,
        json_options: task.jsonoptions,
        json_project_ids: task.json_project_ids,
        json_schema: task.jsonschema,
      },
    };

    const onCompleted = () => {
      this.setState({ message: null });
      this.handleClose();
    };

    const onError = () => {
      const message = this.props.intl.formatMessage(messages.error);
      this.setState({ message });
    };

    commitMutation(
      environment,
      {
        mutation,
        variables,
        configs: [
          {
            type: 'RANGE_ADD',
            parentID: this.props.team.id,
            connectionInfo: [{
              key: 'Team_team_tasks',
              rangeBehavior: 'append',
            }],
            edgeName: 'team_taskEdge',
          },
        ],
        onCompleted,
        onError,
      },
    );
  };

  render() {
    return (
      <div>
        <CreateTaskMenu onSelect={this.handleSelectType} hideTeamwideOption />
        { this.state.createType ?
          <EditTaskDialog
            message={this.state.message}
            taskType={this.state.createType}
            onDismiss={this.handleClose}
            onSubmit={this.handleSubmitTask}
            projects={this.props.team.projects.edges}
          />
          : null
        }
      </div>
    );
  }
}

export default injectIntl(CreateTeamTask);
