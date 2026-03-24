const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const aiService = require('../services/aiService');

/**
 * 发送消息（流式版本）
 */
exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { msgContent, msgType = 'text', conversationId } = req.body;

    // 参数验证
    if (!msgContent) {
      return res.status(400).json({
        code: 400,
        message: '消息内容不能为空'
      });
    }

    if (!conversationId) {
      return res.status(400).json({
        code: 400,
        message: '缺少对话ID'
      });
    }

    // 验证对话所有者
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || conversation.user_id !== userId) {
      return res.status(403).json({
        code: 403,
        message: '无权访问此对话'
      });
    }

    // 保存用户消息
    const userMessage = await Message.create({
      userId,
      conversationId,
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

    // 设置SSE响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // 立刻返回用户消息
    res.write(`data: ${JSON.stringify({type:'userMessage',data:{id:userMessage.id,msgContent:userMessage.content,msgType:userMessage.messageType,fromUserId:userMessage.fromUserId,time:userMessage.createdAt}})}\n\n`);

    // 获取此对话的完整消息历史
    const conversationHistory = await Message.findByConversationId(conversationId, 1, 100);
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

    // 流式调用千问 API
    let fullAIReply = '';
    let aiMessageId = null;

    try {
      for await (const chunk of aiService.chatStream(messages, {
        temperature: 0.7,
        max_tokens: 500
      })) {
        if (chunk.type === 'content') {
          // 内容块：实时流式返回给前端
          fullAIReply += chunk.content;
          res.write(`data: ${JSON.stringify({type:'aiChunk',data:{content:chunk.content}})}\n\n`);
        } else if (chunk.type === 'done') {
          // 流式完成
          res.write(`data: ${JSON.stringify({type:'aiDone',data:{totalTokens:chunk.usage?chunk.usage.total_tokens:null}})}\n\n`);
        } else if (chunk.type === 'error') {
          // 错误处理
          res.write(`data: ${JSON.stringify({type:'aiError',data:{message:chunk.content}})}\n\n`);
        }
      }

      // 流式完成后，保存完整的AI消息
      const aiMessage = await Message.create({
        userId,
        conversationId,
        content: fullAIReply || '（无法生成回复）',
        messageType: msgType,
        fromUserId: 0  // AI 回复，fromUserId为0
      });
      aiMessageId = aiMessage.id;

      // 更新对话的最后更新时间
      await Conversation.updateTitle(conversationId, conversation.title);

      // 最后返回完整数据
      res.write(`data: ${JSON.stringify({type:'complete',data:{aiMessage:{id:aiMessage.id,msgContent:aiMessage.content,msgType:aiMessage.messageType,fromUserId:aiMessage.fromUserId,time:aiMessage.createdAt}}})}\n\n`);

      res.end();
    } catch (aiError) {
      console.error('AI 流式调用错误:', aiError);
      
      // 返回错误
      res.write(`data: ${JSON.stringify({\
        type: 'error',
        data: {\
          message: 'AI 服务出错: ' + aiError.message
        }
      })}\n\n`);
      
      res.end();
    }
  } catch (error) {
    console.error('发送消息错误:', error);
    
    // 响应未开始则返回JSON错误
    if (!res.headersSent) {
      return res.status(500).json({
        code: 500,
        message: '发送消息失败: ' + error.message
      });
    } else {
      // 已发送响应则通过SSE返回错误
      res.write(`data: ${JSON.stringify({type:'error',data:{message:'系统错误: '+error.message}})}\n\n`);
      res.end();
    }
  }
};

/**
 * 获取消息列表（分页）
 * 支持按对话ID查询或按用户ID查询
 */
exports.getMessageList = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversationId = req.query.conversationId;
    const current = parseInt(req.query.current) || 1;
    const size = parseInt(req.query.size) || 20;

    if (current < 1 || size < 1) {
      return res.status(400).json({
        code: 400,
        message: '分页参数无效'
      });
    }

    let result;

    if (conversationId) {
      // 查询特定对话的消息
      const conversation = await Conversation.findById(conversationId);
      if (!conversation || conversation.user_id !== userId) {
        return res.status(403).json({
          code: 403,
          message: '无权访问此对话'
        });
      }
      result = await Message.findByConversationId(conversationId, current, size);
    } else {
      // 查询用户所有消息（不分对话）
      result = await Message.findByUserId(userId, current, size);
    }

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
