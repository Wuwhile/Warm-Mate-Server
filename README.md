# Warm-Mate 后端服务器

用户账户管理和认证系统的完整Node.js + Express + MySQL后端解决方案。

## 📋 项目结构

```
warm-mate-server/
├── app.js                 # Express主应用
├── package.json          # 项目依赖配置
├── .env.example          # 环境变量示例
├── config/
│   └── database.js       # 数据库连接配置
├── models/
│   └── User.js           # 用户数据模型
├── controllers/
│   └── userController.js # 用户业务逻辑
├── routes/
│   └── auth.js           # 认证相关路由
├── middleware/
│   └── auth.js           # JWT认证中间件
├── sql/
│   └── init.sql          # 数据库初始化脚本
└── README.md             # 项目文档
```

## 🚀 快速开始（本地开发）

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
```bash
cp .env.example .env
```

编辑 `.env` 文件，配置数据库信息：
```
DB_HOST=localhost
DB_USER=warmmate
DB_PASSWORD=warmmate123@
DB_NAME=warm_mate
PORT=7001
JWT_SECRET=your_secret_key_here
```

### 3. 初始化数据库
```bash
mysql -u root -p < sql/init.sql
```

### 4. 启动开发服务器
```bash
npm run dev
```

服务器将运行在 `http://localhost:7001`

## 📡 API 端点

### 基础URL
```
http://localhost:7001/alibaba-ai/v1
```

### 认证接口

#### 注册
```
POST /register
Content-Type: application/json

{
  "username": "张三",
  "password": "password123",
  "phone": "13800138000",
  "email": "zhangsan@example.com"
}

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
    "username": "张三",
    "phone": "13800138000",
    "email": "zhangsan@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 获取用户信息（需要认证）
```
GET /user/info
Authorization: Bearer <token>

成功响应 (200):
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "username": "张三",
    "phone": "13800138000",
    "email": "zhangsan@example.com",
    "created_at": "2024-03-21T10:30:00Z"
  }
}
```

#### 更新用户信息（需要认证）
```
PUT /user/info
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "李四",
  "phone": "13900139000",
  "email": "lisi@example.com"
}

成功响应 (200):
{
  "code": 200,
  "message": "更新成功",
  "data": { ... }
}
```

## 🔐 安全特性

- ✅ 密码使用bcryptjs进行加密存储
- ✅ JWT token认证和授权
- ✅ CORS跨域资源共享
- ✅ SQL注入防护（使用参数化查询）
- ✅ 请求数据验证

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

## 📚 前端配置

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
