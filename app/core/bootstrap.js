/*global angular*/
'use strict';

require('./vendor.js')(); // run an empty function

require('../styles/main.css');
require('../styles/graph.css');

import appModule from '../app';

angular.element(document).ready(function () {
  angular.bootstrap(document, [appModule.name], {
    strictDi: true
  });
});
