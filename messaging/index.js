'use strict';

const MessagingEventManager = require('./messaging-event-manager');
const SensorEventHandler = require('./sensor-event-handler');
const CircuitBreakerEventHandler = require('./circuit-breaker-event-handler');

module.exports.sensors = MessagingEventManager.provide(SensorEventHandler);
module.exports.circuitBreakers = MessagingEventManager.provide(CircuitBreakerEventHandler);
