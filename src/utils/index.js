const albumIdMapDbToId = ({ album_id }) => ({
  albumId: album_id,
});

const songIdMapDbToId = ({ song_id }) => ({
  songId: song_id,
});

const albumMapDBToModel = ({
  album_id, name, year, cover,
}) => ({
  id: album_id,
  name,
  year,
  coverUrl: cover,
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

const playlistMapDbToModel = ({ id, name, owner }) => ({
  id,
  name,
  username: owner,
});

module.exports = {
  albumMapDBToModel,
  songHalfMapDbToModel,
  songMapDBToModel,
  albumIdMapDbToId,
  songIdMapDbToId,
  playlistMapDbToModel,
};
