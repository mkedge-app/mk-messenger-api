import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({ _id: String }, { strict: false });

const Payment = mongoose.model('Payment', PaymentSchema);

export default Payment;
