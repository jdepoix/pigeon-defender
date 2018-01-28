const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();


module.exports = class MessagingEventHandler {
  static provide(eventHandlerClass) {
    return (event, context, callback) => {
      MessagingEventHandler._getMessageContext(event.clientId).then(
        (messageContext) => {
          messageContext.payload = event;
          return new eventHandlerClass(messageContext).handle();
        }
      ).then(
        () => callback(null, null)
      ).catch(
        error => callback(error, null)
      )
    }
  }

  static _getMessageContext(clientId) {
    return new Promise((resolve, reject) => {
      dynamoDb.get({
        TableName: 'PigeonDefender.Devices',
        Key: {id: clientId}
      }).promise().then(deviceData => {
        return dynamoDb.get({
          TableName: 'PigeonDefender.Groups',
          Key: {id: deviceData.Item.groupId}
        }).promise().then(groupData => resolve({
          deviceData: deviceData.Item,
          groupData: groupData.Item
        }))
      }).catch(error => reject(error));
    });
  }
}
