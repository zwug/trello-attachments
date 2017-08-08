const fs = require('fs');
const https = require('https');
const path = require('path');

const dirName = 'attachments';
const jsonFileUrl = process.argv[2];

if (!jsonFileUrl) {
  console.error('No source file specified');
  return;
}

if (!fs.existsSync(dirName)){
  console.log('fs.mkdirSync(dirName)');
  fs.mkdirSync(dirName);
}

const rawData = fs.readFileSync(jsonFileUrl, 'utf8');
const parsedData = JSON.parse(rawData, (key, value) => {
  if (key === 'attachment') {
    const filePath = path.join(__dirname, dirName, value['name']);
    downloadAttachment(value['url'], filePath, () => {
      console.log(`${value['name']} is downloaded`);
    });
  }
  return value;
});

function downloadAttachment(url, dest, cb) {
  const file = fs.createWriteStream(dest);
  const request = https.get(url, (response) => {
    response.pipe(file);
    file.on('finish', () => {
      file.close(cb);
    });
  }).on('error', (err) => {
    fs.unlink(dest);
    if (cb) {
      cb(err.message);
    }
  });
};
