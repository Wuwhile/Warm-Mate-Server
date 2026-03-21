const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * 注册接口
 * POST /register
 * 请求体: { username, password, phone, email? }
 */
router.post('/register', userController.register);

/**
 * 登录接口
 * POST /login
 * 请求体: { username, password }
 */
router.post('/login', userController.login);

/**
 * 获取用户信息（需要认证）
 * GET /user/info
 * 请求头: Authorization: Bearer <token>
 */
router.get('/user/info', authenticateToken, userController.getUserInfo);

/**
 * 更新用户信息（需要认证）
 * PUT /user/info
 * 请求头: Authorization: Bearer <token>
 * 请求体: { username?, phone?, email? }
 */
router.put('/user/info', authenticateToken, userController.updateUserInfo);

module.exports = router;
