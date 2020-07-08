// import {ajax} from 'src/ajax';
import adapter from '../src/AnalyticsAdapter.js';
// import CONSTANTS from 'src/constants.json';
import adaptermanager from '../src/adapterManager.js';
import {logInfo} from '../src/utils.js';

const analyticsType = 'endpoint';
const url = 'URL_TO_SERVER_ENDPOINT';
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
};

adaptermanager.registerAnalyticsAdapter({
  adapter: admixerAnalytics,
  code: 'admixer'
});
export default admixerAnalytics;
