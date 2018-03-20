const AWS = require('aws-sdk');
const dbClient = new AWS.DynamoDB.DocumentClient();

const userTable = process.env.USER_TABLE;

/**
 * Retrieve single item based on id
 * @param id
 */
const getItem = id => new Promise((resolve, reject) => {
  const params = {
    TableName: userTable,
    Key: {
      id,
    }
  };
  console.log(JSON.stringify(params, null, 3));
  dbClient.get(params, (err, data) => {
    if (err) return reject(err);

    return resolve(data.Item);
  });
});

/**
 * Put a single item in table
 * @param item
 */
const putItem = item => new Promise((resolve, reject) => {
  const params = {
    TableName: userTable,
    Item: item,
  };
  console.log(JSON.stringify(params, null, 3));
  dbClient.put(params, (err, data) => {
    if (err) return reject(err);

    return resolve(item);
  });
});

module.exports = {
  getItem,
  putItem,
};
