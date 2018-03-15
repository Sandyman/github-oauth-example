const crypto = require('crypto');
const secureCmp = require('secure-compare');

/**
 * Determine that signature is valid
 * @param secret
 * @param signature
 * @param body
 */
const isValid = (secret, signature, body) => {
    if (!secret || !signature || !body) return true;

    const hmac = crypto.createHmac('sha1', secret);
    hmac.update(JSON.stringify(body), 'utf-8');
    const expectedSignature = `sha1=${hmac.digest('hex')}`;
    return secureCmp(signature, expectedSignature);
};

/**
 * Entry point for this module
 */
module.exports = isValid;
