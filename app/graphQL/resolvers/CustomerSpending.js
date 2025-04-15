import Customers from "../../models/Customers.js";
import Orders from "../../models/Orders.js";
import redisClient from '../../utils/redisClient.js';
import { UserInputError, NotFoundError } from './../../utils/CustomErrors.js';
export const getCustomerSpending = async (_, { customerId }) => {
  try {
    if (!customerId) {
        throw new UserInputError('Customer ID is required.');
    }

    const cacheKey = `customerSpending:${customerId}`;
    console.log('CacheKey:', cacheKey);

    // Check Redis cache
    let cached;
    try {
      cached = await redisClient.get(cacheKey);
    } catch (redisReadErr) {
      console.warn("Redis read failed:", redisReadErr.message);
    }

    if (cached) {
      console.log('Cache HIT!!');
      return JSON.parse(cached);
    }

    // Find customer
    const customer = await Customers.findOne({ _id: customerId });
    if (!customer) {
        throw new NotFoundError(`Customer with ID ${customerId} not found.`);
    }

    // Aggregate order data
    const result = await Orders.aggregate([
      { $match: { customerId: customer._id, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$totalAmount' },
          avgOrder: { $avg: '$totalAmount' },
          lastOrderDate: { $max: '$orderDate' },
        },
      },
    ]);

    if (!result[0]) {
      return {
        error: false,
        message: "No completed orders found.",
        customerId,
        totalSpent: 0,
        averageOrderValue: 0,
        lastOrderDate: null,
      };
    }

    const spendingData = {
      error: false,
      message: "Success",
      customerId,
      totalSpent: result[0].totalSpent,
      averageOrderValue: result[0].avgOrder,
      lastOrderDate: result[0].lastOrderDate,
    };

    // Cache the result
    try {
      await redisClient.setEx(cacheKey, 300, JSON.stringify(spendingData));
    } catch (redisWriteErr) {
      console.warn("Redis write failed:", redisWriteErr.message);
    }

    return spendingData;
  } catch (error) {
    console.error("Error in getCustomerSpending:", error.message);
    throw err;
  }
};
