'use strict';

const Router = require('./routing/router');

module.exports.routing = (event, context, callback) => {
  Router.routeMessage(event.clientId).then(
    () => callback(null, null)
  ).catch(
    error => callback(error, null)
  );
};
