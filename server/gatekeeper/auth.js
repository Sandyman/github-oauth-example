const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
  console.log('Environment variable JWT_SECRET with secret key is required');
}

const secret = new Buffer(process.env.JWT_SECRET);
const region = process.env.REGION || '*';
const apiId = process.env.API_ID || '*';
const stageId = process.env.STAGE_ID || '*';
const method = process.env.METHOD || '*';
const path = process.env.URL_PATH || '*';

const policy = {
  Version: '2012-10-17',
  Statement: {
    Action: 'execute-api:Invoke',
    Effect: 'Allow',
    Resource: `arn:aws:execute-api:${region}:*:${apiId}/${stageId}/${method}/${path}`,
  },
};

/**
 * Authoriser
 * @param event
 * @param context
 * @param callback
 */
module.exports.authoriser = (event, context, callback) => {
  console.log(JSON.stringify(event, null, 3));

  const authToken = event.authorizationToken;

  if (event.type.toUpperCase() !== 'TOKEN') return callback('Authorisation not of type TOKEN');
  if (!authToken) return callback('No Authorization header');
  if (!authToken.startsWith('Bearer')) return callback('Invalid authorization header');

  const token = authToken.replace(/^Bearer\s*/i, '');
  return jwt.verify(token, secret, (err, payload) => {
    if (!err && payload) {
      return callback(null, { principalId: payload.sub, policyDocument: policy });
    }
    return callback(err);
  });
};
