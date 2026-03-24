# 🎯 快速开始指南

完整的 Warm-Mate 云服务器搭建和部署方案。按照本指南可在 **2-3小时** 内完成从0到完整部署。

> **当前版本**: v1.0.3 (2026年3月24日)  
> **最新功能**: SMS短信验证服务、找回密码流程、Aliyun DYPNS集成

---

## 📦 你现在拥有的

已为你生成的完整后端项目位于：
```
C:\Users\while\Desktop\warm-mate-server\
```

包含：
- ✅ 完整的Node.js + Express后端框架
- ✅ 用户认证系统（注册、登录、JWT）- 返回uid字段
- ✅ MySQL数据库模式和初始化脚本
- ✅ 生产级安全配置（动态SQL、参数化查询）
- ✅ 灵活的账户管理API（支持单字段或多字段更新）
- ✅ 完整部署文档

---

## ⚡ 三部分快速部署流程

### 👷 **第一部分：在阿里云上购买ECS（20分钟）**

1. **登录阿里云** → https://www.aliyun.com
2. **购买ECS实例**（推荐配置）：
   - 操作系统：**Ubuntu 20.04 LTS**
   - 规格：**2核4GB内存** (ecs.t5.large)
   - 存储：**40GB系统盘**
   - 带宽：**按流量** 或 **5Mbps固定**

3. **配置安全组** - 允许这些端口：
   - 22 (SSH)
   - 7001 (应用)
   - 80 (HTTP)
   - 443 (HTTPS)
   - 3306 (MySQL)

4. **记下实例信息**：
   - 公网IP：例如 `1.2.3.4`
   - 用户名：`ubuntu`
   - 密钥或密码

---

### 🔧 **第二部分：配置服务器环境（30分钟）**

**在本地PowerShell中SSH连接到ECS**：
```bash
ssh ubuntu@你的ECS公网IP
```

**逐个运行这些命令**：

```bash
# 1. 更新系统
sudo apt update && sudo apt upgrade -y

# 2. 安装Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 3. 安装MySQL
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql

# 4. 验证安装
node -v     # 应显示 v18.x.x
npm -v      # 应显示 9.x.x
mysql --version
```

**初始化MySQL数据库**：
```bash
sudo mysql -u root

# 在MySQL提示符中执行
CREATE USER 'warmmate'@'localhost' IDENTIFIED BY 'warmmate123@';
CREATE USER 'warmmate'@'%' IDENTIFIED BY 'warmmate123@';
GRANT ALL PRIVILEGES ON *.* TO 'warmmate'@'localhost' WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON *.* TO 'warmmate'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
EXIT;
```

---

### 📤 **第三部分：上传和启动应用（20分钟）**

**在本地电脑PowerShell中上传代码**：
```bash
# 上传你生成的项目到ECS
scp -r C:\Users\while\Desktop\warm-mate-server ubuntu@你的ECS公网IP:/home/ubuntu/
```

**回到SSH连接，启动应用**：
```bash
# 进入项目
cd /home/ubuntu/warm-mate-server

# 复制环境配置
cp .env.example .env

# 编辑.env文件，修改以下内容
nano .env
```

**在nano中修改这些值**：
```
DB_HOST=localhost
DB_USER=warmmate
DB_PASSWORD=warmmate123@
DB_NAME=warm_mate
PORT=7001
JWT_SECRET=change_me_to_random_secret_123456
NODE_ENV=production
```

保存：按 `Ctrl+X` → `Y` → `Enter`

**继续启动**：
```bash
# 安装依赖
npm install

# 初始化数据库
mysql -u warmmate -p warmmate123@ warm_mate < sql/init.sql
# 输入密码：warmmate123@

# 安装PM2进程管理
sudo npm install -g pm2

# 启动应用
pm2 start app.js --name "warm-mate"

# 设置开机自启
pm2 startup
pm2 save

# 检查状态
pm2 status
```

---

## ✅ 验证部署成功

### 1️⃣ **服务器端验证**

在ECS上运行：
```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs warm-mate

# 测试API连接
curl http://localhost:7001/health
```

应该返回：
```json
{"code": 200, "message": "服务器运行正常", ...}
```

### 2️⃣ **从本地验证**

在你的Windows电脑PowerShell中：
```bash
curl http://ECS公网IP:7001/health
```

应该成功响应。

### 3️⃣ **测试用户注册**

