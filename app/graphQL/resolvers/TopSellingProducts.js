import Customers from "../../models/Customers.js";
import Orders from "../../models/Orders.js";
import redisClient from "../../utils/redisClient.js";

export const getTopSellingProducts = async (_, { limit }) => {
  // Validate input
  if (!limit || typeof limit !== 'number' || limit <= 0) {
    throw new Error("Invalid 'limit' provided. It must be a positive number.");
  }

  const cacheKey = `getTopSellingProducts:${limit}`;
  console.log("CacheKey:", cacheKey);

  //Try to fetch from Redis
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log("Cache HIT!!");
      return JSON.parse(cached);
    }
  } catch (redisErr) {
    console.warn("Redis read failed:", redisErr.message);
  }

  // If Catch Miss, Query MongoDB
  let result;
  try {
    result = await Orders.aggregate([
      { $unwind: '$products' },
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$products.productId',
          totalSold: { $sum: '$products.quantity' },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          productId: '$_id',
          name: '$product.name',
          totalSold: 1,
        },
      },
    ]);
  } catch (dbErr) {
    console.error("MongoDB aggregation failed:", dbErr.message);
    throw new Error("Failed to retrieve top-selling products from the database.");
  }

  // Step 3: Cache result in Redis
  try {
    await redisClient.setEx(cacheKey, 300, JSON.stringify(result));
  } catch (redisErr) {
    console.warn("Redis write failed:", redisErr.message);
  }

  // Step 4: Return final result
  return result;
};
