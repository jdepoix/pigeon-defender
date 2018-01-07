const AWS = require('aws-sdk');
const iotData = new AWS.IotData({
  endpoint: 'a1w994n28goxho.iot.eu-central-1.amazonaws.com',
  apiVersion: '2015-05-28'
});
const RoutingEventHandler = require('./routing-event-handler');


module.exports = class SensorEventHandler extends RoutingEventHandler {
  handle() {
    if (!this.messageContext.groupData.active) {
      return Promise.resolve();
    }

    return iotData.publish({
      // TODO where/what to pub?!
      topic: 'actors/123',
      payload: 'test'
    }).promise();
  }
};
