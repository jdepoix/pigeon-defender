const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const SensorEventHandler = require('./sensor-event-handler');
const CircuitBreakerEventHandler = require('./circuit-breaker-event-handler');
const DeviceType = require('./device-type');


module.exports = class Router {
  static routeMessage(clientId) {
    console.log('start routing message for client: ' + clientId);

    return Router._getMessageContext(clientId).then(messageContext => {
      if (!Router._eventHandlerMapping.hasOwnProperty(messageContext.deviceData.type)) {
        return Promise.resolve();
      }
      return new Router._eventHandlerMapping[messageContext.deviceData.type](messageContext).handle();
    });
  }

  static _getMessageContext(clientId) {
    return new Promise((resolve, reject) => {
      dynamoDb.get({
        TableName: 'PigeonDefender.Devices',
        Key: {id: clientId}
      }).promise().then(deviceData =>
        dynamoDb.get({
          TableName: 'PigeonDefender.Groups',
          Key: {id: deviceData.Item.groupId}
        }).promise().then(groupData => resolve({
          deviceData: deviceData.Item,
          groupData: groupData.Item
        }))
      ).catch(error => reject(error));
    });
  }

  static get _eventHandlerMapping() {
    return {
      [DeviceType.SENSOR]: SensorEventHandler,
      [DeviceType.CIRCUIT_BREAKER]: CircuitBreakerEventHandler
    };
  }
};
