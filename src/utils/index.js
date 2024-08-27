const albumIdMapDbToId = ({ album_id }) => ({
  albumId: album_id,
});

const songIdMapDbToId = ({ song_id }) => ({
  songId: song_id,
});

const albumMapDBToModel = ({ album_id, name, year }) => ({
  id: album_id,
  name,
  year,
});

const songHalfMapDbToModel = ({ song_id, title, performer }) => ({
  id: song_id,
  title,
  performer,
});

const songMapDBToModel = ({
  song_id,
  title,
  year,
  genre,
  performer,
  duration,
  album_id,
}) => ({
  id: song_id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId: album_id,
});

module.exports = {
  albumMapDBToModel,
  songHalfMapDbToModel,
  songMapDBToModel,
  albumIdMapDbToId,
  songIdMapDbToId,
};
