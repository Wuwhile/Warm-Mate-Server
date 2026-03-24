const axios = require('axios');

/**
 * 调用千问 AI 服务
 */
class AIService {
  constructor() {
    this.apiKey = process.env.DASHSCOPE_API_KEY;
    this.baseUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
    this.model = 'qwen-plus';
    
    if (!this.apiKey) {
      console.warn('⚠️ DASHSCOPE_API_KEY 未设置，AI 功能将不可用');
    }
  }

  /**
   * 调用千问 Chat API
   * @param {Array} messages - 对话历史，格式：[{role: 'user|assistant|system', content: '文本'}]
   * @param {Object} options - 可选参数
   * @returns {Promise<string>} AI 回复
   */
  async chat(messages, options = {}) {
    try {
      // 验证 API Key
      if (!this.apiKey) {
        console.error('DASHSCOPE_API_KEY 未配置，无法调用 AI 服务');
        // 返回备选回复
        return this.getFallbackReply();
      }

      // 构建请求体
      const requestBody = {
        model: this.model,
        messages: messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 1024,
        top_p: options.top_p || 0.8
      };

      // 发送请求
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      // 提取回复
      if (response.data && response.data.choices && response.data.choices[0]) {
        const aiReply = response.data.choices[0].message.content;
        console.log('✓ 千问 AI 回复成功');
        return aiReply;
      } else {
        console.error('千问 API 响应格式异常:', response.data);
        return this.getFallbackReply();
      }
    } catch (error) {
      console.error('调用千问 API 失败:', error.message);
      if (error.response) {
        console.error('API 错误响应:', error.response.data);
      }
      // 返回备选回复
      return this.getFallbackReply();
    }
  }

  /**
   * 获取备选回复（当 API 调用失败时使用）
   */
  getFallbackReply() {
    const replies = [
      '我理解你的感受。你想和我聊些什么呢？',
      '这听起来很有趣。你能告诉我更多信息吗？',
      '我想更好地理解你的想法。能详细解释一下吗？',
      '你这样想是很正常的。你有什么其他的想法吗？',
      '感谢你的分享。这对我们的对话很有帮助。',
      '我们一起分析一下这个问题的不同角度。',
      '你是否考虑过这个问题的另一个方面呢？',
      '通过你的描述，我能感受到你的真实想法。',
      '你觉得什么时候开始感受到这种变化的？',
      '这是一个很好的观点。你能进一步说明吗？'
    ];

    return replies[Math.floor(Math.random() * replies.length)];
  }
}

module.exports = new AIService();
