import mongoose, { Document, Schema } from 'mongoose';

interface UserFields {
  name: string;
  contactPhone: string;
  contactEmail: string;
  username: string;
  passwordHash: string;
  userType: 'admin' | 'tenant';
  subscription?: mongoose.Types.ObjectId; // Referência ao ID da assinatura
}

interface UserDocument extends UserFields, Document { }

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    contactPhone: { type: String, required: true },
    contactEmail: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    userType: { type: String, enum: ['admin', 'tenant'], required: true },
    subscription: { type: Schema.Types.ObjectId, ref: 'Subscription' }, // Referência à assinatura
  },
  {
    timestamps: true, // Adiciona os campos createdAt e updatedAt
  }
);

const User = mongoose.model<UserDocument>('User', userSchema);

export default User;
