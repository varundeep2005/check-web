import React from 'react';
import Relay from 'react-relay/classic';
import CircularProgress from '../components/CircularProgress';
import MediasLoading from '../components/media/MediasLoading';
import { renderGenericFailure } from './GenericRelayClassicError';

const RelayContainer = (props) => {
  const params = Object.assign({}, props);
  const loaderprops = Object.assign({}, params.loaderProps);
  delete params.loaderProps;

  const type = params.loaderType || 'circular';
  delete params.loaderType;

  const loaders = {
    circular: <CircularProgress {...loaderprops} />,
    item: <MediasLoading {...loaderprops} />,
  };

  return (
    <Relay.RootContainer
      renderFailure={renderGenericFailure}
      renderLoading={() => loaders[type]}
      {...params}
    />
  );
};

export default RelayContainer;
