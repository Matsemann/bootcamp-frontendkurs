function getPhotos(tag) {
  return fetch('/sok?tag=' + tag).then(function(resp) {
    return resp.json();
  });
}

function renderImages(data) {
  var html = '';

  for (var i = 0; i < data.length; i++) {
    var img = data[i];
    html += `
      <figure>
        <img src="${img.url}" />
        <figcaption>${img.title}</figcaption>
      </figure>
    `;
  }

  return html;
}

function router() {
  var url = window.location.pathname;

  if (url == "/") { return; }

  var urlDeler = url.split('/');
  var tag = urlDeler[1];

  getPhotos(tag).then(function(data) {
    var html = renderImages(data);
    document.querySelector('main').innerHTML = html;
  });
}

document.querySelector('form').addEventListener('submit', function(event) {
  event.preventDefault();
  var tag = event.target.querySelector('input').value;
  history.pushState(null, '', tag);
  router();
});


window.addEventListener('popstate', router);

router();


