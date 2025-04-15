import mongoose from 'mongoose';

const customer = new mongoose.Schema({
    _id: 'String',
    name: 'String',
    email:'String',
    age: 'Number',
    location: 'String',
    gender: 'String',
});


export default mongoose.model('Customers',customer);