const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * 用户注册
 */
exports.register = async (req, res) => {
  try {
    const { username, password, phone, email } = req.body;

    // 参数验证
    if (!username || !password || !phone) {
      return res.status(400).json({
        code: 400,
        message: '用户名、密码和手机号为必填项'
      });
    }

    // 检查用户是否已存在
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({
        code: 409,
        message: '用户名已存在'
      });
    }

    // 创建用户
    const newUser = await User.create({
      username,
      password,
      phone,
      email: email || null
    });

    return res.status(201).json({
      code: 200,
      message: '注册成功',
      data: newUser
    });
  } catch (error) {
    console.error('注册错误:', error);
    return res.status(500).json({
      code: 500,
      message: '注册失败: ' + error.message
    });
  }
};

/**
 * 用户登录
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 参数验证
    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        message: '用户名和密码为必填项'
      });
    }

    // 查找用户
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      });
    }

    // 验证密码
    const isPasswordValid = await User.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      });
    }

    // 生成JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '7d' }
    );

    return res.json({
      code: 200,
      message: '登录成功',
      data: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        email: user.email,
        token: token
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    return res.status(500).json({
      code: 500,
      message: '登录失败: ' + error.message
    });
  }
};

/**
 * 获取用户信息
 */
exports.getUserInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    return res.json({
      code: 200,
      message: '获取成功',
      data: user
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    return res.status(500).json({
      code: 500,
      message: '获取用户信息失败: ' + error.message
    });
  }
};

/**
 * 更新用户信息
 */
exports.updateUserInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, phone, email } = req.body;

    const updatedUser = await User.update(userId, {
      username: username || null,
      phone: phone || null,
      email: email || null
    });

    return res.json({
      code: 200,
      message: '更新成功',
      data: updatedUser
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    return res.status(500).json({
      code: 500,
      message: '更新用户信息失败: ' + error.message
    });
  }
};
