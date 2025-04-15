import {getCustomerSpending} from './CustomerSpending.js';
import {getTopSellingProducts} from './TopSellingProducts.js';
import {getSalesAnalytics} from './SalesAnalytics.js';
import { orderMutation } from './OrderMutation.js';
import { getCustomerOrders } from './CustomerOrders.js';
export default {
  Query: {
    getCustomerSpending,
    getTopSellingProducts,
    getSalesAnalytics,
    getCustomerOrders
  },
  Mutation: {
    placeOrder:orderMutation
  }
};
