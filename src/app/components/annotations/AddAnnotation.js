import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import InsertPhotoIcon from '@material-ui/icons/InsertPhoto';
import styled from 'styled-components';
import CreateCommentMutation from '../../relay/mutations/CreateCommentMutation';
import CheckContext from '../../CheckContext';
import UploadFile from '../UploadFile';
import { ContentColumn, Row, black38, black87, units } from '../../styles/js/shared';
import { getErrorMessage } from '../../helpers';
import { stringHelper } from '../../customHelpers';

const AddAnnotationButtonGroup = styled(Row)`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  .add-annotation__insert-photo {
    svg {
      path { color: ${black38}; }
      &:hover path {
        color: ${black87};
        cusor: pointer;
      }
    }
  }
`;

class AddAnnotation extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      comment: '',
      image: null,
      message: null,
      isSubmitting: false,
      fileMode: false,
      canBeAutoChanged: true,
    };
  }

  componentDidMount() {
    // This code only applies if this page is embedded in the browser extension
    if (window.parent !== window && this.props.task) {
      // Receive the selected text from the page and use it to fill a task note
      const { task } = this.props;
      const receiveMessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.selectedText &&
          this.state.canBeAutoChanged &&
          (this.props.taskResponse || task.type !== 'free_text') &&
          parseInt(data.task, 10) === parseInt(this.props.task.dbid, 10)) {
          this.setState({ comment: data.selectedText });
        }
      };
      window.addEventListener('message', receiveMessage, false);
    }
  }

  onImageChange = (file) => {
    this.setState({ image: file, message: null });
  }

  onImageError(file, message) {
    this.setState({ image: null, message });
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  invalidCommand() {
    this.setState({
      message: (
        <FormattedMessage id="addAnnotation.invalidCommand" defaultMessage="Invalid command" />
      ),
      isSubmitting: false,
    });
  }

  resetState = () => {
    this.setState({
      comment: '',
      image: null,
      message: null,
      isSubmitting: false,
      fileMode: false,
    });
  };

  fail = (transaction) => {
    const fallbackMessage = (
      <FormattedMessage
        id="addAnnotation.error"
        defaultMessage="Sorry, an error occurred while updating the item. Please try again and contact {supportEmail} if the condition persists."
        values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
      />
    );
    const message = getErrorMessage(transaction, fallbackMessage);
    this.setState({
      message: message.replace(/<br\s*\/?>/gm, '; '),
      isSubmitting: false,
    });
  };

  addComment(text, image) {
    const { currentUser: annotator } = this.getContext();
    const { task, projectMedia } = this.props;

    const buildMutationProps = (parent_type, annotated_type, annotated) => ({
      parent_type,
      annotator,
      annotated,
      image,
      annotation: {
        text,
        annotated_type,
        annotated_id: annotated.dbid,
      },
    });
    const mutationProps = this.props.task
      ? buildMutationProps('task', 'Task', task)
      : buildMutationProps('project_media', 'ProjectMedia', projectMedia);

    Relay.Store.commitUpdate(
      new CreateCommentMutation(mutationProps),
      { onFailure: this.fail, onSuccess: this.resetState },
    );
  }

  handleChange = (e) => {
    this.setState({ comment: e.target.value, message: null });
  }

  handleFocus = () => {
    this.setState({ message: null });
  }

  handleSubmit = (e) => {
    e.preventDefault();

    const { comment } = this.state;
    const image = this.state.fileMode ? this.state.image : null;
    if (this.state.isSubmitting || (!comment && !image)) {
      return;
    }

    this.setState({ isSubmitting: true });

    this.addComment(comment, image);
  }

  handleKeyUp(e) {
    if (e.target.value !== '' && this.state.canBeAutoChanged) {
      this.setState({ canBeAutoChanged: false });
    }
    if (e.target.value === '' && !this.state.canBeAutoChanged) {
      this.setState({ canBeAutoChanged: true });
    }
  }

  handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      this.handleSubmit(e);
    }
  }

  switchMode() {
    this.setState({ fileMode: !this.state.fileMode });
  }

  render() {
    return (
      <form
        className="add-annotation"
        onSubmit={this.handleSubmit.bind(this)}
        style={{
          height: '100%',
          width: '100%',
          paddingTop: units(2),
          position: 'relative',
          zIndex: 0,
        }}
      >
        <ContentColumn flex style={{ maxWidth: '100%' }}>
          <FormattedMessage id="addAnnotation.inputHint" defaultMessage="Add a note">
            {inputHint => (
              <TextField
                placeholder={inputHint}
                onFocus={this.handleFocus.bind(this)}
                error={Boolean(this.state.message)}
                helperText={this.state.message}
                name="cmd"
                id="cmd-input"
                multiline
                fullWidth
                onKeyPress={this.handleKeyPress.bind(this)}
                onKeyUp={this.handleKeyUp.bind(this)}
                value={this.state.comment}
                onChange={this.handleChange.bind(this)}
              />
            )}
          </FormattedMessage>
          {this.state.fileMode ? (
            <UploadFile
              type="image"
              value={this.state.image}
              onChange={this.onImageChange}
              onError={this.onImageError}
            />
          ) : null}
          <AddAnnotationButtonGroup className="add-annotation__buttons">
            <div className="add-annotation__insert-photo">
              <InsertPhotoIcon
                id="add-annotation__switcher"
                title={
                  <FormattedMessage id="addAnnotation.addImage" defaultMessage="Add an image" />
                }
                className={this.state.fileMode ? 'add-annotation__file' : ''}
                onClick={this.switchMode.bind(this)}
              />
            </div>
            <Button color="primary" type="submit">
              <FormattedMessage id="addAnnotation.submitButton" defaultMessage="Submit" />
            </Button>
          </AddAnnotationButtonGroup>
        </ContentColumn>
      </form>
    );
  }
}
AddAnnotation.contextTypes = {
  store: PropTypes.object,
};
AddAnnotation.defaultProps = {
  projectMedia: null,
  task: null,
};
AddAnnotation.propTypes = {
  projectMedia: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    log_count: PropTypes.number.isRequired,
  }), // or null if `task` is set
  task: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.string.isRequired, // Task.dbid is String; ProjectMedia.dbid is Int
    project_media: PropTypes.shape({
      id: PropTypes.string.isRequired,
      log_count: PropTypes.number.isRequired,
    }).isRequired,
  }), // or null if `projectMedia` is set
};

export { AddAnnotation };
// TODO make two separate components: one for Task, one for ProjectMedia
export default createFragmentContainer(AddAnnotation, {
  projectMedia: graphql`
    fragment AddAnnotation_projectMedia on ProjectMedia {
      id
      dbid
      log_count
    }
  `,
  task: graphql`
    fragment AddAnnotation_task on Task {
      id
      dbid
      project_media {
        id
        log_count
      }
    }
  `,
});
