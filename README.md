# Warm-Mate 后端服务器

🧠 **完整的Node.js心理健康平台后端** — 用户认证、AI对话、心理预约、在线问卷等完整解决方案

> **当前版本**: v1.0.3 | **最后更新**: 2026年3月25日

---

## 📦 核心功能

| 功能模块 | 描述 |
|--------|------|
| **👤 用户系统** | 注册、登录、个人资料管理、登录日志 |
| **💬 AI聊天** | 接入阿里云千问AI，提供心理咨询辅助 |
| **📋 心理问卷** | PHQ-9抑郁筛查、GAD-7焦虑筛查，自动评分 |
| **📅 心理预约** | 用户预约心理咨询服务 |
| **📱 短信验证** | 阿里云DYPNS集成，短信验证码、密码重置 |
| **🔐 JWT认证** | 安全的令牌认证，权限管理 |

---

## 📋 项目结构

```
warm-mate-server/
├── app.js                      # Express应用入口
├── package.json               # 依赖配置
├── .env.example               # 环境变量模板
│
├── config/
│   └── database.js            # 数据库连接配置
│
├── models/                     # 数据模型（MVC模式）
│   ├── User.js                # 用户数据模型
│   ├── LoginLog.js            # 登录日志
│   ├── Conversation.js        # AI对话记录
│   ├── Message.js             # 对话消息
│   ├── Appointment.js         # 心理预约
│   └── QuestionnaireResult.js # 问卷结果
│
├── controllers/               # 业务逻辑
│   ├── userController.js      # 用户服务
│   ├── messageController.js   # 消息/AI服务
│   ├── conversationController.js # 对话管理
│   ├── appointmentController.js  # 预约管理
│   └── questionnaireController.js # 问卷管理
│
├── routes/                    # API路由
│   ├── auth.js               # 认证路由
│   ├── message.js            # 消息路由
│   ├── conversation.js       # 对话路由
│   ├── appointment.js        # 预约路由
│   └── questionnaire.js      # 问卷路由
│
├── middleware/
│   └── auth.js               # JWT验证中间件
│
├── services/                 # 外部服务
│   ├── aiService.js          # 千问AI集成
│   └── smsService.js         # SMS短信服务
│
├── sql/                      # 数据库文件
│   ├── init.sql              # 初始化脚本
│   └── migrations/           # 迁移脚本
│       ├── 001_add_avatar_to_users.sql
│       ├── 002_change_avatar_url_to_longtext.sql
│       ├── 003_update_questionnaire_results_table.sql
│       ├── 004_create_appointments_table.sql
│       └── 005_add_user_id_to_appointments.sql
│
├── README.md                 # 📍 本文件
├── QUICKSTART.md             # 快速部署指南
├── DEPLOYMENT.md             # 完整部署文档
├── API.md                    # API详细文档
├── INTEGRATION.md            # 前后端集成指南
└── SMS_PASSWORD_RESET.md     # 短信验证功能文档
```

---

## 🚀 快速开始（本地开发）

### 环境要求
- **Node.js**: v16+
- **npm**: v8+
- **MySQL**: v5.7+

### 步骤

**1️⃣ 安装依赖**
```bash
npm install
```

**2️⃣ 环境配置**
```bash
cp .env.example .env
```

编辑 `.env` 文件，配置必要的变量（详见本文档末尾）

**3️⃣ 初始化数据库**
```bash
mysql -u root -p < sql/init.sql
```

**4️⃣ 启动服务**
```bash
# 开发环境（支持热重载）
npm run dev

# 生产环境
npm start
```

服务器运行在 `http://localhost:7001`

---

## 🌐 API 概览

**基础URL**: `http://localhost:7001/alibaba-ai/v1`

**完整 API 文档请查看** [API.md](API.md)

### 核心端点速查

| 方法 | 端点 | 认证 | 说明 |
|------|------|------|------|
| `POST` | `/register` | ❌ | 用户注册 |
| `POST` | `/login` | ❌ | 用户登录 |
| `GET` | `/user/info` | ✅ | 获取用户信息 |
| `PUT` | `/user/info` | ✅ | 更新用户信息 |
| `POST` | `/message` | ✅ | 发送消息/AI对话 |
| `GET` | `/conversation/:id/messages` | ✅ | 获取对话消息 |
| `POST` | `/appointment/create` | ✅ | 创建预约 |
| `POST` | `/questionnaire/phq9` | ✅ | 提交PHQ-9问卷 |
| `POST` | `/user/password/reset-code` | ❌ | 请求密码重置验证码 |

