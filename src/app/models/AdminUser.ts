import mongoose, { Document, Schema, Model } from 'mongoose';

export interface AdminUser extends Document {
  username: string;
  password_hash: string;
  email: string;
  role: 'admin';
}

const adminUserSchema = new Schema<AdminUser>({
  username: { type: String, required: true },
  password_hash: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, enum: ['admin'], required: true }
}, {
  timestamps: true
});

const AdminUserModel: Model<AdminUser> = mongoose.model<AdminUser>('AdminUser', adminUserSchema);

export default AdminUserModel;
