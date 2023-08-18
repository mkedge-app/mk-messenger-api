import mongoose from "mongoose";

const FaturaSchema = new mongoose.Schema({ _id: String }, { strict: false });

const Fatura = mongoose.model('Fatura', FaturaSchema);

export default Fatura;
