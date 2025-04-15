
import Orders from "../../models/Orders.js";
export const getCustomerOrders =async (_, { customerId, limit, offset }) => {
    console.log('Ordesss:',await Orders.find({ customerId }))
    return await Orders.find({ customerId })
      .skip(offset)
      .limit(limit)
      .exec();
  }
  