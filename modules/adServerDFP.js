import * as utils from '../src/utils.js';
import {loadExternalScript} from "../src/adloader";

export const MODULE_NAME = 'adServerDFP';
const DFP_SCRIPT_NAME = "gpt.js";
const DFP_SRC_NO_PROTOCOL = `www.googletagservices.com/tag/js/${DFP_SCRIPT_NAME}`;
const DFP_SRC = `https://${DFP_SRC_NO_PROTOCOL}`;

const logInfo = utils.logInfo.bind(utils, `[${MODULE_NAME}]`);
const logError = utils.logError.bind(utils, `[${MODULE_NAME}]`);
const logWarn = utils.logError.bind(utils, `[${MODULE_NAME}]`);

function isAdServerBid(bid) {
  return bid.bidder === "dfp";
}
$$PREBID_GLOBAL$$.initAdServer = function ({adUnits, timeout, auctionId}) {
  logInfo('Init');
  if (!findDFPScript()) {
    loadDFPScript();
  }
  const dfpSlotsMap = {};
  const requestedSlots = [];
  let oGptDefineSlot;
  let oGptDisplay;
  window.googletag = window.googletag || {};
  window.googletag.cmd = window.googletag.cmd || [];
  window.googletag.cmd.push(function () {
    const gpt = window.googletag;
    const pads = gpt.pubads;
    oGptDefineSlot = gpt.defineSlot;
    oGptDisplay = gpt.display;
    if (!gpt.display || !gpt.enableServices || typeof pads !== 'function' || !pads().refresh || !pads().disableInitialLoad || !pads().getSlots || !pads().enableSingleRequest) {
      utils.logError('could not bind to gpt googletag api');
      return;
    }
    pads().addEventListener('slotRequested', function(event) {
      var slot = event.slot;
      requestedSlots.push(slot.getSlotElementId());
    });
    // logInfo('enable single request');
    // pads().enableSingleRequest();
    logInfo('enable services');
    gpt.enableServices();
    const _defineSlot = function(adUnitPath, sizes, opt_div) {
      if (dfpSlotsMap[opt_div]) {
        logWarn(`prevent rewrite slot for "${opt_div}"`);
        return {
          addService() {}
        }
      }
      return oGptDefineSlot(adUnitPath, sizes, opt_div);
    };
    const _display = function(opt_div) {
      // requestSlot(opt_div);
      return oGptDisplay(opt_div);
    };
    Object.defineProperty(gpt, 'defineSlot', {
      get: function() {return _defineSlot; },
      set: function() {},
    });
    // Object.defineProperty(gpt, 'display', {
    //   get: function(){ return _display; },
    //   set: function() {}
    // });

    function requestSlot(opt_div) {
      const dfpSlot = getDFPSlot(opt_div);
      if (dfpSlot && requestedSlots.indexOf(opt_div) === -1 && isInitialLoadDisabled()) {
        pads().refresh([dfpSlot]);
      }
    }
  });
  adUnits.filter((adUnit) => {
    const phId = adUnit.code;
    const sizes = getAdUnitToDFPSizes(adUnit);
    const adServerBidIndex = adUnit.bids.findIndex(isAdServerBid);
    if (adServerBidIndex === -1) {
      return logError('ad server bid not found in', adUnit);
    }
    const bid = adUnit.bids.splice(adServerBidIndex, 1)[0];
    const {section_id: networkCode, id: unitCode} = bid.params;
    if (!networkCode) {
      return logError('"section_id"(network code) is not defined in', bid);
    }
    if (!unitCode) {
      return logError('"id"(unit code) is not defined in', bid);
    }
    const adUnitPath = `/${networkCode}/${unitCode}`;

    dfpSlotsMap[phId] = {adUnitPath: adUnitPath, sizes: sizes, phId: phId};
    return true;
  });
  logInfo('send request', adUnits);
  if (auctionId) {
    $$PREBID_GLOBAL$$.requestBids({
      bidsBackHandler: sendAdserverRequest,
      timeout: timeout,
      adUnits: adUnits,
      auctionId: auctionId,
    });
  } else {
    $$PREBID_GLOBAL$$.requestBids({
      bidsBackHandler: sendAdserverRequest,
      timeout: timeout,
      adUnits: adUnits,
    });
  }
  function sendAdserverRequest() {
    window.googletag.cmd.push(function () {
      $$PREBID_GLOBAL$$.que.push(function () {
        Object.values(dfpSlotsMap).forEach((dfpSlotConfig) => {
          const {adUnitPath, sizes, phId} = dfpSlotConfig;
          let dfpSlot = getDFPSlot(phId);
          if (dfpSlot) {
            return logError(`disable prebid for "${phId}", slot already defined on page`);
          }
          logInfo('define slot', `('${adUnitPath}', [...], '${phId}')`);
          dfpSlot = (oGptDefineSlot || window.googletag.defineSlot)(adUnitPath, sizes, phId);
          dfpSlot.addService(googletag.pubads());
          $$PREBID_GLOBAL$$.setTargetingForGPTAsync(phId);
          display(phId);
          // logInfo(`set targeting for ${JSON.stringify(prebidCodes)}`)
          if (isInitialLoadDisabled()) {
            logInfo(`refresh "${phId}"`, dfpSlot);
            window.googletag.pubads().refresh([dfpSlot]);
          }
        });
      });
    });
  }
};
function isInitialLoadDisabled() {
  return window.googletag.pubads().isInitialLoadDisabled();
}
function getAdUnitToDFPSizes(adUnit) {
  return Object.values(adUnit.mediaTypes).reduce((dfpSizes, mediaType) => {
    return dfpSizes.concat(
      mediaType.sizes.filter((mtSize) => !dfpSizes.find((dfpSize) => dfpSize[0] === mtSize[0] && dfpSize[1] === mtSize[1])),
    );
  }, []);
}


function getDFPSlot(placeholder) {
  return window.googletag.pubads().getSlots().find((slot) => {
    return slot.getSlotElementId() === placeholder;
  });
}

function findDFPScript() {
  return document.querySelector(`script[src*='${DFP_SCRIPT_NAME}']`);
}

function loadDFPScript() {
  logInfo(`loading script`);
  loadExternalScript(DFP_SRC, MODULE_NAME);
}

const DISPLAY_CACHE = [];

function display(phId) {
  if (!DISPLAY_CACHE.includes(phId)) {
    DISPLAY_CACHE.push(phId);
    let ph = document.getElementById(phId);
    if (!ph) {
      const observer = new MutationObserver(function (mutationsList, observer) {
        ph = document.getElementById(phId);
        if (ph) {
          googleDisplay(phId);
          this.disconnect();
        }
      });
      observer.observe(document.body, {
        attributes: true,
        childList: true,
        subtree: true
      });
    } else {
      googleDisplay(phId);
    }
  }
}
function googleDisplay(phId) {
  window.googletag.cmd.push(function() {
    logInfo(`display "${phId}"`);
    window.googletag.display(phId);
  });
}



