const MediaUtil = {
  authorName(media) {
    return media && media.metadata
      ? media.metadata.author_name
      : media.domain;
  },
};

export default MediaUtil;
