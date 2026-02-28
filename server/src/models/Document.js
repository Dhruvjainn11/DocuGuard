const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  originalFilename: { type: String }, 
  
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
 
  cloudinaryId: { type: String, required: true }, 
  fileType: { type: String, required: true }, 
  fileSize: { type: Number },
  fileHash: { type: String, index: true },
  
  status: { type: String, enum: ['active', 'trash', 'archived'], default: 'active' },
  processingStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },

  extractedData: {
    merchantName: String, 
    purchaseDate: Date,
    expiryDate: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);