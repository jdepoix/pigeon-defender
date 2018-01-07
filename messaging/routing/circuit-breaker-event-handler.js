const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const RoutingEventHandler = require('./routing-event-handler');


module.exports = class CircuitBreakerEventHandler extends RoutingEventHandler {
  handle() {
    
  }
};
