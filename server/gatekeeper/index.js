const jwt = require('jsonwebtoken');
const moment = require('moment');
const request = require('request');
const users = require('./lib/users');
const validSignature = require('./x-hub-signature');

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const jwtSecret = process.env.JWT_SECRET;
const webhookSecret = process.env.WEBHOOK_SECRET;

const accessUri = 'https://github.com/login/oauth/access_token';
const userUri = 'https://api.github.com/user';

/**
 * Request access token
 * @param code
 * @param state
 */
const requestAccessToken = (code, state) => new Promise((resolve, reject) => {
  const uri = [
    `${accessUri}`,
    `?client_id=${clientId}`,
    `&client_secret=${clientSecret}`,
    `&code=${code}`,
    `&state=${state}`,
  ].join('');

  const options = {
    uri,
    json: true,
  };
  console.log(JSON.stringify(options, null, 2));
  return request.post(options, (err, response, body) => {
    if (err) return reject(err);
    if (response.statusCode && response.statusCode !== 200) {
      console.log(`Error: ${response.statusCode}: ${response.statusMessage}`);
      return reject(new Error(response.statusMessage));
    }

    return resolve(body);
  });
});

/**
 * Request user object
 * @param accessToken
 */
const requestUserObject = accessToken => new Promise((resolve, reject) => {
  const options = {
    uri: userUri,
    headers: {
      Authorization: `Token ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Sander Huijsen (sander.huijsen@gmail.com)',
    },
    json: true,
  };
  console.log(JSON.stringify(options, null, 2));
  return request.get(options, (err, response, body) => {
    if (err) return reject(err);
    if (response.statusCode && response.statusCode !== 200) {
      console.log(JSON.stringify(body, null, 3));
      console.log(`Error: ${response.statusCode}: ${response.statusMessage}`);
      return reject(new Error(response.statusMessage));
    }

    console.log(JSON.stringify(body, null, 3));
    return resolve(body);
  })
});

/**
 * Create a response
 * @param sc
 */
const response = sc => ({
  statusCode: sc,
  body: sc.toString(),
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Authenticate using code and client secret
 * @param event
 * @param ctx
 * @param cb
 * @returns {*}
 */
const authenticate = (event, ctx, cb) => {
  console.log(JSON.stringify(event, null, 3));

  if (!event.queryStringParameters) {
    console.log('Did not get code or state. Abort.');
    return cb(null, response(400));
  }

  const { code, state } = event.queryStringParameters;
  if (!code || !state) {
    console.log('Did not get code or state. Abort.');
    return cb(null, response(400));
  }

  let accessToken;

  console.log('Getting access token...');
  return requestAccessToken(code, state)
    .then(body => {
      accessToken = body.access_token;
      console.log(`Get access token: ${accessToken}`);
      return requestUserObject(accessToken);
    })
    .then(userObject => users.putItem({
      accessToken,
      id: userObject.id.toString(),
      email: userObject.email,
      username: userObject.login,
      fullname: userObject.name,
      avatarUrl: userObject.avatar_url,
    }))
    .then(user => {
      const claims = {
        iat: moment().unix(),
        sub: user.id,
        name: user.fullname,
      };
      const token = jwt.sign(claims, jwtSecret);
      return cb(null, {
        statusCode: 200,
        body: JSON.stringify({ token }),
        headers: {
          'Access-Control-Allow-Credentials': true,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
          'Content-Type': 'application/json'
        }
      })
    })
    .catch(e => {
      console.log(e);
      return cb(null, response(500))
    });
};

/**
 * Webhook callback for GitHub events
 * @param event
 * @param ctx
 * @param cb
 */
const webhook = (event, ctx, cb) => {
  console.log(JSON.stringify(event, null, 3));

  const sig = event.headers['X-Hub-Signature'];
  if (!sig) {
    console.log('No signature found.');
    return cb(null, response(400));
  }

  try {
    const body = JSON.parse(event.body);

    // Check X-Hub-Signature
    if (!validSignature(webhookSecret, sig, body)) {
      console.log('Invalid signature found.');
      return cb(null, response(400));
    }

    console.log(JSON.stringify(body, null, 3));

    return cb(null, response(200));
  } catch (e) {
    console.log(e);
    return cb(null, response(500));
  }
};

module.exports = {
  authenticate,
  webhook
};
