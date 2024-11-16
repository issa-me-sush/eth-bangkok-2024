import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
  },
  walletAddress: {
    type: String,
    required: true,
    unique: true,
  },
  isSetupCompleted: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true
});

export default mongoose.models.User || mongoose.model('User', UserSchema); 