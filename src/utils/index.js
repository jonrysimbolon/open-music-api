/*const mapDBToModel = ({ id, title, body, tags, created_at, updated_at }) => ({
  id,
  title,
  body,
  tags,
  createdAt: created_at,
  updatedAt: updated_at,
});
*/

const albumIdMapDbToId = ({album_id}) => ({
  albumId: album_id
})

const songIdMapDbToId = ({song_id}) => ({
  songId: song_id
})

const albumMapDBToModel = ({ album_id, name, year }) => ({
  id: album_id,
  name,
  year,
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

module.exports = { albumMapDBToModel, songMapDBToModel, albumIdMapDbToId, songIdMapDbToId };
