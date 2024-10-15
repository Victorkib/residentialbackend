import mongoose from 'mongoose';
import Apartment from '../../../models/v2/models/apartment.model.js';
import Tenant from '../../../models/v2/models/v2Tenant.model.js';
import Payment from '../../../models/v2/models/v2Payment.model.js';
import Invoice from '../../../models/v2/models/Invoice.js';
import Floor from '../../../models/v2/models/floor.model.js';
import House from '../../../models/houses.js';
import ScheduledJob from '../../../models/v2/models/ScheduledJob.js';

// create a new apartment or add a new apartment
export const createApartment = async (req, res) => {
  const { name, noHouses, location } = req.body;
  if (!name || !noHouses || !location) {
    return res.status(400).json({ message: 'Please fill in all the fields' });
  }

  try {
    const createdApartment = await Apartment.create({
      name,
      noHouses,
      location,
    });
    if (!createdApartment) {
      return res.status(400).json({ message: 'Error Creating Apartment' });
    }
    res.status(200).json(createdApartment);
  } catch (error) {
    res.status(500).json({ message: 'internal server error' });
  }
};

// get all apartments
export const allApartments = async (req, res) => {
  try {
    const fetchedApartments = await Apartment.find({});

    res.status(200).json(fetchedApartments);
  } catch (error) {
    res.status(500).json({ message: 'internal server error' });
  }
};

// get a single apartment
export const apartment = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'no such apartment' });
  }

  try {
    const fetchedApartment = await Apartment.findById(id);

    if (!fetchedApartment) {
      return res.status(404).json({ message: 'Apartment not found' });
    }
    res.status(200).json(fetchedApartment);
  } catch (error) {
    res.status(500).json({ message: 'internal server error' });
  }
};

//delete apartment and associated data
export const deleteApartment = async (req, res) => {
  const { apartmentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(apartmentId)) {
    return res.status(404).json({ message: 'Invalid apartment ID' });
  }

  try {
    // Find all tenants associated with the apartment
    const tenants = await Tenant.find({ apartmentId: apartmentId });

    if (tenants.length > 0) {
      const tenantIds = tenants.map((tenant) => tenant._id);

      // Delete all payments for each tenant
      await Payment.deleteMany({ tenant: { $in: tenantIds } });

      // Delete all invoices for each tenant
      await Invoice.deleteMany({ tenant: { $in: tenantIds } });

      // Delete all scheduled jobs for each tenant
      await ScheduledJob.deleteMany({ tenantId: { $in: tenantIds } });

      // Delete all tenants
      await Tenant.deleteMany({ _id: { $in: tenantIds } });
    }

    // Delete all floors associated with the apartment
    await Floor.deleteMany({ apartment: apartmentId });

    // Delete all houses associated with the apartment
    await House.deleteMany({ apartment: apartmentId });

    // Finally, delete the apartment
    const deletedApartment = await Apartment.findByIdAndDelete(apartmentId);

    if (!deletedApartment) {
      return res.status(404).json({ message: 'Apartment not found' });
    }

    res
      .status(200)
      .json({ message: 'Apartment and associated data successfully deleted' });
  } catch (error) {
    console.error('Error deleting apartment and associated data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// update an apartment
export const updateApartment = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'no such apartment' });
  }
  try {
    const updatedApartment = await Apartment.findByIdAndUpdate(
      { id },
      { ...req.body },
      { new: true }
    );
    if (!updatedApartment) {
      return res.status(404).json({ message: 'Apartment not found' });
    }

    res.status(200).json(updatedApartment);
  } catch (error) {
    res.status(500).json({ message: 'internal server error' });
  }
};

//
