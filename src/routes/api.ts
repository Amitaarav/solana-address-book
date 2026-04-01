import { Router } from 'express';
import {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
  deriveATAForContact,
} from '../controllers/contactController';
import { verifyOwnership, getPDA } from '../controllers/cryptoController';
import {
  validate,
  contactSchema,
  updateContactSchema,
  ataSchema,
  verifyOwnershipSchema,
  derivePDASchema,
} from '../middleware/validation';

const router = Router();

// Contacts CRUD
router.post('/contacts', validate(contactSchema), createContact);
router.get('/contacts', getAllContacts);
router.get('/contacts/:id', getContactById);
router.put('/contacts/:id', validate(updateContactSchema), updateContact);
router.delete('/contacts/:id', deleteContact);

// ATA Derivation
router.post('/contacts/:id/derive-ata', validate(ataSchema), deriveATAForContact);

// Crypto Utilities
router.post('/verify-ownership', validate(verifyOwnershipSchema), verifyOwnership);
router.post('/derive-pda', validate(derivePDASchema), getPDA);

export default router;