详细文档见 [API.md](API.md)

---

## ⚙️ 环境变量配置

创建 `.env` 文件并配置以下变量：

```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=warmmate
DB_PASSWORD=warmmate123@
DB_NAME=warm_mate

# 服务器配置
PORT=7001
NODE_ENV=development
API_PREFIX=/alibaba-ai/v1

# JWT认证
JWT_SECRET=your-secure-random-key-here
JWT_EXPIRES_IN=7d

# 阿里云千问AI
QIANWEN_API_KEY=your_dashscope_api_key
QIANWEN_MODEL=qwen-plus

# 阿里云短信服务（SMS）
ALIBABA_CLOUD_ACCESS_KEY_ID=your_access_key_id
ALIBABA_CLOUD_ACCESS_KEY_SECRET=your_access_key_secret
SMS_SIGN_NAME=your_sign_name
SMS_TEMPLATE_CODE=your_template_code
```

---

## 📚 完整文档导航

| 文档 | 用途 |
|-----|------|
| [API.md](API.md) | 📖 完整API参考文档 |
| [QUICKSTART.md](QUICKSTART.md) | ⚡ 5分钟本地开发或1小时ECS部署 |
| [DEPLOYMENT.md](DEPLOYMENT.md) | 🚀 详细的阿里云ECS部署步骤 |
| [INTEGRATION.md](INTEGRATION.md) | 🔗 前后端集成指南（Uni-app） |
| [SMS_PASSWORD_RESET.md](SMS_PASSWORD_RESET.md) | 📱 短信验证和密码重置功能 |

---

## 🔒 安全特性

### 身份认证
- **JWT令牌认证**: 安全的token-based认证
- **密码加密**: bcryptjs加密存储
- **有效期**: 默认7天

### 数据保护
- **参数化查询**: 防止SQL注入
- **访问控制**: 用户只能访问自己的数据
- **CORS配置**: 跨域资源共享安全管理

### 密码安全
- 长度: 6-16字符
- 支持: 字母、数字、特殊符号
- 密码修改需验证旧密码

---

## 🗄️ 数据库模式

### 核心表结构
```sql
-- 用户表
users (id, username, password, phone, email, avatar_url, created_at, updated_at)

-- 登录日志表
login_logs (id, user_id, ip_address, device_info, user_agent, login_time)

-- AI对话表
conversations (id, user_id, title, created_at, updated_at)

-- 对话消息表
messages (id, conversation_id, user_id, content, message_type, created_at)

-- 心理预约表
appointments (id, user_id, doctor_id, doctor_name, patient_name, ...)

-- 问卷结果表
questionnaire_results (id, user_id, questionnaire_name, score, level, result_data, created_at)
```

详见 [sql/init.sql](sql/init.sql)

---

## 🛠️ 开发工具命令

```bash
# 开发环境（热重载）
npm run dev

# 生产环境
npm start

# 安装依赖
npm install

# 检查版本
node -v && npm -v && mysql --version
```

---

## 📞 技术栈

- **后端框架**: Express.js 4.18
- **数据库**: MySQL 5.7+
- **认证**: JWT (jsonwebtoken)
- **密码加密**: bcryptjs
- **AI服务**: 阿里云千问 (Qiwen)
- **SMS服务**: 阿里云DYPNS
- **中间件**: CORS, body-parser, multer
- **开发工具**: nodemon

---

## 📊 项目状态

| 功能 | 状态 |
|-----|------|
| 用户认证 | ✅ 完成 |
| 用户信息管理 | ✅ 完成 |
| JWT认证 | ✅ 完成 |
| 登录日志 | ✅ 完成 |
| AI聊天集成 | ✅ 完成（千问） |
| 对话管理 | ✅ 完成 |
| 消息历史 | ✅ 完成 |
| 心理预约 | ✅ 完成 |
| 问卷系统 | ✅ 完成 |
| SMS短信验证 | ✅ 完成（DYPNS） |
| 密码重置 | ✅ 完成 |
| 头像上传 | ✅ 完成 |

---

## 🚀 快速开始

**想快速上手?** 前往 [QUICKSTART.md](QUICKSTART.md)

**想了解完整API?** 查看 [API.md](API.md)

