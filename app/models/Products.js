import mongoose from 'mongoose';

const product = new mongoose.Schema({
    _id: 'String',
    name: 'String',
    category: 'String',
    price: 'Number',
    stock: 'Number',
});

export default mongoose.model('Products',product);