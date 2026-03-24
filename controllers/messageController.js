const Message = require('../models/Message');

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
      messageType: msgType
    });

    if (!userMessage) {
      return res.status(500).json({
        code: 500,
        message: '保存消息失败'
      });
    }

    // 获取 AI 回复（模拟或调用真实 AI 服务）
    const aiReply = await getAIReply(msgContent);

    return res.json({
      code: 200,
      message: '消息发送成功',
      data: {
        id: userMessage.id,
        msgContent: aiReply,
        msgType: msgType,
        time: new Date()
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

/**
 * 获取 AI 回复
 * 这里实现简单的模拟 AI 回复
 * 真实场景可以调用真实 AI 服务（如 OpenAI、讯飞等）
 */
async function getAIReply(userMessage) {
  // 模拟 AI 回复
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

  // 随机返回一个回复
  return replies[Math.floor(Math.random() * replies.length)];
}

// 如果要集成真实 AI 服务（例如 OpenAI）
// async function getAIReplyFromOpenAI(userMessage) {
//   try {
//     const response = await fetch('https://api.openai.com/v1/chat/completions', {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({
//         model: 'gpt-3.5-turbo',
//         messages: [
//           { role: 'system', content: '你是一个心理健康咨询助手，提供友好和有帮助的回复。' },
//           { role: 'user', content: userMessage }
//         ],
//         temperature: 0.7,
//         max_tokens: 200
//       })
//     });
//
//     const data = await response.json();
//     return data.choices[0].message.content;
//   } catch (error) {
//     console.error('OpenAI API 错误:', error);
//     return '抱歉，我现在无法响应。请稍后再试。';
//   }
// }
