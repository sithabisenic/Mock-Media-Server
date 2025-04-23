const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'data', 'db.json');

function initDataFile() {
  const dataDir = path.dirname(dataPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }
  if (!fs.existsSync(dataPath)) {
    const initialData = { movies: [], series: [], songs: [] };
    fs.writeFileSync(dataPath, JSON.stringify(initialData, null, 2));
  }
}

function readData() {
  const rawData = fs.readFileSync(dataPath);
  return JSON.parse(rawData);
}

function writeData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

module.exports = { initDataFile, readData, writeData };
