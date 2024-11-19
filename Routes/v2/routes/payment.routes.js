import express from 'express';
import {
  getFullyPaidTenantPayments,
  getUnpaidTenantPayments,
  updatePayment,
  monthlyPayProcessing,
  ExtraAmountGivenInAmonth,
  getTenantPaymentsForCurrentMonth,
  updatePaymentDeficit,
  //
  getGroupedPaymentsByTenant,
  getPaymentsByTenantId,
  getAllPayments,
  getAllPaymentsForAllTenant,
  getAllTenantsWithoutPaymentForCurrentMonth,
  getAllRentsPaid,
  getAllWaterRecords,
  getAllGarbageRecords,
  getPaymentsByTenant,
  deletePayment,
} from '../../../controllers/v2/controllers/payment.controller.js';
import { authorizeRoles } from '../../../middleware/authorizeRoles.js';
import { addHouseWaterBill } from '../../../utils/v2/utils/paymentHelper.js';
const router = express.Router();

router.get('/unpaidPayments/:tenantId', getUnpaidTenantPayments);
router.get('/fullyPaidPayments/:tenantId', getFullyPaidTenantPayments);
router.put('/updatePayment/:paymentId', updatePayment);
router.post(
  '/monthlyPayProcessing',
  authorizeRoles('super_admin'),
  monthlyPayProcessing
);
// router.put(
//   '/ExtraAmountGivenInAmonth/:paymentId',
//   authorizeRoles('super_admin'),
//   ExtraAmountGivenInAmonth
// );
router.put(
  '/ExtraAmountGivenInAmonth/:tenantId',
  authorizeRoles('super_admin'),
  ExtraAmountGivenInAmonth
);

// Get all payments grouped by tenantId
router.get('/getGroupedPaymentsByTenant', getGroupedPaymentsByTenant);
// Route to get Payments By TenantId
router.get('/getPaymentsByTenantId/:tenant', getPaymentsByTenantId);
router.get('/getAllPayments', getAllPayments);
router.get('/getAllPaymentsForAllTenant', getAllPaymentsForAllTenant);
router.get('/unpaid', getAllTenantsWithoutPaymentForCurrentMonth);
router.get('/allRents', getAllRentsPaid);
router.get('/waterRecords', getAllWaterRecords);
router.get('/garbageRecords', getAllGarbageRecords);
router.get('/paymentsByTenant/:tenantId', getPaymentsByTenant);
router.delete(
  '/deletePayment/:paymentId',
  authorizeRoles('super_admin'),
  deletePayment
);

//update deficit values
router.put(
  '/updateDeficit/:paymentId',
  authorizeRoles('super_admin'),
  updatePaymentDeficit
);

//router add the water bill for house
router.put('/addHouseWaterBill/:tenantId', addHouseWaterBill);

router.get(
  '/getTenantPaymentsForCurrentMonth',
  getTenantPaymentsForCurrentMonth
);
export default router;
