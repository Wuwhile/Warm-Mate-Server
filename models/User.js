const bcrypt = require('bcryptjs');
const pool = require('../config/database');

class User {
  /**
   * 创建用户
   */
  static async create(userData) {
    const { username, password, phone, email } = userData;
    
    // 密码哈希处理
    const hashedPassword = await bcrypt.hash(password, 10);

    const conn = await pool.getConnection();
    try {
      const [result] = await conn.execute(
        'INSERT INTO users (username, password, phone, email) VALUES (?, ?, ?, ?)',
        [username, hashedPassword, phone, email]
      );
      return { id: result.insertId, username, phone, email };
    } finally {
      conn.release();
    }
  }

  /**
   * 根据用户名查找用户
   */
  static async findByUsername(username) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      return rows.length > 0 ? rows[0] : null;
    } finally {
      conn.release();
    }
  }

  /**
   * 根据手机号查找用户
   */
  static async findByPhone(phone) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        'SELECT * FROM users WHERE phone = ?',
        [phone]
      );
      return rows.length > 0 ? rows[0] : null;
    } finally {
      conn.release();
    }
  }

  /**
   * 根据用户名或手机号查找用户
   */
  static async findByUsernameOrPhone(usernameOrPhone) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        'SELECT * FROM users WHERE username = ? OR phone = ?',
        [usernameOrPhone, usernameOrPhone]
      );
      return rows.length > 0 ? rows[0] : null;
    } finally {
      conn.release();
    }
  }

  /**
  static async findById(id) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute(
        'SELECT id, username, phone, email, created_at FROM users WHERE id = ?',
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } finally {
      conn.release();
    }
  }

  /**
   * 验证密码
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * 更新用户信息
   */
  static async update(id, userData) {
    const conn = await pool.getConnection();
    try {
      const { phone, email, username } = userData;
      await conn.execute(
        'UPDATE users SET phone = ?, email = ?, username = ? WHERE id = ?',
        [phone, email, username, id]
      );
      return await this.findById(id);
    } finally {
      conn.release();
    }
  }

  /**
   * 删除用户
   */
  static async delete(id) {
    const conn = await pool.getConnection();
    try {
      await conn.execute('DELETE FROM users WHERE id = ?', [id]);
      return true;
    } finally {
      conn.release();
    }
  }
}

module.exports = User;
