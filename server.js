const http = require('node:http');
const port = 3001;

let movies = [
  { id: 1, title: "Wild Is the Wind", year: 2022, director: "Fabian Medea" },
  { id: 2, title: "I Am All Girls", year: 2001, director: "Donovan Marsh" },
  { id: 3, title: "Lobola Man", year: 2024, director: "Thabang Moleya" }
];

let series = [
  { id: 1, title: "Blood & Water", year: 2020, creator: "Nosipho Dumisa", season: 4 },
  { id: 2, title: "Queen Sono", year: 2020, creator: "Kagiso Lediga", season: 1 },
  { id: 3, title: "Kings of Jo'Burg", year: 2020, creator: "Shona Ferguson", season: 2 }
];

let songs = [
  { id: 1, title: "Water", year: 2023, artist: "Tyla" },
  { id: 2, title: "Imithandazo", year: 2024, artist: "Kabza De Small" },
  { id: 3, title: "Umbayimbayi", year: 2023, artist: "Inkabi Zezwe" }
];

function getData(url) {
  if (url === '/movies') return movies;
  if (url === '/series') return series;
  if (url === '/songs') return songs;
  return null;
}

function setData(url, data) {
  if (url === '/movies') movies = data;
  if (url === '/series') series = data;
  if (url === '/songs') songs = data;
}

const server = http.createServer((req, res) => {
  const { url, method } = req;
  let data = getData(url);

  if (!data) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: '404 Not Found' }));
    return;
  }

  let body = '';
  req.on('data', chunk => body += chunk);

  req.on('end', () => {
    res.writeHead(200, { 'Content-Type': 'application/json' });

    if (req.method === 'GET') {
      res.end(JSON.stringify(data));
    } else if (req.method === 'POST') {
      const newItem = JSON.parse(body);
      newItem.id = data.length ? data[data.length - 1].id + 1 : 1;
      data.push(newItem);
      setData(url, data);
      res.end(JSON.stringify(data));
    } else if (req.method === 'PUT') {
      const updatedItem = JSON.parse(body);
      const index = data.findIndex(item => item.id === updatedItem.id);
      if (index !== -1) {
        data[index] = updatedItem;
        setData(url, data);
        res.end(JSON.stringify(data));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ message: 'Item not found' }));
      }
    } else if (req.method === 'DELETE') {
      const { id } = JSON.parse(body);
      const filteredData = data.filter(item => item.id !== id);
      setData(url, filteredData);
      res.end(JSON.stringify(filteredData));
    } else {
      res.writeHead(405);
      res.end(JSON.stringify({ message: 'Method not permitted' }));
    }
  });
});

server.listen(port, '0.0.0.0', error => {
  if (error) {
    console.log('Something went wrong:', error);
  } else {
    console.log(`Mock Media Server running on http://localhost:${port}`);
  }
});
