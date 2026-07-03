import mongoose from 'mongoose';

const aboutStatSchema = new mongoose.Schema({
  value: { type: String, required: true },
  label: { type: String, required: true },
  image: { type: String, required: true },
  imageHeight: { type: String, default: null },
  imagePosition: { type: String, default: null },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.AboutStat || mongoose.model('AboutStat', aboutStatSchema);
