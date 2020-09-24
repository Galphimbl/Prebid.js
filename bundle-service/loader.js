(function() {
  var siteConfig = JSON.parse(document.currentScript.textContent || "{}");
  var serverConfig = JSON.parse("%%LOADER_CONFIG%%");
  var AD_UNITS = serverConfig.ad_units;
  var PREBID_URL = siteConfig.prebid_url || serverConfig.prebid_url;
  var PREBID_TIMEOUT = siteConfig.prebid_timeout || serverConfig.prebid_timeout;
  var PREBID_MODULES = siteConfig.prebid_modules || serverConfig.prebid_modules || [];
  var PREBID_CONFIG = siteConfig.prebid_config || serverConfig.prebid_config || {};
  var AUCTION_ID = siteConfig.autcion_id || null
  var adapters = Object.keys(
    AD_UNITS.reduce(function(obj, adUnit) {
      adUnit.bids.forEach(function(bid){
        obj[bid.bidder] = true;
      });
      return obj;
    }, {})
  ).sort();
  var modules = PREBID_MODULES.sort().concat(['express']);
  var analytics = ['admixer'].sort();
  var pbjs = window.pbjs = window.pbjs || {};
  pbjs.que = pbjs.que || [];
  var script = document.createElement('script');
  script.src = PREBID_URL + "?ba=" + adapters.join(",") + "&aa=" + analytics.join(",") + "&pm=" + modules.join(",");
  document.head.appendChild(script);

  pbjs.que.push(function() {
    pbjs.enableAnalytics({
      provider: 'admixer',
      options: {options: true}
    });
    pbjs.setConfig(Object.assign({}, PREBID_CONFIG));
    if (AUCTION_ID) {
      pbjs.requestBids({
        bidsBackHandler: sendAdserverRequest,
        timeout: PREBID_TIMEOUT,
        adUnits: AD_UNITS,
        auctionId: AUCTION_ID,
      });
    } else {
      pbjs.requestBids({
        bidsBackHandler: sendAdserverRequest,
        timeout: PREBID_TIMEOUT,
        adUnits: AD_UNITS,
      });
    }
  });

  function sendAdserverRequest() {
    if (pbjs.adserverRequestSent) return;
    pbjs.adserverRequestSent = true;
    googletag.cmd.push(function () {
      pbjs.que.push(function () {
        pbjs.setTargetingForGPTAsync();
        googletag.pubads().refresh();
      });
    });
  }

  // setTimeout(function () {
  //   sendAdserverRequest();
  // }, FAILSAFE_TIMEOUT);
})();
