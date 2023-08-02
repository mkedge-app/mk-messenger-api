import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({}, { strict: false });

const Payment = mongoose.model('Payment', PaymentSchema);

export default Payment;
