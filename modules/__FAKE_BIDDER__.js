/**
 * need for bundle-service work
 */
import * as BidderFactory from '../src/adapters/bidderFactory.js';
const originalRegisterBidder = BidderFactory.registerBidder;
BidderFactory.registerBidder = function(bidder) {
  window.REGISTERED_BIDDERS = window.REGISTERED_BIDDERS || [];
  window.REGISTERED_BIDDERS.push(bidder);
  return originalRegisterBidder.apply(this, arguments);
}
// import { registerBidder } from '../src/adapters/bidderFactory.js';
