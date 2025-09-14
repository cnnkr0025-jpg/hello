const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const db = new sqlite3.Database(path.join(__dirname, 'data.db'));

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS urls (path TEXT PRIMARY KEY, url TEXT NOT NULL)');
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function sanitizeTag(tag) {
  return tag.replace(/\//g, '\u2215'); // replace '/' with '∕'
}

function encodeTags(tags) {
  return tags.map(t => encodeURIComponent(sanitizeTag(t)));
}

app.post('/api/shorten', (req, res) => {
  const { url, tags } = req.body || {};
  if (!url || !Array.isArray(tags)) {
    return res.status(400).json({ error: 'url and tags required' });
  }
  if (tags.length === 0 || tags.length > 5) {
    return res.status(400).json({ error: 'tags must be 1-5 items' });
  }
  let parsed;
  try {
    parsed = new URL(url);
  } catch (e) {
    return res.status(400).json({ error: 'invalid url' });
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return res.status(400).json({ error: 'protocol not allowed' });
  }
  const encodedTags = encodeTags(tags);
  const basePath = encodedTags.join('/');
  let finalPath = basePath;
  function insertPath(pathToTry, cb, counter = 0) {
    db.get('SELECT 1 FROM urls WHERE path = ?', pathToTry, (err, row) => {
      if (err) return cb(err);
      if (row) {
        counter += 1;
        return insertPath(`${basePath}/${counter}`, cb, counter);
      } else {
        db.run('INSERT INTO urls(path, url) VALUES (?,?)', pathToTry, url, (err2) => {
          if (err2) return cb(err2);
          cb(null, pathToTry);
        });
      }
    });
  }
  insertPath(finalPath, (err, storedPath) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'internal error' });
    }
    const shortUrl = `${req.protocol}://${req.get('host')}/${storedPath}`;
    res.json({ shortUrl });
  });
});

app.get('*', (req, res) => {
  // skip API routes
  if (req.path.startsWith('/api')) return res.status(404).end();
  const rawSegments = req.path.split('/').filter(Boolean);
  const encodedSegments = rawSegments.map(encodeURIComponent);
  const lookupPath = encodedSegments.join('/');
  db.get('SELECT url FROM urls WHERE path = ?', lookupPath, (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal error');
    }
    if (!row) {
      return res.status(404).send('Not found');
    }
    res.redirect(302, row.url);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
