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
    // 检查手机号是否已被注册
    const existingPhone = await User.findByPhone(phone);
    if (existingPhone) {
      return res.status(200).json({
        code: 409,
        message: '该手机号已被注册'
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
      return res.status(200).json({
        code: 400,
        message: '用户名和密码为必填项'
      });
    }

    // 查找用户（支持用户名或手机号）
    const user = await User.findByUsernameOrPhone(username);
    if (!user) {
      return res.status(200).json({
        code: 401,
        message: '用户名/手机号或密码错误'
      });
    }

    // 验证密码
    const isPasswordValid = await User.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(200).json({
        code: 401,
        message: '用户名/手机号或密码错误'
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
        uid: 100000000 + user.id,
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

    // 只更新请求中实际提供的字段
    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        code: 400,
        message: '至少需要提供一个字段来更新'
      });
    }

    const updatedUser = await User.update(userId, updateData);

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

/**
 * 发送邮箱验证码
 */
exports.sendEmailCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        code: 400,
        message: '邮箱不能为空'
      });
    }

    // 简单验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        code: 400,
        message: '邮箱格式不正确'
      });
    }

    // 生成6位随机验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 这里应该调用邮件服务发送验证码
    // 为了演示，我们将验证码存储在内存中（实际应该用Redis）
    global.emailVerificationCode = {
      email,
      code,
      expires: Date.now() + 5 * 60 * 1000 // 5分钟过期
    };

    console.log(`发送邮箱验证码给 ${email}: ${code}`);

    return res.json({
      code: 200,
      message: '验证码已发送到邮箱'
    });
  } catch (error) {
    console.error('发送邮箱验证码错误:', error);
    return res.status(500).json({
      code: 500,
      message: '发送验证码失败: ' + error.message
    });
  }
};

/**
 * 更新邮箱
 */
exports.updateEmail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, code } = req.body;

    if (!email) {
      return res.status(400).json({
        code: 400,
        message: '邮箱不能为空'
      });
    }

    // 如果提供了验证码，则验证
    if (code) {
      if (!global.emailVerificationCode || 
          global.emailVerificationCode.email !== email ||
          global.emailVerificationCode.code !== code ||
          global.emailVerificationCode.expires < Date.now()) {
        return res.status(400).json({
          code: 400,
          message: '验证码无效或已过期'
        });
      }
      delete global.emailVerificationCode;
    }

    const updatedUser = await User.update(userId, {
      email: email
    });

    return res.json({
      code: 200,
      message: '邮箱更新成功',
      data: updatedUser
    });
  } catch (error) {
    console.error('更新邮箱错误:', error);
    return res.status(500).json({
      code: 500,
      message: '更新邮箱失败: ' + error.message
    });
  }
};

/**
 * 发送手机验证码
 */
exports.sendPhoneCode = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        code: 400,
        message: '手机号不能为空'
      });
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        code: 400,
        message: '手机号格式不正确'
      });
    }

    // 生成6位随机验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 这里应该调用短信服务发送验证码
    // 为了演示，我们将验证码存储在内存中
    global.phoneVerificationCode = {
      phone,
      code,
      expires: Date.now() + 5 * 60 * 1000 // 5分钟过期
    };

    console.log(`发送手机验证码给 ${phone}: ${code}`);

    return res.json({
      code: 200,
      message: '验证码已发送到手机'
    });
  } catch (error) {
    console.error('发送手机验证码错误:', error);
    return res.status(500).json({
      code: 500,
      message: '发送验证码失败: ' + error.message
    });
  }
};

/**
 * 更新手机号
 */
exports.updatePhone = async (req, res) => {
  try {
    const userId = req.user.id;
    const { phone, code } = req.body;

    if (!phone) {
      return res.status(400).json({
        code: 400,
        message: '手机号不能为空'
      });
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        code: 400,
        message: '手机号格式不正确'
      });
    }

    // 验证验证码
    if (!code || !global.phoneVerificationCode ||
        global.phoneVerificationCode.phone !== phone ||
        global.phoneVerificationCode.code !== code ||
        global.phoneVerificationCode.expires < Date.now()) {
      return res.status(400).json({
        code: 400,
        message: '验证码无效或已过期'
      });
    }

    delete global.phoneVerificationCode;

    const updatedUser = await User.update(userId, {
      phone: phone
    });

    return res.json({
      code: 200,
      message: '手机号更新成功',
      data: updatedUser
    });
  } catch (error) {
    console.error('更新手机号错误:', error);
    return res.status(500).json({
      code: 500,
      message: '更新手机号失败: ' + error.message
    });
  }
};
