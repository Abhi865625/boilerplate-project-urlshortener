require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient } = require('mongodb');
const dns = require("dns");
const urlparser = require('url');

const client = new MongoClient(process.env.DB_URL);
const db = client.db("urlShortener");
const urls = db.collection("urls");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // Use express.json() middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function (req, res) {
  console.log(req.body);
  const url = req.body.url;
  const hostname = urlparser.parse(url).hostname;

  dns.lookup(hostname, async (err, address) => {
    if (err || !address) {
      res.json({ error: "Invalid URL" });
    } else {
      const urlCount = await urls.countDocuments({});
      const urlDoc = {
        url,
        short_url: urlCount
      };
      const result = await urls.insertOne(urlDoc);
      console.log(result);
      res.json({ original_url: url, short_url: urlCount });
    }
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
