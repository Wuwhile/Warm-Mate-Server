const jwt = require('jsonwebtoken');

/**
 * JWT认证中间件
 * 检查请求头中的Authorization token
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['access-token'] || req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      code: 401,
      message: '访问令牌缺失，请先登录'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key', (err, user) => {
    if (err) {
      return res.status(403).json({
        code: 403,
        message: '访问令牌无效或已过期'
      });
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