**需要部署到云服务器?** 参照 [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 💡 常见问题

### Q: 如何修改数据库密码？
A: 编辑 `.env` 文件中的 `DB_PASSWORD` 字段

### Q: 如何新增一个API接口？
A: 
1. 在 `controllers/` 创建控制器方法
2. 在 `routes/` 添加路由
3. 在 [API.md](API.md) 中文档化

### Q: Token过期了怎么办？
A: 用户需重新登录获取新token。使用 `/login` 接口

### Q: 如何自定义AI模型？
A: 编辑 `services/aiService.js`，修改 `QIANWEN_MODEL` 环境变量

---

## 📝 版本历史

- **v1.0.3** (2026-03-25) - 文档完善、API规范统一
- **v1.0.2** (2026-03-22) - 添加短信验证功能
- **v1.0.1** (2026-03-21) - 初始版本发布
- **v1.0.0** (2026-03-20) - 项目启动

---

## 📄 许可证

ISC License

---

**需要帮助?** 查看完整文档或联系开发团队

成功响应 (201):
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "id": 1,
    "username": "张三",
    "phone": "13800138000",
    "email": "zhangsan@example.com"
  }
}
```

#### 登录
```
POST /login
Content-Type: application/json

{
  "username": "张三",
  "password": "password123"
}

成功响应 (200):
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "id": 1,
    "uid": 100000001,
    "username": "张三",
    "phone": "13800138000",
    "email": "zhangsan@example.com",
    "created_at": "2024-03-21T10:30:00Z",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### AI交流接口（需要认证）

#### 发送消息 / 获取AI回复
```
POST /message
Authorization: Bearer <token>
Content-Type: application/json

{
  "msgContent": "我最近感到很焦虑，该怎么办？",
  "msgType": "text",
  "conversationId": 1
}

成功响应 (200):
{
  "code": 200,
  "message": "消息发送成功",
  "data": {
    "userMessage": {
      "id": 1,
      "msgContent": "我最近感到很焦虑，该怎么办？",
      "msgType": "text",
      "fromUserId": 1,
      "time": "2026-03-25T10:30:00Z"
    },
    "aiMessage": {
      "id": 2,
      "msgContent": "焦虑是很正常的感受...",
      "msgType": "text",
      "fromUserId": 0,
      "time": "2026-03-25T10:30:05Z"
    }
  }
}
```

#### 获取消息历史
```
GET /message?conversationId=1&current=1&size=20
Authorization: Bearer <token>

成功响应 (200):
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "records": [
      {
        "id": 1,
        "conversationId": 1,
        "msgContent": "你好",
        "msgType": "text",
        "fromUserId": 1,
        "time": "2026-03-25T10:30:00Z"
      },
      ...
    ],
    "total": 100,
    "pages": 5,
    "current": 1,
    "size": 20
  }
}
```

### 对话管理接口（需要认证）

#### 创建新对话
```
POST /conversation
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "焦虑症咨询"
}

成功响应 (200):
{
  "code": 200,
  "message": "对话创建成功",
  "data": {
    "id": 1,
    "userId": 1,
    "title": "焦虑症咨询",
    "createdAt": "2026-03-25T10:30:00Z",
    "updatedAt": "2026-03-25T10:30:00Z"
  }
}
```

#### 获取对话列表
```
GET /conversation?current=1&size=20
Authorization: Bearer <token>

成功响应 (200):
{
  "code": 200,
  "message": "获取对话列表成功",
  "data": {
    "records": [
      {
        "id": 1,
        "title": "焦虑症咨询",
        "lastMessage": "你可以尝试深呼吸...",
        "messageCount": 15,
        "updatedAt": "2026-03-25T10:30:00Z"
      },
      ...
    ],
    "total": 10,
    "pages": 1,
    "current": 1,
    "size": 20
  }
}
```

#### 自动生成对话标题
```
POST /conversation/:id/generate-title
Authorization: Bearer <token>

成功响应 (200):
{
  "code": 200,
  "message": "生成标题成功",
  "data": {
    "title": "焦虑症管理方案"
  }
}
```

#### 删除对话
```
DELETE /conversation/:id
Authorization: Bearer <token>

成功响应 (200):
{
  "code": 200,
  "message": "对话删除成功"
}
```

### 预约管理接口（需要认证）

#### 创建预约
```
POST /appointment/saveAppointment
Authorization: Bearer <token>
Content-Type: application/json

{
  "doctorId": 1,
  "doctorName": "陈医生",
  "patientName": "张三",
  "patientAge": 28,
  "patientGender": "男",
  "patientPhone": "13800138000",
  "consultationContent": "焦虑症治疗咨询",
  "urgency": "较急",
  "timePreference": "周末下午"
}

成功响应 (201):
{
  "code": 200,
  "message": "预约申请已提交",
  "data": {
    "id": 1
  }
}
```

