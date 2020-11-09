import {hook} from "../src/hook";
import {_each, logError, logInfo, logWarn} from "../src/utils";
import {getGlobal} from "../src/prebidGlobal";
export const initAdServer = hook('async', function ({
                                                      bidsBackHandler,
                                                      timeout,
                                                      adUnits,
                                                      auctionId,
                                                    } = {}) {
  logInfo('[AdServer]', 'Init', adUnits);
  _each(adUnits, function (adUnit) {
    waitNode(adUnit.code, function(node) {
      if (isVisible(node)) {
        request({
          bidsBackHandler,
          timeout,
          adUnits: [adUnit],
          auctionId,
        });
      } else {
        logWarn('[AdServer]', 'Node"' + JSON.stringify(adUnit) + '" is hidden')
      }
    });
  });
}, 'initAdServer');
$$PREBID_GLOBAL$$.initAdServer = initAdServer;

function isVisible(node) {
  return !isHidden(node);
}
function isHidden(node) {
  return node.offsetParent === null;
}
let requestAdUnits = [];
let timeoutID;
function request({
                   bidsBackHandler,
                   timeout,
                   adUnits,
                   auctionId,
                 } = {}) {
  requestAdUnits = requestAdUnits.concat(adUnits);
  if (timeoutID) {
    clearTimeout(timeoutID);
    timeoutID = null;
  }
  timeoutID = setTimeout(function() {
    logInfo('[AdServer]','requestBids', {
      bidsBackHandler: bidsBackHandler,
      timeout: timeout,
      adUnits: requestAdUnits,
      auctionId: auctionId,
    });
    getGlobal().requestBids({
      bidsBackHandler: bidsBackHandler,
      timeout: timeout,
      adUnits: requestAdUnits,
      auctionId: auctionId,
    });
    requestAdUnits = [];
    timeoutID = null;
  }, 16);
}
function waitNode(id, callback) {
  let node = document.getElementById(id);
  if (node) {
    callback(node);
  } else {
    const observer = new MutationObserver(function (mutationsList, observer) {
      node = document.getElementById(id);
      if (node) {
        callback(node);
        observer.disconnect();
      }
    });
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true
    });
  }
}

