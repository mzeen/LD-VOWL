'use strict';

settingsCtrl.$inject = ['$log', '$cookies', 'PREFIX', 'PROPERTY_BLACKLIST', 'CLASS_BLACKLIST', 'RequestConfig', 'Nodes',
  'Properties', 'Requests', 'ClassExtractor', 'RelationExtractor'];


function settingsCtrl($log, $cookies, PREFIX, PROPERTY_BLACKLIST, CLASS_BLACKLIST, RequestConfig, Nodes, Properties,
                      Requests, ClassExtractor, RelationExtractor) {

  /* jshint validthis: true */
  var vm = this;

  const cookiePrefix = 'ldvowl_';

  //TODO move default settings into a constant
  vm.currentLanguage = RequestConfig.getLabelLanguage() || 'en';
  vm.currentLimit = RequestConfig.getLimit();

  vm.availableLanguages = [
    {id: 'en', name: 'English'},
    {id: 'de', name: 'German'}
  ];

  vm.propsOrdered = true;

  vm.propertyBlacklistInput = '';
  vm.classBlacklistInput = '';

  vm.separator = ', \n';

  vm.enabled = [];

  vm.initialize = function () {
    var classItems = ClassExtractor.getBlacklist();
    var propertyItems = RelationExtractor.getBlacklist();

    vm.propsOrdered = RequestConfig.getPropertiesOrdered();

    let cookieFlag = [];
    cookieFlag['RDF'] = $cookies.get(cookiePrefix + 'blacklist_rdf');
    cookieFlag['RDFS'] = $cookies.get(cookiePrefix + 'blacklist_rdfs');
    cookieFlag['OWL'] = $cookies.get(cookiePrefix + 'blacklist_owl');
    cookieFlag['SKOS'] = $cookies.get(cookiePrefix + 'blacklist_skos');

    vm.enabled['RDF'] =  (cookieFlag['RDF'] !== undefined) ? (cookieFlag['RDF'] === 'true') : true;
    vm.enabled['RDFS'] =  (cookieFlag['RDFS'] !== undefined) ? (cookieFlag['RDFS'] === 'true') : true;
    vm.enabled['OWL'] =  (cookieFlag['OWL'] !== undefined) ? (cookieFlag['OWL'] === 'true') : true;
    vm.enabled['SKOS'] =  (cookieFlag['SKOS'] !== undefined) ? (cookieFlag['SKOS'] === 'true') : false;

    vm.classBlacklistInput = classItems.join(vm.separator);
    vm.propertyBlacklistInput = propertyItems.join(vm.separator);
  };

  vm.updateLabelLanguage = function () {
    RequestConfig.setLabelLanguage(vm.currentLanguage);
    $log.debug(`[Settings] Changed label language to "${vm.currentLanguage}".`);
  };

  vm.updatePropsOrdered = function () {
    RequestConfig.setPropertiesOrdered(vm.propsOrdered);
  };

  vm.updateList = function () {
    vm.restoreDefaults();
    vm.save();
  };

  /**
   * Save Blacklists for RDFS and OWL.
   */
  vm.save = function () {

    var input = vm.propertyBlacklistInput.replace(/(\r\n|\n|\r|\s)/gm,'');
    var items = input.split(',');

    // update blacklist in extractor
    RelationExtractor.setBlacklist(items);

    // delete all loaded data
    Nodes.clearAll();
    Properties.clearAll();
    Requests.clear();

    RequestConfig.setLimit(vm.currentLimit);

    const rdfState = (vm.enabled['RDF']) ? 'true' : 'false';
    const rdfsState = (vm.enabled['RDFS']) ? 'true' : 'false';
    const owlState = (vm.enabled['OWL']) ? 'true' : 'false';
    const skosState = (vm.enabled['SKOS']) ? 'true' : 'false';

    $cookies.put(cookiePrefix + 'blacklist_rdf', rdfState);
    $cookies.put(cookiePrefix + 'blacklist_rdfs', rdfsState);
    $cookies.put(cookiePrefix + 'blacklist_owl', owlState);
    $cookies.put(cookiePrefix + 'blacklist_skos', skosState);
  };

  /**
   * Reset all settings to its default values.
   */
  vm.restoreDefaults = function () {
    let propertyItems = [];
    for (let pVoc in PROPERTY_BLACKLIST) {
      if (vm.enabled[pVoc] && PROPERTY_BLACKLIST.hasOwnProperty(pVoc)) {
        for (let i = 0; i < PROPERTY_BLACKLIST[pVoc].length; i++) {
          propertyItems.push(PREFIX[pVoc] + PROPERTY_BLACKLIST[pVoc][i]);
        }
      }
    }
    vm.propertyBlacklistInput = propertyItems.join(vm.separator);

    let classItems = [];
    for (let cVoc in CLASS_BLACKLIST) {
      if (vm.enabled[cVoc] && CLASS_BLACKLIST.hasOwnProperty(cVoc)) {
        for (let i = 0; i < CLASS_BLACKLIST[cVoc].length; i++) {
          classItems.push(PREFIX[cVoc] + CLASS_BLACKLIST[cVoc][i]);
        }
      }
    }
    vm.classBlacklistInput = classItems.join(vm.separator);
  };

  vm.initialize();

}

export default settingsCtrl;