#### 获取当前用户的预约列表
```
GET /appointment/list
Authorization: Bearer <token>

成功响应 (200):
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "doctorId": 1,
      "doctorName": "陈医生",
      "patientName": "张三",
      "patientAge": 28,
      "patientGender": "男",
      "patientPhone": "13800138000",
      "consultationContent": "焦虑症治疗咨询",
      "urgency": "较急",
      "timePreference": "周末下午",
      "status": "待处理",
      "createTime": "2026-03-25T10:30:00Z"
    },
    ...
  ]
}
```

#### 获取预约详情
```
GET /appointment/:id
Authorization: Bearer <token>

成功响应 (200):
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "userId": 1,
    "doctorId": 1,
    "doctorName": "陈医生",
    ...
  }
}
```

#### 更新预约
```
PUT /appointment/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "已确认",
  "notes": "确认时间为周六下午2点"
}

成功响应 (200):
{
  "code": 200,
  "message": "预约更新成功"
}
```

#### 删除预约
```
DELETE /appointment/:id
Authorization: Bearer <token>

成功响应 (200):
{
  "code": 200,
  "message": "预约删除成功"
}
```

## 🔐 安全特性

### 数据隔离
- 用户预约数据通过 `user_id` 外键关联，确保用户只能访问自己的预约
- 对话和消息通过 userId 隔离，用户无法访问他人数据

### 认证与授权
- JWT令牌认证，默认有效期7天
- 令牌包含用户 id、username、phone 信息
- 所有受保护的接口都需要有效的Authorization header

