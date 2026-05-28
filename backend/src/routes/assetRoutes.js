const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { verifyToken, authorizeRoles } = require('../middlewares/auth');

// 0. Get assets for the logged-in employee
router.get('/my-assets', verifyToken, assetController.getMyAssets);

// 1. Get full asset inventory list
router.get('/', verifyToken, authorizeRoles('admin', 'hr'), assetController.listAssets);

// 2. Get asset analytics summary (total vs damaged)
router.get('/summary', verifyToken, authorizeRoles('admin', 'hr'), assetController.summary);

// 3. Get all damages logged against a specific user
router.get('/user/:userId', verifyToken, authorizeRoles('admin', 'hr'), assetController.employeeDamages);

// 4. Get a single asset's details by its ID
router.get('/:id', verifyToken, authorizeRoles('admin', 'hr'), assetController.getAssetById);

// 5. Register/Create a new company asset
router.post('/', verifyToken, authorizeRoles('admin', 'hr'), assetController.createAsset);

// 6. Update general asset specifications
router.put('/:id', verifyToken, authorizeRoles('admin', 'hr'), assetController.updateAsset);

// 7. Add a text comment log to an asset's history trail
router.post('/:id/comment', verifyToken, authorizeRoles('admin', 'hr'), assetController.addComment);

// 8. Flag an asset as damaged and link it to a user account
router.put('/:id/damage', verifyToken, authorizeRoles('admin', 'hr'), assetController.markDamaged);

// 9. Completely delete/remove an asset from inventory
router.delete('/:id', verifyToken, authorizeRoles('admin', 'hr'), assetController.deleteAsset);

module.exports = router;