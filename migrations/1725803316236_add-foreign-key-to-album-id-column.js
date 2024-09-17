exports.up = (pgm) => {
  pgm.addConstraint('songs', 'fk_songs.album_id_album.album_id', 'FOREIGN KEY(album_id) REFERENCES albums(album_id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.sql("DELETE FROM songs WHERE album_id = 'NULL");
};
