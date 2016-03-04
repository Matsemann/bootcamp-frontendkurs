var fs = require('fs');
var http = require('http');
var path = require('path');
var url = require('url');
var qs = require('querystring');

var Flickr = require('node-flickr');

var flickr = new Flickr({'api_key': 'ea97a6690f90a628b60e2fd79012c74c'});

var siteRoot = path.join(__dirname, '..', '..', 'solutions', 'final');
var flickerCache = {};

function fetchFlickerContent(tag) {
  return new Promise(function(resolve, reject) {
    flickr.get('photos.search', {'tags': tag, 'per_page': 15}, function(err, result) {
      err ? reject(err) : resolve(result);
    });
  });
}

function getFlickerContent(tag) {
  if(flickerCache[tag]) {
    return Promise.resolve(flickerCache[tag]);
  } else {
    return fetchFlickerContent(tag).then(content => flickerCache[tag] = content);
  }
}

function transformResult(result) {
  return result.photos.photo.map(function(r) {
    return {
      url: `https://farm${r.farm}.staticflickr.com/${r.server}/${r.id}_${r.secret}.jpg`,
      title: r.title
    };
  });
}

function handleError(err, response) {
  console.error(err);

  response.statusCode = 500;
  response.write(err);
  response.end();
}

function handleRequest(request, response) {

  if(/^\/sok\?/.test(request.url)) {
    var tag = url.parse(request.url, true).query.tag;

    getFlickerContent(tag)
      .then(transformResult)
      .then(function(result) {
        response.setHeader('Content-Type', 'application/json');
        response.write(JSON.stringify(result));
        response.end();
      })
      .catch(err => handleError(err, response));

  } else {

    var filePath = path.join(siteRoot, request.url);
    var fallbackPath = path.join(siteRoot, 'index.html');

    fs.stat(filePath, (err, stat) => {
      if(err || !stat.isFile()) {
        filePath = fallbackPath;
      }
      fs.createReadStream(filePath).pipe(response);
    });
  }
}

var server = http.createServer(handleRequest);

server.listen(5000);
console.log('Server started on http://localhost:5000');
