import { Router } from 'express';
import {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
  deriveATAForContact,
} from '../controllers/contactController.js';
import { verifyOwnership, getPDA, checkAddress } from '../controllers/cryptoController.js';
import {
  validate,
  contactSchema,
  updateContactSchema,
  ataSchema,
  verifyOwnershipSchema,
  derivePDASchema,
} from '../middleware/validation.js';
import { apiLimiter, cryptoLimiter, writeLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Apply baseline API rate limiting to all endpoints
router.use(apiLimiter);

// Contacts CRUD
router.post('/contacts', writeLimiter, validate(contactSchema), createContact);
router.get('/contacts', getAllContacts);
router.get('/contacts/:id', getContactById);
router.put('/contacts/:id', writeLimiter, validate(updateContactSchema), updateContact);
router.delete('/contacts/:id', writeLimiter, deleteContact);

// ATA Derivation for Contact (cryptographic)
router.post('/contacts/:id/derive-ata', cryptoLimiter, validate(ataSchema), deriveATAForContact);

// Standalone Crypto Utilities
router.post('/verify-ownership', cryptoLimiter, validate(verifyOwnershipSchema), verifyOwnership);
router.post('/derive-pda', cryptoLimiter, validate(derivePDASchema), getPDA);
router.get('/check-address', checkAddress);

export default router;

