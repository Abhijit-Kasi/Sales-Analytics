import Customers from "../../models/Customers.js";
import Orders from "../../models/Orders.js";

export const orderMutation = async (_, { order }) => {
  try {
    if (!order || !order.customerId) {
      throw new Error("Order and customerId are required.");
    }

    // Check if customer exists
    const customer = await Customers.findOne({ _id: order.customerId });
    if (!customer) {
      throw new Error(`Customer with ID ${order.customerId} not found.`);
    }

    // Calculate total amount
    const totalAmount = order.products.reduce(
      (sum, p) => sum + p.quantity * p.priceAtPurchase,
      0
    );

    // Create and save order
    const newOrder = new Orders({
      customerId: order.customerId,
      products: order.products,
      totalAmount,
      orderDate: order.orderDate,
      status: order.status,
    });

    await newOrder.save();

    return {
      id: newOrder._id.toString(),
      customerId: newOrder.customerId,
      products: newOrder.products,
      totalAmount: newOrder.totalAmount,
      orderDate: newOrder.orderDate,
      status: newOrder.status,
    };
  } catch (error) {
    console.error("Error in orderMutation:", error.message);
    throw new Error(error.message);
  }
};
