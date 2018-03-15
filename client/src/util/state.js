/**
 * Create a random string
 * @param b Base-2 to base-36
 * @param l Length of the requested string
 * @returns {string}
 */
const randomString = (b, l) => (Math.random().toString(b).substring(2, l ? l + 2 : l));

/**
 * Create random uppercase string by matching a binary random string.
 * When character equals '1', turn original character into uppercase,
 * otherwise just keep it as is.
 * @param s Original string to randomly uppercase
 * @returns {string}
 */
const randomUpperCase = s => {
  const zz = s.split('');
  return randomString(2, s.length).split('').reduce((a, c, i) => {
    const z = zz[i];
    return a.concat(c === '1' ? z.toUpperCase() : z);
  }, []).join('');
};

/**
 * Create a random state string
 * @returns {string}
 */
const state = () => (randomUpperCase(`${randomString(36)}${randomString(36)}`));

module.exports = state;
