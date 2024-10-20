import mongoose from 'mongoose';

// Define the schema for the other deposits
const otherDepositSchema = new mongoose.Schema({
  title: {
    type: String,
    default: '', // Default to an empty string if not provided
  },
  amount: {
    type: Number,
    default: 0, // Default to 0 if not provided
  },
});

// Define the main house schema
const houseSchema = new mongoose.Schema(
  {
    houseName: {
      type: String,
      required: true, // Ensures houseName is provided
    },
    floor: {
      type: Number,
      required: true, // Ensures floor is provided
    },
    apartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'apartments',
      required: true,
    },
    isOccupied: {
      type: Boolean,
      default: false,
    },
    rentPayable: {
      type: Number,
      required: true, // Ensures rentPayable is provided
    },
    monthsUsedForRentDepo: {
      type: Number,
      required: true, // Ensures months is provided
    },
    rentDeposit: {
      type: Number,
      required: true, // Ensures rentDeposit is provided
    },
    waterDeposit: {
      type: Number,
      required: true, // Ensures waterDeposit is provided
    },
    otherDeposits: {
      type: [otherDepositSchema], // Array of other deposits
      default: [], // Default to an empty array if not provided
    },
  },
  { timestamps: true }
);

// Updated unique index on floor and apartment to allow the same house name on different floors
houseSchema.index({ floor: 1, apartment: 1, houseName: 1 }, { unique: true });

const House = mongoose.model('house', houseSchema);
export default House;