### 请求验证
- 参数验证和格式检查
- 手机号格式验证（11位数字）
- 敏感操作的权限检查
        "user_agent": "Mozilla/5.0...",
        "login_time": "2026-03-22 15:30:45"
      },
      {
        "id": 2,
        "user_id": 1,
        "ip_address": "192.168.1.101",
        "device_info": "Android - Chrome",
        "user_agent": "Mozilla/5.0...",
        "login_time": "2026-03-22 10:20:30"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

#### 获取最近登录记录（需要认证）
```
GET /user/login-logs/latest?limit=5
Authorization: Bearer <token>

成功响应 (200):
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "ip_address": "192.168.1.100",
      "device_info": "iPhone 14 - Safari",
      "user_agent": "Mozilla/5.0...",
      "login_time": "2026-03-22 15:30:45"
    }
  ]
}
```

#### 删除登录日志（需要认证）
```
POST /user/login-logs/delete
Authorization: Bearer <token>
Content-Type: application/json

{
  "logId": 1
}

成功响应 (200):
{
  "code": 200,
  "message": "删除成功"
}
```

#### 清空所有登录日志（需要认证）
```
POST /user/login-logs/clear
Authorization: Bearer <token>

成功响应 (200):
{
  "code": 200,
  "message": "清空成功"
}
```

#### 修改密码（需要认证）
```
POST /user/password/change
Authorization: Bearer <token>
Content-Type: application/json

{
  "oldPassword": "oldpass123",
  "newPassword": "newpass456"
}

密码要求：
- 长度：6-16 个字符
- 只能包含字母、数字或符号（!@#$%^&*()_+-=[]{}；'："\\|,.<>/?）
- 新密码不能与旧密码相同

成功响应 (200):
{
  "code": 200,
  "message": "密码修改成功，请重新登录"
}

失败响应 (400):
{
  "code": 400,
  "message": "当前密码不正确" // 或其他错误信息
}
```

#### 发送找回密码验证码（不需要认证）
```
POST /user/password/reset-code
Content-Type: application/json

{
  "phone": "17661577859"
}

成功响应 (200):
{
  "code": 200,
  "message": "验证码已发送到您的手机",
  "data": {
    "verificationCode": "123456"  // 仅开发环境返回
  }
}

失败响应：
- 404：该手机号未注册
- 400：手机号格式不正确
- 500：短信发送失败（可能是频率限制：check frequency failed）

说明：
- 每个手机号的验证码有效期为 5 分钟
- 阿里云 SMS 服务有频率限制，单个手机号过于频繁请求会返回 "check frequency failed" 错误
- 建议在 UI 上实现 60 秒倒计时防止用户频繁点击
```

#### 重置密码（不需要认证）
```
POST /user/password/reset
Content-Type: application/json

{
  "phone": "17661577859",
  "code": "123456",
  "newPassword": "newpass456"
}

密码要求：
- 长度：6-16 个字符
- 新密码与旧密码不能相同

成功响应 (200):
{
  "code": 200,
  "message": "密码重置成功，请重新登录"
}

失败响应：
- 400：验证码错误或已过期
- 404：用户不存在
- 500：重置密码失败

说明：
- 验证码必须与发送验证码接口返回的验证码一致
- 验证码有效期为 5 分钟
- 验证码验证失败最多允许 5 次尝试
```
```

## 🔐 安全特性

- ✅ 密码使用bcryptjs进行加密存储
- ✅ JWT token认证和授权
- ✅ CORS跨域资源共享
- ✅ SQL注入防护（使用参数化查询）
- ✅ 请求数据验证
- ✅ 用户信息更新使用动态SQL，仅更新请求中提供的字段（防止意外覆盖其他字段）

## 📝 数据库表说明

### users 表
存储用户账户信息

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 用户ID |
| username | VARCHAR(50) | 用户名（唯一） |
| password | VARCHAR(255) | 加密密码 |
| phone | VARCHAR(20) | 手机号 |
| email | VARCHAR(100) | 邮箱 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 修改时间 |

**注意：** UID 是自动计算字段，不存储在数据库中，公式为：`uid = 100000000 + id`

例如：
- id = 1 → uid = 100000001
- id = 2 → uid = 100000002
- id = 3 → uid = 100000003

### login_logs 表
存储用户登录日志记录

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 日志ID |
| user_id | INT | 用户ID（外键） |
| ip_address | VARCHAR(45) | 登录IP地址 |
| device_info | VARCHAR(255) | 设备信息（如：iPhone 14 - Safari） |
| user_agent | TEXT | 浏览器User Agent信息 |
| login_time | TIMESTAMP | 登录时间 |

### questionnaire_results 表
存储问卷完成结果

### messages 表
存储用户消息

## 🌐 部署到云服务器

详见 [DEPLOYMENT.md](DEPLOYMENT.md) 或本目录下的部署指南。

## 🔧 环境变量说明

| 变量 | 默认值 | 说明 |
|------|--------|------|
| DB_HOST | localhost | 数据库主机 |
| DB_PORT | 3306 | 数据库端口 |
| DB_USER | root | 数据库用户 |
| DB_PASSWORD | | 数据库密码 |
| DB_NAME | warm_mate | 数据库名称 |
| PORT | 7001 | 服务器端口 |
| JWT_SECRET | | JWT签名密钥（必须修改） |
| NODE_ENV | development | 运行环境 |

## 🔄 版本更新记录

### v1.0.5 (2026-03-23)
- ✅ 优化修改密码功能
  - 密码长度要求改为 6-16 个字符（之前为 8-32）
  - 密码要求简化：只需包含字母、数字或符号，无需复杂的强度组合
  - 前端验证逻辑同步更新

### v1.0.4 (2026-03-22)
- ✅ 实现修改密码功能
  - 新增修改密码 API（/user/password/change）
  - 验证旧密码
  - 新密码强度验证（需要包含大小写字母、数字和特殊字符中的至少 3 种）
  - 防止新密码与旧密码相同
  - 修改成功后需要重新登录

### v1.0.3 (2026-03-22)
- ✅ 实现登录日志功能
  - 新增 login_logs 数据库表
  - 登录时自动记录 IP、设备信息、User Agent
  - 支持设备信息智能识别（iOS/Android/Windows/Mac等）
- ✅ 新增登录日志查询接口（分页和最近N条）
- ✅ 支持删除指定登录日志 
- ✅ 支持清空所有登录日志
- ✅ 前端账号管理中展示登录日志

### v1.0.2 (2026-03-22)
- ✅ 登录和用户信息接口添加 `uid` 字段（自动计算：`uid = 100000000 + id`）
- ✅ 用户信息更新API改用动态SQL，仅更新请求中提供的字段
- ✅ 防止部分字段更新时导致其他字段被意外设为null

### v1.0.1
- JWT认证系统实现
- 用户注册/登录功能

### v1.0.0
- 初始版本发布

## �📚 前端配置

更新前端项目中的 `common/config/env.js`：

```javascript
const dev = {
  baseUrl: 'http://你的服务器IP:7001/alibaba-ai/v1'
}
```

登录时获取的token应存储到本地：
```javascript
// 登录成功后
uni.setStorageSync("Access-Token", response.data.data.token)
```

## 🐛 调试

启用详细日志输出：
```bash
NODE_ENV=development npm run dev
```

## 📄 许可证

ISC
