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

/**
 * 获取登录日志（需要认证）
 * GET /user/login-logs?page=1&limit=10
 * 请求头: Authorization: Bearer <token>
 */
router.get('/user/login-logs', authenticateToken, userController.getLoginLogs);

/**
 * 获取最近的登录记录（需要认证）
 * GET /user/login-logs/latest?limit=5
 * 请求头: Authorization: Bearer <token>
 */
router.get('/user/login-logs/latest', authenticateToken, userController.getLatestLoginLogs);

/**
 * 删除指定登录日志（需要认证）
 * POST /user/login-logs/delete
 * 请求头: Authorization: Bearer <token>
 * 请求体: { logId }
 */
router.post('/user/login-logs/delete', authenticateToken, userController.deleteLoginLog);

/**
 * 清空所有登录日志（需要认证）
 * POST /user/login-logs/clear
 * 请求头: Authorization: Bearer <token>
 */
router.post('/user/login-logs/clear', authenticateToken, userController.clearLoginLogs);

/**
 * 修改密码（需要认证）
 * POST /user/password/change
 * 请求头: Authorization: Bearer <token>
 * 请求体: { oldPassword, newPassword }
 */
router.post('/user/password/change', authenticateToken, userController.changePassword);

/**
 * 发送邮箱验证码（需要认证）
 * POST /user/email/code
 * 请求头: Authorization: Bearer <token>
 * 请求体: { email }
 */
router.post('/user/email/code', authenticateToken, userController.sendEmailCode);

/**
 * 更新邮箱（需要认证）
 * PUT /user/email
 * 请求头: Authorization: Bearer <token>
 * 请求体: { email, code }
 */
router.put('/user/email', authenticateToken, userController.updateEmail);

/**
 * 发送手机验证码（需要认证）
 * POST /user/phone/code
 * 请求头: Authorization: Bearer <token>
 * 请求体: { phone }
 */
router.post('/user/phone/code', authenticateToken, userController.sendPhoneCode);

/**
 * 更新手机号（需要认证）
 * PUT /user/phone
 * 请求头: Authorization: Bearer <token>
 * 请求体: { phone, code }
 */
router.put('/user/phone', authenticateToken, userController.updatePhone);

/**
 * 获取账户信息（需要认证）
 * GET /user/account
 * 请求头: Authorization: Bearer <token>
 */
router.get('/user/account', authenticateToken, userController.getUserInfo);

module.exports = router;
