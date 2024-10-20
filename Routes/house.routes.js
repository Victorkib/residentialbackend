import express from 'express';
import {
  deleteHouse,
  fetchALlHouses,
  fetchAllHousesInApartment,
  fetchSingleHouse,
  registerHouse,
  editHouse,
} from '../controllers/house.controller.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';

const router = express.Router();

router.post(
  '/postHouse/:apartmentId',
  authorizeRoles('super_admin'),
  registerHouse
);

// Edit house route
router.put('/updateHouse/:houseId', authorizeRoles('super_admin'), editHouse);

router.get('/getAllHouses', fetchALlHouses);
router.get('/getAllHouses/:apartmentId', fetchAllHousesInApartment);
router.get('/getSingleHouse', authorizeRoles('super_admin'), fetchSingleHouse);
router.delete(
  '/deleteHouse/:houseId',
  authorizeRoles('super_admin'),
  deleteHouse
);

export default router;
