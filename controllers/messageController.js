const Message = require('../models/Message');
const aiService = require('../services/aiService');

/**
 * 发送消息
 */
exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { msgContent, msgType = 'text' } = req.body;

    // 参数验证
    if (!msgContent) {
      return res.status(400).json({
        code: 400,
        message: '消息内容不能为空'
      });
    }

    // 保存用户消息
    const userMessage = await Message.create({
      userId,
      content: msgContent,
      messageType: msgType,
      fromUserId: userId  // 用户发送，fromUserId为用户ID
    });

    if (!userMessage) {
      return res.status(500).json({
        code: 500,
        message: '保存消息失败'
      });
    }

    // 获取完整的对话历史（最近 20 条消息用于上下文）
    const conversationHistory = await Message.findByUserId(userId, 1, 100);
    const recentMessages = conversationHistory.records || [];
    
    // 构建 ChatGPT 格式的消息历史（用于千问 API）
    const messages = [];
    
    // 添加系统消息
    messages.push({
      role: 'system',
      content: '你是一个友善、富有同理心的心理健康咨询助手。你的目标是帮助用户理解他们的感受，提供支持和建议。请用温暖、非评判性的语言回应。'
    });

    // 添加历史消息（最多取最近 10 条，避免上下文过长）
    const historyToUse = recentMessages.slice(0, 10).reverse();
    for (const msg of historyToUse) {
      if (msg.id !== userMessage.id) {  // 不包含当前正在发送的新消息
        messages.push({
          role: msg.fromUserId === 0 ? 'assistant' : 'user',
          content: msg.msgContent || msg.content
        });
      }
    }

    // 添加当前用户消息
    messages.push({
      role: 'user',
      content: msgContent
    });

    // 调用千问 AI 获取回复
    const aiReply = await aiService.chat(messages, {
      temperature: 0.7,
      max_tokens: 500
    });

    // 保存 AI 回复消息
    const aiMessage = await Message.create({
      userId,
      content: aiReply,
      messageType: msgType,
      fromUserId: 0  // AI 回复，fromUserId为0
    });

    return res.json({
      code: 200,
      message: '消息发送成功',
      data: {
        userMessage: {
          id: userMessage.id,
          msgContent: userMessage.content,
          msgType: userMessage.messageType,
          fromUserId: userMessage.fromUserId,
          time: userMessage.createdAt
        },
        aiMessage: {
          id: aiMessage.id,
          msgContent: aiMessage.content,
          msgType: aiMessage.messageType,
          fromUserId: aiMessage.fromUserId,
          time: aiMessage.createdAt
        }
      }
    });
  } catch (error) {
    console.error('发送消息错误:', error);
    return res.status(500).json({
      code: 500,
      message: '发送消息失败: ' + error.message
    });
  }
};

/**
 * 获取消息列表（分页）
 */
exports.getMessageList = async (req, res) => {
  try {
    const userId = req.user.id;
    const current = parseInt(req.query.current) || 1;
    const size = parseInt(req.query.size) || 20;

    if (current < 1 || size < 1) {
      return res.status(400).json({
        code: 400,
        message: '分页参数无效'
      });
    }

    // 获取消息列表
    const result = await Message.findByUserId(userId, current, size);

    return res.json({
      code: 200,
      message: '获取消息成功',
      data: {
        records: result.records,
        total: result.total,
        size: result.size,
        current: result.current,
        pages: result.pages
      }
    });
  } catch (error) {
    console.error('获取消息列表错误:', error);
    return res.status(500).json({
      code: 500,
      message: '获取消息列表失败: ' + error.message
    });
  }
};
