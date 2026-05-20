const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { verifyToken, checkPermission } = require('../middlewares/auth');

// 1. Get full asset inventory list
router.get('/', verifyToken, checkPermission('asset.view'), assetController.listAssets);

// 2. Get asset analytics summary (total vs damaged)
router.get('/summary', verifyToken, checkPermission('asset.view'), assetController.summary);

// 3. Get all damages logged against a specific user
router.get('/user/:userId', verifyToken, checkPermission('asset.view'), assetController.employeeDamages);

// 4. Get a single asset's details by its ID
router.get('/:id', verifyToken, checkPermission('asset.view'), assetController.getAssetById);

// 5. Register/Create a new company asset
router.post('/', verifyToken, checkPermission('asset.create'), assetController.createAsset);

// 6. Update general asset specifications
router.put('/:id', verifyToken, checkPermission('asset.edit'), assetController.updateAsset);

// 7. Add a text comment log to an asset's history trail
router.post('/:id/comment', verifyToken, checkPermission('asset.edit'), assetController.addComment);

// 8. Flag an asset as damaged and link it to a user account
router.put('/:id/damage', verifyToken, checkPermission('asset.edit'), assetController.markDamaged);

// 9. Completely delete/remove an asset from inventory
router.delete('/:id', verifyToken, checkPermission('asset.delete'), assetController.deleteAsset);

module.exports = router;