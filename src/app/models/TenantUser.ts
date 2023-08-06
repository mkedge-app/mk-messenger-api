import mongoose, { Document, Schema, Model } from 'mongoose';

export interface TenantUser extends Document {
  username: string;
  password_hash: string;
  email: string;
  role: 'tenant';
  // Propriedades específicas para tenants
  name: string;
  contact_email: string;
  contact_phone: string;
}

const tenantUserSchema = new Schema<TenantUser>({
  username: { type: String, required: true },
  password_hash: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, enum: ['tenant'], required: true },
  name: { type: String, required: true },
  contact_email: { type: String, required: true },
  contact_phone: { type: String, required: true }
}, {
  timestamps: true
});

const TenantUserModel: Model<TenantUser> = mongoose.model<TenantUser>('TenantUser', tenantUserSchema);

export default TenantUserModel;
