const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const db = new sqlite3.Database('data.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original_url TEXT NOT NULL,
    tags_path TEXT NOT NULL UNIQUE
  )`);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

function isValidUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function sanitizeTags(tags) {
  return tags.map(tag => tag.replace(/\//g, '∕'));
}

app.post('/shorten', (req, res) => {
  let { originalUrl, tags } = req.body;

  if (!isValidUrl(originalUrl)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  if (!Array.isArray(tags)) {
    return res.status(400).json({ error: 'Tags must be an array' });
  }

  if (tags.length === 0 || tags.length > 5) {
    return res.status(400).json({ error: 'Tags count must be between 1 and 5' });
  }

  tags = sanitizeTags(tags);
  const basePath = tags.join('/');

  const findUniquePath = (base, cb) => {
    let current = base;
    let suffix = 1;
    const check = () => {
      db.get('SELECT 1 FROM urls WHERE tags_path = ?', [current], (err, row) => {
        if (err) return cb(err);
        if (row) {
          current = `${base}/${suffix++}`;
          check();
        } else {
          cb(null, current);
        }
      });
    };
    check();
  };

  findUniquePath(basePath, (err, finalPath) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    db.run('INSERT INTO urls (original_url, tags_path) VALUES (?, ?)', [originalUrl, finalPath], function(err) {
      if (err) return res.status(500).json({ error: 'Database insert error' });
      const encoded = finalPath.split('/').map(encodeURIComponent).join('/');
      const shortUrl = `${req.protocol}://${req.get('host')}/${encoded}`;
      res.json({ shortUrl });
    });
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/*', (req, res) => {
  const urlPath = req.path.slice(1);
  if (!urlPath) return res.status(404).send('Not found');
  db.get('SELECT original_url FROM urls WHERE tags_path = ?', [urlPath], (err, row) => {
    if (err) return res.status(500).send('Database error');
    if (row) return res.redirect(302, row.original_url);
    res.status(404).send('Not found');
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
