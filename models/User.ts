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
    },
    tags: {
      type: [String],
      enum: ['anime', 'football', 'cricket', 'art', 'therapy', 'music', 'travel', 
             'food', 'gardening', 'dance', 'tech', 'web3', 'shows-movies', 
             'night-life', 'gaming', 'student'],
      default: []
    },
    conversation_cids: [String]
  }, {
    timestamps: true
  });
  
export default mongoose.models.User || mongoose.model('User', UserSchema);