const axios = require('axios');
const crypto = require('crypto');

/**
 * 阿里云短信服务模块
 * 使用阿里云短信API发送验证码
 */

// 阿里云SMS接口配置
const ALIYUN_SMS_CONFIG = {
  endpoint: 'https://dysmsapi.aliyuncs.com/',
  regionId: 'cn-hangzhou',
  accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID || '',
  accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET || '',
  signName: process.env.SMS_SIGN_NAME || '速通互联验证服务', // 短信签名
  templateCode: process.env.SMS_TEMPLATE_CODE || '100003' // 重置密码模板CODE
};

/**
 * 生成阿里云API请求签名
 */
function generateSignature(stringToSign, accessKeySecret) {
  const secretBuf = Buffer.from(accessKeySecret + '&', 'utf8');
  return crypto
    .createHmac('sha1', secretBuf)
    .update(stringToSign, 'utf8')
    .digest('base64');
}

/**
 * 发送验证码短信
 * @param {string} phoneNumber - 手机号
 * @param {string} verificationCode - 验证码（如果不提供则生成）
 * @returns {Promise} 返回是否发送成功和验证码
 */
async function sendVerificationCode(phoneNumber, verificationCode = null) {
  try {
    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phoneNumber)) {
      return {
        success: false,
        message: '手机号格式不正确',
        code: 400
      };
    }

    // 生成验证码（6位数字）
    if (!verificationCode) {
      verificationCode = Math.floor(Math.random() * 900000 + 100000).toString();
    }

    // 构建请求参数
    const timestamp = new Date().toISOString();
    const nonce = Math.random().toString(36).substring(2, 15);

    const params = {
      Action: 'SendSms',
      Format: 'JSON',
      RegionId: ALIYUN_SMS_CONFIG.regionId,
      Timestamp: timestamp,
      Version: '2017-05-25',
      SignName: ALIYUN_SMS_CONFIG.signName,
      TemplateCode: ALIYUN_SMS_CONFIG.templateCode,
      PhoneNumbers: phoneNumber,
      TemplateParam: JSON.stringify({ code: verificationCode }),
      SignatureMethod: 'HMAC-SHA1',
      SignatureVersion: '1.0',
      AccessKeyId: ALIYUN_SMS_CONFIG.accessKeyId,
      SignatureNonce: nonce
    };

    // 生成签名
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');

    const stringToSign = `POST&${encodeURIComponent('/')}&${encodeURIComponent(sortedParams)}`;
    const signature = generateSignature(stringToSign, ALIYUN_SMS_CONFIG.accessKeySecret);
    params.Signature = signature;

    // 发送请求
    const response = await axios.post(
      ALIYUN_SMS_CONFIG.endpoint,
      new URLSearchParams(params).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000
      }
    );

    console.log('阿里云短信API响应:', response.data);

    if (response.data.Code === 'OK') {
      return {
        success: true,
        message: '验证码发送成功',
        code: 200,
        verificationCode: verificationCode, // 开发环境返回，生产环境应该移除
        requestId: response.data.RequestId
      };
    } else {
      return {
        success: false,
        message: `发送失败: ${response.data.Message}`,
        code: 500,
        errorCode: response.data.Code
      };
    }
  } catch (error) {
    console.error('短信发送错误:', error.message);
    return {
      success: false,
      message: `短信发送异常: ${error.message}`,
      code: 500
    };
  }
}

/**
 * 在生产环境中，应该缓存验证码到Redis
 * 这里演示使用内存存储（生产环境不推荐）
 */
const verificationCodeCache = new Map();

/**
 * 存储验证码（带过期时间：5分钟）
 */
function cacheVerificationCode(phoneNumber, code) {
  const key = `sms_code_${phoneNumber}`;
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5分钟后过期
  verificationCodeCache.set(key, {
    code,
    expiresAt,
    attempts: 0 // 验证尝试次数
  });
}

/**
 * 验证验证码
 */
function verifyCode(phoneNumber, code) {
  const key = `sms_code_${phoneNumber}`;
  const cached = verificationCodeCache.get(key);

  if (!cached) {
    return {
      success: false,
      message: '验证码已过期或不存在，请重新请求'
    };
  }

  // 检查是否过期
  if (Date.now() > cached.expiresAt) {
    verificationCodeCache.delete(key);
    return {
      success: false,
      message: '验证码已过期，请重新请求'
    };
  }

  // 检查尝试次数（防暴力破解）
  if (cached.attempts >= 5) {
    verificationCodeCache.delete(key);
    return {
      success: false,
      message: '验证次数过多，请重新请求验证码'
    };
  }

  // 验证码检查
  if (cached.code === code) {
    verificationCodeCache.delete(key);
    return {
      success: true,
      message: '验证码正确'
    };
  }

  // 更新尝试次数
  cached.attempts++;
  return {
    success: false,
    message: '验证码错误'
  };
}

module.exports = {
  sendVerificationCode,
  cacheVerificationCode,
  verifyCode
};
