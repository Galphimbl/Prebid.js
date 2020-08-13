(function() {
  var siteConfig = JSON.parse(document.currentScript.textContent || '{}');
  var AD_UNITS = JSON.parse("%%AD_UNITS%%");
  var PREBID_CDN = siteConfig.prebid_cdn || "%%PREBID_CDN%%";
  var PREBID_URL = siteConfig.prebid_url || "%%PREBID_URL%%"
  var PREBID_TIMEOUT = siteConfig.prebid_timeout || parseInt("%%PREBID_TIMEOUT%%");
  var PRICE_GRANULARITY = siteConfig.price_granularity || JSON.parse("%%PRICE_GRANULARITY%%");
  var adapters = Object.keys(
    AD_UNITS.reduce(function(obj, adUnit) {
      adUnit.bids.forEach(function(bid){
        obj[bid.bidder] = true;
      });
      return obj;
    }, {})
  ).sort();
  var analytics = ['admixer'].sort();
  var pbjs = window.pbjs = window.pbjs || {};
  pbjs.que = pbjs.que || [];
  var script = document.createElement('script');
  var prebidUrl = PREBID_URL ? PREBID_URL : (PREBID_CDN + "/prebid.js");
  script.src = prebidUrl + "?ba=" + adapters.join(",") + "&aa=" + analytics.join(",");
  document.head.appendChild(script);

  pbjs.que.push(function() {
    pbjs.enableAnalytics({
      provider: 'admixer',
      options: {options: true}
    });
    pbjs.setConfig({
      priceGranularity: PRICE_GRANULARITY
    });
    pbjs.requestBids({
      bidsBackHandler: sendAdserverRequest,
      timeout: PREBID_TIMEOUT,
      adUnits: AD_UNITS,
    });
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
