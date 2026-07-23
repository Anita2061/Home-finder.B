import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
},

  description: { 
    type: String, 
    required: true 
},

  location: { 
    type: String, 
    required: true 
},

  price: { 
    type: Number, 
    required: true 
},

  type: { 
    type: String, 
    enum: ['Room', 'Flat', 'Apartment'],
    required: true 
    },

  image: { 
    type: String, 
    required: true
 },

  images: [{ 
    type: String 
}],

  amenities: [{ 
    type: String 
}],

  contact: { 
    type: String, 
    required: true 
},

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  lat: {
    type: Number,
    required: true,
    default: 27.7172,
  },

  lng: {
    type: Number,
    required: true,
    default: 85.3240,
  }
}, 
{ timestamps: true });

export default mongoose.model('Room', roomSchema);
