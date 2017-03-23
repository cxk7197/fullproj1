const crypto = require('crypto');

const mountains = {};


let etag = crypto.createHash('sha1').update(JSON.stringify(mountains));
let digest = etag.digest('hex');

// takes request, response, status code and object to send
const respondJSON = (request, response, status, object) => {
  const headers = {
    'Content-Type': 'application/json',
    etag: digest,
  };

  // send response with json object
  response.writeHead(status, headers);
  response.write(JSON.stringify(object));
  response.end();
};

// function to respond without json body
// takes request, response and status code
const respondJSONMeta = (request, response, status) => {
  const headers = {
    'Content-Type': 'application/json',
    etag: digest,
  };

  response.writeHead(status, headers);
  response.end();
};

// return mountain object as JSON
const getMountains = (request, response) => {
  const responseJSON = { mountains };

  if (request.headers['if-none-match'] === digest) {
    return respondJSONMeta(request, response, 304);
  }

  return respondJSON(request, response, 200, responseJSON);
};

const getMountainsMeta = (request, response) => {
  if (request.headers['if-none-match'] === digest) {
    return respondJSONMeta(request, response, 304);
  }

  return respondJSONMeta(request, response, 200);
};

const addMountain = (request, response, body) => {
  console.log(body);
  const responseJSON = { message: 'Name and age are both required.' };
  console.log(responseJSON);


  // check to make sure we have both fields
  // We might want more validation than just checking if they exist


  if (!body.name || !body.height || !body.length || !body.difficulty || !body.rating) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 201;

  if (mountains[body.name]) {
    responseCode = 204;
  } else {
    mountains[body.name] = {};
  }

  mountains.name = body.name;
  mountains.height = body.height;
  mountains.length = body.length;
  mountains.difficulty = body.difficulty;
  mountains.rating = body.rating;


  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';

    etag = crypto.createHash('sha1').update(JSON.stringify(mountains));
    digest = etag.digest('hex');

    return respondJSON(request, response, responseCode, responseJSON);
  }

  return respondJSONMeta(request, response, responseCode);
};

const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you looking for was not found.',
    id: 'notFound',
  };

  respondJSON(request, response, 404, responseJSON);
};

const notFoundMeta = (request, response) => {
  respondJSONMeta(request, response, 404);
};

module.exports = {
  getMountains,
  getMountainsMeta,
  addMountain,
  notFound,
  notFoundMeta,
};
