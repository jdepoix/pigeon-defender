const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const RoutingEventHandler = require('./routing-event-handler');


module.exports = class CircuitBreakerEventHandler extends RoutingEventHandler {
  handle() {
    return dynamoDb.update({
      TableName: 'PigeonDefender.Groups',
      Key: {id: this.messageContext.groupData.id},
      UpdateExpression: 'set active = :active',
      ExpressionAttributeValues: {':active': !this.messageContext.groupData.active}
    }).promise();
  }
};
