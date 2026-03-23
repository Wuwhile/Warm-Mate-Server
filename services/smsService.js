const crypto = require('crypto');
const querystring = require('querystring');
const axios = require('axios');

/**
 * 阿里云短信服务模块
 * 使用阿里云短信API发送验证码
 */

// 阿里云SMS接口配置
const ALIYUN_SMS_CONFIG = {
  accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID || '',
  accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET || '',
  signName: process.env.SMS_SIGN_NAME || '速通互联验证服务',
  templateCode: process.env.SMS_TEMPLATE_CODE || '100003',
  endpoint: 'https://dysmsapi.aliyuncs.com/'
};

/**
 * 对字符串进行URL编码
 */
function percentEncode(str) {
  let result = encodeURIComponent(str);
  result = result.replace(/\+/g, '%20');
  result = result.replace(/\*/g, '%2A');
  result = result.replace(/%7E/g, '~');
  return result;
}

/**
 * 生成签名
 */
function generate(stringToSign, accessKeySecret) {
  const key = accessKeySecret + '&';
  const hmac = crypto.createHmac('sha1', key);
  hmac.update(stringToSign, 'utf8');
  return hmac.digest('base64');
}

/**
 * 发送验证码短信
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
    const params = {
      'Action': 'SendSms',
      'Format': 'JSON',
      'RegionId': 'cn-hangzhou',
      'SignName': ALIYUN_SMS_CONFIG.signName,
      'TemplateCode': ALIYUN_SMS_CONFIG.templateCode,
      'PhoneNumbers': phoneNumber,
      'TemplateParam': JSON.stringify({ code: verificationCode }),
      'Timestamp': new Date().toISOString(),
      'SignatureMethod': 'HMAC-SHA1',
      'SignatureVersion': '1.0',
      'SignatureNonce': Math.random().toString(36).substring(2, 15),
      'Version': '2017-05-25',
      'AccessKeyId': ALIYUN_SMS_CONFIG.accessKeyId
    };

    // 对参数按字母顺序排序
    const sortedParams = {};
    Object.keys(params).sort().forEach(key => {
      sortedParams[key] = params[key];
    });

    // 构造规范化的查询字符串
    let canonicalizedQueryString = '';
    Object.keys(sortedParams).forEach((key, index) => {
      if (index > 0) {
        canonicalizedQueryString += '&';
      }
      canonicalizedQueryString += `${percentEncode(key)}=${percentEncode(sortedParams[key])}`;
    });

    // 构造待签名的字符串
    const stringToSign = `POST&${percentEncode('/')}&${percentEncode(canonicalizedQueryString)}`;

    console.log('签名字符串:', stringToSign);

    // 生成签名
    const signature = generate(stringToSign, ALIYUN_SMS_CONFIG.accessKeySecret);

    // 构造最终的请求URL
    const requestUrl = `${ALIYUN_SMS_CONFIG.endpoint}?Signature=${encodeURIComponent(signature)}&${canonicalizedQueryString}`;

    console.log('发送短信请求到:', ALIYUN_SMS_CONFIG.endpoint);
    
    // 发送POST请求
    const response = await axios.post(ALIYUN_SMS_CONFIG.endpoint, canonicalizedQueryString + `&Signature=${encodeURIComponent(signature)}`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 10000
    });

    console.log('阿里云短信API响应:', response.data);

    if (response.data.Code === 'OK') {
      return {
        success: true,
        message: '验证码发送成功',
        code: 200,
        verificationCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined,
        requestId: response.data.RequestId
      };
    } else {
      return {
        success: false,
        message: `发送失败: ${response.data.Message || response.data.Code}`,
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