```bash
curl -X POST http://ECS公网IP:7001/alibaba-ai/v1/register `
  -H "Content-Type: application/json" `
  -d '{
    "username": "testuser",
    "password": "password123",
    "phone": "13800138000",
    "email": "test@example.com"
  }'
```

---

## 🔌 更新前端配置

编辑你的Warm-Mate项目中的 **common/config/env.js**：

```javascript
const env = "local"

const prod = {
    baseUrl: 'http://你的ECS公网IP:7001/alibaba-ai/v1'
}
const dev = {
    baseUrl: 'http://你的ECS公网IP:7001/alibaba-ai/v1'
}
const local = {
    baseUrl: 'http://你的ECS公网IP:7001/alibaba-ai/v1'
}

const config = { dev, prod, local }
export default config[env]
```

---

## 📚 详细文档

本项目包含三份完整的参考文档：

1. **[DEPLOYMENT.md](DEPLOYMENT.md)** 
   - ⭐ 完整的部署步骤和troubleshooting
   - 阿里云ECS详细配置
   - PM2进程管理
   - 性能优化

2. **[INTEGRATION.md](INTEGRATION.md)**
   - ⭐ 前后端集成指南
   - 登录/注册流程
   - Token处理
   - 完整登录页面示例

3. **[README.md](README.md)**
   - ⭐ API文档和项目结构
   - 数据库Schema
   - 环境变量说明

---

## 🐛 快速排查

| 问题 | 解决方案 |
|------|---------|
| 无法连接数据库 | `sudo systemctl restart mysql` 并检查密码 |
| 端口被占用 | `sudo lsof -i :7001` 然后 `sudo kill -9 PID` |
| 无法SSH连接 | 检查安全组规则和IP地址 |
| 应用无法启动 | `pm2 logs warm-mate` 查看错误日志 |
| 无法从本地访问 | 检查ECS防火墙规则是否开放7001端口 |

---

## 📊 项目结构

```
warm-mate-server/
├── app.js                    # 主应用入口
├── package.json              # 依赖配置
├── .env.example              # 环境变量示例
├── config/
│   └── database.js           # 数据库连接
├── models/
│   └── User.js               # 用户模型 + 密码加密
├── controllers/
│   └── userController.js     # 业务逻辑
├── routes/
│   └── auth.js               # 用户认证路由
├── middleware/
│   └── auth.js               # JWT验证中间件
├── sql/
│   └── init.sql              # 数据库初始化SQL
├── README.md                 # API文档
├── DEPLOYMENT.md             # 完整部署指南
└── INTEGRATION.md            # 前后端集成指南
```

---

## 🔐 安全特性

✅ **已包含的安全措施**：
- 密码使用bcryptjs加密
- JWT token认证（7天过期）
- CORS防护
- SQL注入防护（参数化查询）
- 错误信息不泄露敏感数据

✅ **生产环境建议**：
- 修改所有默认密码
- 启用HTTPS/SSL证书
- 配置反向代理（Nginx）
- 设置防火墙规则
- 定期备份数据库

---

## 🎓 下一步学习

### 添加更多功能
- 添加问卷API（保存和查询）
- 添加消息系统
- 用户头像上传
- 心理评测模块

### 性能优化
- [ ] 启用Redis缓存
- [ ] 配置Nginx反向代理
- [ ] 数据库查询优化
- [ ] 添加日志系统

### 生产就绪
- [ ] 配置HTTPS
- [ ] 自动备份脚本
- [ ] 监控和告警
- [ ] 负载均衡

---

## 💬 需要帮助？

### 检查清单
- [ ] 是否成功创建了ECS实例？
- [ ] 是否能SSH连接到服务器？
- [ ] 是否安装了Node.js和MySQL？
- [ ] 是否成功初始化了数据库？
- [ ] 是否成功启动了应用（pm2 status）？
- [ ] 是否能从本地访问API（curl测试）？
- [ ] 是否更新了前端配置？

如有问题，查看详细文档中的troubleshooting部分。

---

## 🚀 完成时间表

| 任务 | 时间 | 完成 |
|------|------|------|
| 购买ECS实例 | 20分钟 | ⬜ |
| 安装运行环境 | 30分钟 | ⬜ |
| 上传和启动应用 | 20分钟 | ⬜ |
| 前端配置更新 | 5分钟 | ⬜ |
| 测试验证 | 10分钟 | ⬜ |
| **总计** | **85分钟** | ⬜ |

---

**祝部署顺利！🎉**

有任何问题，参考详细文档或查看pm2日志。
