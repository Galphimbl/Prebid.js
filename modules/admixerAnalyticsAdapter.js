// import {ajax} from 'src/ajax';
import adapter from '../src/AnalyticsAdapter.js';
// import CONSTANTS from 'src/constants.json';
import adaptermanager from '../src/adapterManager.js';
import {logInfo} from '../src/utils.js';
import {getHook} from "../src/hook";
import {requestBidsHook} from "./userId";
import {getGlobal} from "../src/prebidGlobal";
import {auctionManager} from "../src/auctionManager";
import {createTrackPixelHtml, logError} from "../src/utils";

const analyticsType = 'endpoint';
const url = 'https://inv-nets.admixer.net/hb_analytics.aspx';
/**
 * {
    track: _track,
    enqueue: _enqueue,
    enableAnalytics: _enable,
    disableAnalytics: _disable,
    getAdapterType: () => analyticsType,
    getGlobal: () => global,
    getHandler: () => handler,
    getUrl: () => url
  }
 */
let admixerAnalytics = Object.assign(adapter({url, analyticsType}), {
  // track({eventType, args}) {
  //   logInfo('[TRACK]', eventType, args, admixerAnalytics.context);
  //   return {eventType, args};
  // }
});

// save the base class function
admixerAnalytics.originEnableAnalytics = admixerAnalytics.enableAnalytics;

// override enableAnalytics so we can get access to the config passed in from the page
admixerAnalytics.enableAnalytics = function (config) {
  // initOptions = config.options;
  admixerAnalytics.originEnableAnalytics(config); // call the base class function

  // HOOKS
// addBidResponse
// bidsBackCallback
// registerAdserver
// validateGdprEnforcement
// checkAdUnitSetup
// getBids
//   getGlobal().requestBids.before(function (fn, a, b, c) {
//     fn.call(this)
//   });
  getHook('addBidResponse').before(function(fn, adUnitCode, bid) {
    if (!bid) {
      return fn.call(this, adUnitCode);
    }
    // let bidder = bid.bidderCode || bid.bidder;
    // let requestId = bid.requestId;
    let bidRequest = findRequestForBid(bid);
    bid.ad = `${createTrackPixelFromObject({
      eventType: 'bidView',
      args: {
        ...bidRequest,
        cpm: bid.originalCpm,
        currency: bid.originalCurrency
      },
    })}${bid.ad}`;
    logInfo('[BID_REQUEST]', bidRequest, bid);
    fn.call(this, adUnitCode, bid);
  }, 100);
};

adaptermanager.registerAnalyticsAdapter({
  adapter: admixerAnalytics,
  code: 'admixer'
});
export default admixerAnalytics;

function findRequestForBid(bid) {
  let bidder = bid.bidderCode || bid.bidder;
  let requestId = bid.requestId;
  const requestedBid = auctionManager
    .getBidsRequested()
    .reduce((a, b) => a.concat(b.bids), [])
    .find((_bid) => _bid.bidder === bidder && _bid.bidId === requestId)
  ;
  if (!requestedBid) {
    logError(`Could not find requestedBid for bidder "${bidder}" with requestId "${requestId}"`);
  }
  return requestedBid;
}

function createTrackPixelFromObject(obj) {
  return createTrackPixelHtml(`${url}?${JSON.stringify(obj)}`)
}
