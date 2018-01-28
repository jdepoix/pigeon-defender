const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const MessagingEventHandler = require('./messaging-event-handler');


module.exports = class CircuitBreakerEventHandler extends MessagingEventHandler {
  handle() {
    return dynamoDb.update({
      TableName: 'PigeonDefender.Groups',
      Key: {id: this.messageContext.groupData.id},
      UpdateExpression: 'set active = :active',
      ExpressionAttributeValues: {
        ':active': this.messageContext.payload.hasOwnProperty('active')
          ? this.messageContext.payload.active : !this.messageContext.groupData.active
      }
    }).promise();
  }
};
