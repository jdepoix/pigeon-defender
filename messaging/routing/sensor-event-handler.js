const AWS = require('aws-sdk');
const iotData = new AWS.IotData({
  endpoint: 'a1w994n28goxho.iot.eu-central-1.amazonaws.com',
  apiVersion: '2015-05-28'
});
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const RoutingEventHandler = require('./routing-event-handler');
const DeviceType = require('./device-type');


module.exports = class SensorEventHandler extends RoutingEventHandler {
  handle() {
    if (!this.messageContext.groupData.active) {
      return Promise.resolve();
    }

    return this._getActors().then(actorsData =>
      Promise.all(actorsData.Items.map(actorData => {
        console.log('publishing to topic: actors/' + actorData.id)
        return iotData.publish({
          topic: 'actors/' + actorData.id,
          payload: JSON.stringify({
            duration: actorData.duration || 10000,
            direction: actorData.direction || 1,
            speed: actorData.speed || 40,
          })
        }).promise()
      }))
    );
  }

  _getActors() {
    return dynamoDb.query({
      TableName: 'PigeonDefender.Devices',
      IndexName: 'groupId-index',
      FilterExpression: '#DeviceType = :deviceType',
      KeyConditionExpression: 'groupId = :groupId',
      ExpressionAttributeNames: {
        '#DeviceType': 'type'
      },
      ExpressionAttributeValues: {
        ':deviceType': DeviceType.ACTOR,
        ':groupId': this.messageContext.groupData.id
      }
    }).promise();
  }
};
