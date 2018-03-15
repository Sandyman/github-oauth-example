const AWS = require('aws-sdk');
const request = require('request');
const validSignature = require('./x-hub-signature');

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const webhookSecret = process.env.WEBHOOK_SECRET;

const accessUri = 'https://github.com/login/oauth/access_token';

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

  console.log('Getting access token...');
  return requestAccessToken(code, state)
    .then(body => {
      const accessToken = body.access_token;

      console.log(`Get access token: ${accessToken}`);

        return cb(null, {
          statusCode: 200,
          body: JSON.stringify({
            token: body.access_token,
          }),
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
