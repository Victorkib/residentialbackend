import mongoose from 'mongoose';
import House from '../models/houses.js';

// register house
export const registerHouse = async (req, res) => {
  const {
    houseName,
    floor,
    rentPayable,
    months,
    rentDeposit,
    waterDeposit,
    otherDeposits = [], // Default to an empty array if not provided
  } = req.body;

  const { apartmentId } = req.params;

  try {
    // Convert to number and handle potential string values
    const floorNum = Number(floor) || 0;
    const rentPayableNum = Number(rentPayable) || 0;
    const monthsRentDepoNum = Number(months) || 0;
    const rentDepositNum = Number(rentDeposit) || 0;
    const waterDepositNum = Number(waterDeposit) || 0;

    // Ensure each entry in otherDeposits is formatted correctly
    const formattedOtherDeposits = otherDeposits.map((deposit) => ({
      title: deposit.title || '', // Default to empty string if title is blank
      amount: Number(deposit.amount) || 0, // Convert to number, default to 0 if amount is blank
    }));

    // Check if house is already registered
    const isAlreadyRegistered = await House.findOne({
      houseName,
      floor: floorNum,
      apartment: apartmentId,
    });

    if (isAlreadyRegistered) {
      return res.status(400).json({ message: 'House already registered' });
    }

    // Register house
    const house = await House.create({
      houseName,
      floor: floorNum,
      apartment: apartmentId,
      rentPayable: rentPayableNum,
      monthsUsedForRentDepo: monthsRentDepoNum,
      rentDeposit: rentDepositNum,
      waterDeposit: waterDepositNum,
      otherDeposits: formattedOtherDeposits, // Use the formatted array
    });

    if (!house) {
      return res.status(400).json({ message: 'Error creating house' });
    }

    res.status(200).json(house);
  } catch (err) {
    console.error('Error registering house:', err);
    res.status(500).json({ message: 'Failed to create house' });
  }
};

//fetch All Houses
export const fetchALlHouses = async (req, res) => {
  try {
    const houses = await House.find().populate('apartment');
    if (!houses) {
      return res.status(400).json({ message: 'No houses Registered' });
    }
    // console.log('RegistedHouses: ', houses);
    res.status(200).json(houses);
  } catch (err) {
    console.error('Error Fetching Houses:', err);
    res.status(500).json({ message: 'Failed to Fetch Houses' });
  }
};
//fetch All Houses
export const fetchAllHousesInApartment = async (req, res) => {
  try {
    const { apartmentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(apartmentId)) {
      return res.status(400).json({ message: 'Invalid apartmentId!' });
    }
    const houses = await House.find({ apartment: apartmentId });
    if (!houses) {
      return res
        .status(400)
        .json({ message: 'No houses Registered for that apartement' });
    }
    // console.log('RegistedHouses: ', houses);
    res.status(200).json(houses);
  } catch (err) {
    console.error('Error Fetching Houses: ', err);
    res.status(500).json({ message: err.message || 'Failed To get houses!' });
  }
};

//fetch Single House
export const fetchSingleHouse = async (req, res) => {
  const { houseName, floor } = req.body;
  try {
    //convert floor to number
    const floorNum = Number(floor) || 0;
    const houses = await House.find({ houseName, floor: floorNum });
    if (!houses) {
      return res.status(400).json({ message: 'No houses Registered' });
    }
    // console.log('RegistedHouses: ', houses);
    res.status(200).json(houses);
  } catch (err) {
    console.error('Error Fetching Houses:', err);
    res.status(500).json({ message: 'Failed to Fetch Houses' });
  }
};

//Delete Single House
export const deleteHouse = async (req, res) => {
  const { houseId } = req.params;
  try {
    const deletedHouse = await House.findByIdAndDelete(houseId);
    if (!deletedHouse) {
      return res.status(404).json({ message: 'No Such House Found!' });
    }

    res.status(200).json(deletedHouse);
  } catch (err) {
    console.error('Error Fetching Houses:', err);
    res.status(500).json({ message: 'Failed to Fetch Houses' });
  }
};

//edit the house
export const editHouse = async (req, res) => {
  const { houseId } = req.params; // Assuming houseId is passed as a route parameter
  const {
    houseName,
    floor,
    rentPayable,
    months,
    rentDeposit,
    waterDeposit,
    otherDeposits = [], // Default to an empty array if not provided
  } = req.body;

  try {
    // Find the house by ID
    const house = await House.findById(houseId);
    if (!house) {
      return res.status(404).json({ message: 'House not found' });
    }

    // Only update properties if they are provided
    if (houseName !== undefined) {
      house.houseName = houseName;
    }
    if (floor !== undefined) {
      house.floor = Number(floor) || 0; // Convert to number, default to 0 if invalid
    }
    if (rentPayable !== undefined) {
      house.rentPayable = Number(rentPayable) || 0; // Convert to number, default to 0 if invalid
    }
    if (months !== undefined) {
      house.monthsUsedForRentDepo = Number(months) || 0; // Convert to number, default to 0 if invalid
    }
    if (rentDeposit !== undefined) {
      house.rentDeposit = Number(rentDeposit) || 0; // Convert to number, default to 0 if invalid
    }
    if (waterDeposit !== undefined) {
      house.waterDeposit = Number(waterDeposit) || 0; // Convert to number, default to 0 if invalid
    }
    if (otherDeposits.length > 0) {
      // Ensure each entry in otherDeposits is formatted correctly
      const formattedOtherDeposits = otherDeposits.map((deposit) => ({
        title: deposit.title || '', // Default to empty string if title is blank
        amount: Number(deposit.amount) || 0, // Convert to number, default to 0 if amount is blank
      }));
      house.otherDeposits = formattedOtherDeposits; // Update other deposits only if provided
    }

    // Save the updated house
    await house.save();

    res.status(200).json(house);
  } catch (err) {
    console.error('Error editing house:', err);
    res.status(500).json({ message: 'Failed to edit house' });
  }
};
