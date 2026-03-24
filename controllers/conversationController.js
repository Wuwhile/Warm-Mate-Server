const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

/**
 * 创建新对话
 */
exports.createConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title } = req.body;

    const conversation = await Conversation.create({
      userId,
      title: title || '新对话'
    });

    return res.json({
      code: 200,
      message: '对话创建成功',
      data: conversation
    });
  } catch (error) {
    console.error('创建对话错误:', error);
    return res.status(500).json({
      code: 500,
      message: '创建对话失败: ' + error.message
    });
  }
};

/**
 * 获取用户的对话列表
 */
exports.getConversationList = async (req, res) => {
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

    // 获取对话列表
    const result = await Conversation.findByUserId(userId, current, size);

    // 为每个对话添加最后一条消息的预览
    const conversations = await Promise.all(result.records.map(async (conv) => {
      const messages = await Message.findByConversationId(conv.id, 1, 1);
      const lastMessage = messages.records[0];
      
      return {
        ...conv,
        lastMessage: lastMessage ? lastMessage.msgContent : '',
        messageCount: messages.total
      };
    }));

    return res.json({
      code: 200,
      message: '获取对话列表成功',
      data: {
        records: conversations,
        total: result.total,
        size: result.size,
        current: result.current,
        pages: result.pages
      }
    });
  } catch (error) {
    console.error('获取对话列表错误:', error);
    return res.status(500).json({
      code: 500,
      message: '获取对话列表失败: ' + error.message
    });
  }
};

/**
 * 获取对话详情和消息
 */
exports.getConversationDetail = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversationId = req.params.id;
    const current = parseInt(req.query.current) || 1;
    const size = parseInt(req.query.size) || 20;

    // 验证对话所有者
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || conversation.user_id !== userId) {
      return res.status(403).json({
        code: 403,
        message: '无权访问此对话'
      });
    }

    // 获取对话的消息列表
    const result = await Message.findByConversationId(conversationId, current, size);

    return res.json({
      code: 200,
      message: '获取对话详情成功',
      data: {
        conversation,
        messages: result
      }
    });
  } catch (error) {
    console.error('获取对话详情错误:', error);
    return res.status(500).json({
      code: 500,
      message: '获取对话详情失败: ' + error.message
    });
  }
};

/**
 * 删除对话
 */
exports.deleteConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversationId = req.params.id;

    // 验证对话所有者
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || conversation.user_id !== userId) {
      return res.status(403).json({
        code: 403,
        message: '无权删除此对话'
      });
    }

    // 删除对话（会级联删除所有消息）
    await Conversation.deleteById(conversationId);

    return res.json({
      code: 200,
      message: '对话删除成功'
    });
  } catch (error) {
    console.error('删除对话错误:', error);
    return res.status(500).json({
      code: 500,
      message: '删除对话失败: ' + error.message
    });
  }
};

/**
 * 更新对话标题
 */
exports.updateConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversationId = req.params.id;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        code: 400,
        message: '标题不能为空'
      });
    }

    // 验证对话所有者
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || conversation.user_id !== userId) {
      return res.status(403).json({
        code: 403,
        message: '无权修改此对话'
      });
    }

    // 更新对话标题
    await Conversation.updateTitle(conversationId, title);

    return res.json({
      code: 200,
      message: '对话标题更新成功'
    });
  } catch (error) {
    console.error('更新对话标题错误:', error);
    return res.status(500).json({
      code: 500,
      message: '更新对话标题失败: ' + error.message
    });
  }
};
