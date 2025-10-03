const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

 
router.get('/users', authenticate, authorize('ADMIN'), adminController.getAllUsers);

 
router.put('/user/:id/role', authenticate, authorize('ADMIN'), adminController.updateRole);

 
router.delete('/user/:id', authenticate, authorize('ADMIN'), adminController.deleteUser);

module.exports = router;
