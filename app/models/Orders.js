import mongoose from 'mongoose';

const orders = new mongoose.Schema({
    customerId: 'String',
    products: [
      {
        productId: 'String',
        quantity: 'Number',
        priceAtPurchase: 'Number',
      }
    ],
    totalAmount: 'Number',
    orderDate: 'String',
    status: 'String',
});

export default mongoose.model('Orders',orders);