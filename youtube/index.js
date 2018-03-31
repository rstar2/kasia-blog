const fs = require('fs');
const ytdl = require('ytdl');
// https://github.com/fent/node-ytdl-core

const options = { filter: (format) => format.container === 'mp4' };
const url = 'https://www.youtube.com/watch?v=eMT8GLfRizU';
const id = 'eMT8GLfRizU';

ytdl.getInfo(id).then(info => {
	return ytdl.downloadFromInfo(info, options);
});
ytdl(url, options)
  .pipe(fs.createWriteStream('video.mp4'));
