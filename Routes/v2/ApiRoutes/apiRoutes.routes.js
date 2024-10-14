import express from 'express';
// Import middleware
import verifyTokenRoute from '../routes/verifyToken.routes.js';

// Routes import
import authRoutes from '../../auth.routes.js';
import tenantRoutes from '../../tenant.routes.js';
import landLordRoutes from '../../landLord.routes.js';
import paymentsRoutes from '../../payment.routes.js';
import housesRoutes from '../../house.routes.js';
import kraRoutes from '../../kra.routes.js';

// v2 Routes import
import apartmentRoutes from '../routes/Apartment.routes.js';
import v2TenantRoutes from '../routes/tenant.routes.js';
import v2PaymentRoutes from '../routes/payment.routes.js';
import InvoiceRoutes from '../routes/invoice.routes.js';
import floorRoutes from '../routes/floor.routes.js';
import clearanceRoutes from '../routes/clearance.routes.js';

// import verifyJWT from '../../../middleware/jwtMiddleware.js';

const router = express.Router();

// Apply the JWT middleware globally (except for /api/auth)
// This should be placed after defining your API routes, if you have routes that shouldn't require JWT
// router.use(verifyJWT);

// Define your API routes
router.use('/jwt', verifyTokenRoute);
router.use('/auth', authRoutes);
router.use('/tenants', tenantRoutes);
router.use('/landlords', landLordRoutes);
router.use('/payments', paymentsRoutes);
router.use('/houses', housesRoutes);
router.use('/kra', kraRoutes);

//v2 routes
router.use('/v2/tenants', v2TenantRoutes);
router.use('/v2/payments', v2PaymentRoutes);
router.use('/v2/apartments', apartmentRoutes);
router.use('/v2/invoices', InvoiceRoutes);
router.use('/v2/clearance', clearanceRoutes);
router.use('/v2/floors', floorRoutes);

export default router;
