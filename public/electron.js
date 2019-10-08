const express = require('express');
const formidableMiddleware = require('express-formidable');

var app = express();

app.use(formidableMiddleware());

app.post('/upload', (req, res) => {
  req.fields; // contains non-file fields
  req.files; // contains files
});

// const http = require('http');

// const port = process.env.PORT || 3000;

// const server = http.createServer((req, res) => {
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'text/html');
//   res.end('<h1>Hello World.</h1>');
// });

// server.listen(port,() => {
//   console.log(`Server running at port `+port);
// });
