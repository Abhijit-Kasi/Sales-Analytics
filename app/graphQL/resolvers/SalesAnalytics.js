import Customers from "../../models/Customers.js";
import Orders from "../../models/Orders.js";
import redisClient from "../../utils/redisClient.js";

export const getSalesAnalytics = async (_, { startDate, endDate }) => {
  try {
    if (!startDate || !endDate) {
      throw new Error("Both startDate and endDate are required.");
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Invalid date format for startDate or endDate.");
    }

    if (start > end) {
      throw new Error("startDate cannot be after endDate.");
    }

    const cacheKey = `salesAnalytics:${startDate}:${endDate}`;
    console.log("CacheKey:", cacheKey);

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log("Cache HIT!!");
      return JSON.parse(cached);
    }

    const result = await Orders.aggregate([
      {
        $addFields: {
          orderDate: {
            $dateFromString: { dateString: "$orderDate" },
          },
        },
      },
      {
        $match: {
          status: "completed",
          orderDate: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $facet: {
          total: [
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: "$totalAmount" },
                completedOrders: { $sum: 1 },
              },
            },
          ],
          breakdown: [
            { $unwind: "$products" },
            {
              $lookup: {
                from: "products",
                localField: "products.productId",
                foreignField: "_id",
                as: "product",
              },
            },
            { $unwind: "$product" },
            {
              $group: {
                _id: "$product.category",
                revenue: {
                  $sum: {
                    $multiply: ["$products.quantity", "$products.priceAtPurchase"],
                  },
                },
              },
            },
            {
              $project: {
                category: "$_id",
                revenue: 1,
                _id: 0,
              },
            },
          ],
        },
      },
    ]);

    const total = result[0]?.total[0] || {
      totalRevenue: 0,
      completedOrders: 0,
    };
    const breakdown = result[0]?.breakdown || [];

    const response = {
      totalRevenue: total.totalRevenue,
      completedOrders: total.completedOrders,
      categoryBreakdown: breakdown,
    };

    await redisClient.setEx(cacheKey, 300, JSON.stringify(response));
    return response;
  } catch (error) {
    console.error("Error in getSalesAnalytics:", error.message);
    throw new Error(error.message);
  }
};
