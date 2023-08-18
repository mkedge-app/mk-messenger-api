import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({ _id: String }, { strict: false });

const Subscription = mongoose.model('Subscription', SubscriptionSchema);

export default Subscription;
