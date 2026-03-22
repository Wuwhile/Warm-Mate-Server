# 📚 Warm-Mate 生产部署完成指南

> **部署完成时间**: 2026年3月21日  
> **部署环境**: 阿里云ECS（Ubuntu 22.04）  
> **应用状态**: ✅ 运行中

---

## 📋 目录

1. [应用信息](#应用信息)
2. [访问方式](#访问方式)
3. [配置详情](#配置详情)
4. [常用命令](#常用命令)
5. [日志管理](#日志管理)
6. [故障排查](#故障排查)
7. [代码更新](#代码更新)
8. [备份恢复](#备份恢复)

---

## 📱 应用信息

| 项目 | 详情 |
|------|------|
| **应用名称** | Warm-Mate Server |
| **版本** | 1.0.2 |
| **部署位置** | `/root/warm-mate-server` |
| **进程管理** | PM2 |
| **应用名称** | warm-mate |
| **Node.js版本** | v18.x |
| **主要框架** | Express.js |
| **最后更新** | 2026年3月22日 |

---

## 🌐 访问方式

### 应用地址

```
http://你的ECS公网IP:7001/alibaba-ai/v1
```

### 获取公网IP

```bash
# 在ECS上执行
hostname -I
```

或者登录阿里云控制台查看实例的公网IP。

### 检查端口是否开放

```bash
# 检查7001端口是否监听
netstat -tlnp | grep 7001

# 或使用ss命令
ss -tlnp | grep 7001
```

---

## ⚙️ 配置详情

### 环境变量配置 (.env)

位置：`/root/warm-mate-server/.env`

```ini
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=warmmate
DB_PASSWORD=warmmate123@
DB_NAME=warm_mate

# 服务器配置
PORT=7001
NODE_ENV=production

# JWT密钥（生产环境）
JWT_SECRET=3413c47df5e69fb46c1427775a049098fe7d0639571c5cbbecf77c7b2fdf6030

# API前缀
API_PREFIX=/alibaba-ai/v1
```

### 数据库信息

| 项目 | 值 |
|------|-----|
| **数据库名** | warm_mate |
| **用户名** | warmmate |
| **密码** | warmmate123@ |
| **主机** | localhost |
| **端口** | 3306 |

### 数据表

```
✅ users                  # 用户表
✅ messages              # 消息表
✅ questionnaire_results # 问卷结果表
```

---

## 🔧 常用命令

### PM2 进程管理

```bash
# 查看应用状态
pm2 status

# 查看所有应用
pm2 list

# 启动应用
pm2 start app.js --name "warm-mate"

# 停止应用
pm2 stop warm-mate

# 重启应用
pm2 restart warm-mate

# 删除应用
pm2 delete warm-mate

# 重载（零停机重启）
pm2 reload warm-mate

# 查看应用详细信息
pm2 show warm-mate
```

### 项目操作

```bash
# 进入项目目录
cd /root/warm-mate-server

# 启动开发模式（需要安装nodemon）
npm run dev

# 编辑环境变量
nano .env

# 查看npm依赖
npm list

# 更新npm依赖
npm update
```

---

## 📊 日志管理

### 查看日志

```bash
# 实时查看日志（Ctrl+C 退出）
pm2 logs warm-mate

# 查看最后N行日志
pm2 logs warm-mate --lines 50

# 只查看错误日志
pm2 logs warm-mate --err

# 只查看输出日志
pm2 logs warm-mate --out
```

### 日志文件位置

```bash
# 输出日志
/root/.pm2/logs/warm-mate-out.log

# 错误日志
/root/.pm2/logs/warm-mate-error.log
```

### 手动查看日志

```bash
# 实时查看输出日志
tail -f /root/.pm2/logs/warm-mate-out.log

# 显示最后100行
tail -n 100 /root/.pm2/logs/warm-mate-error.log

# 查看整个日志文件
less /root/.pm2/logs/warm-mate-out.log
```

---

## 🐛 故障排查

### 问题1：应用无法启动

```bash
# 1. 检查应用状态
pm2 status

# 2. 查看详细错误
pm2 logs warm-mate

# 3. 检查Node.js是否安装
node -v
npm -v

# 4. 重新安装依赖
cd /root/warm-mate-server
npm install

# 5. 重启应用
pm2 restart warm-mate
```

### 问题2：数据库连接失败

```bash
# 1. 检查MySQL服务状态
sudo systemctl status mysql

# 2. 启动MySQL（如果停止了）
sudo systemctl start mysql

# 3. 验证数据库连接
mysql -u warmmate -p
# 输入密码：warmmate123@

# 4. 检查数据库是否存在
mysql -u warmmate -p -e "SHOW DATABASES;"

# 5. 重启应用
pm2 restart warm-mate
```

### 问题3：端口被占用

```bash
# 1. 查看7001端口占用情况
lsof -i :7001

# 2. 杀掉占用端口的进程（PID替换为实际值）
kill -9 PID

# 3. 或者修改.env中的PORT为其他端口
nano .env
# 修改 PORT=7002

# 4. 重启应用
pm2 restart warm-mate
```

### 问题4：无法从外部访问

```bash
# 1. 检查阿里云安全组是否开放7001端口
# → 登录阿里云控制台 → ECS → 实例 → 安全组 → 编辑规则
# → 添加入站规则：TCP 7001 来源 0.0.0.0/0

# 2. 检查防火墙
sudo ufw status
sudo ufw allow 7001

# 3. 验证服务是否在监听
netstat -tlnp | grep 7001

# 4. 使用curl本地测试
curl http://localhost:7001/alibaba-ai/v1
```

---

## 🔄 代码更新

### 拉取最新代码

```bash
cd /root/warm-mate-server

# 查看当前状态
git status

# 拉取最新代码
git pull origin main

# 安装新依赖（如果package.json更新了）
npm install

# 重启应用
pm2 restart warm-mate
```

### 更新后验证

```bash
# 查看运行日志
pm2 logs warm-mate

# 检查应用是否正常
curl http://localhost:7001/alibaba-ai/v1
```

---

## 💾 备份恢复

### 数据库备份

```bash
# 备份整个数据库
mysqldump -u warmmate -p warm_mate > /root/warm_mate_backup_$(date +%Y%m%d_%H%M%S).sql
# 输入密码：warmmate123@

# 备份特定表
mysqldump -u warmmate -p warm_mate users > /root/users_backup.sql
```

### 数据库恢复

```bash
# 恢复整个数据库
mysql -u warmmate -p warm_mate < /root/warm_mate_backup_20260321_120000.sql
# 输入密码：warmmate123@

# 恢复特定表
mysql -u warmmate -p warm_mate < /root/users_backup.sql
```

### 项目代码备份

```bash
# 备份整个项目
tar -czf /root/warm-mate-server-backup-$(date +%Y%m%d).tar.gz /root/warm-mate-server/

# 查看备份
ls -lh /root/*.tar.gz

# 恢复项目（如需要）
tar -xzf /root/warm-mate-server-backup-20260321.tar.gz -C /root/
```

---

## 🔐 安全建议

### 修改数据库密码

```bash
# 连接到MySQL
mysql -u root

# 修改warmmate用户密码
ALTER USER 'warmmate'@'localhost' IDENTIFIED BY '新密码';
FLUSH PRIVILEGES;
EXIT;

# 更新.env文件中的数据库密码
nano /root/warm-mate-server/.env
```

### 修改JWT_SECRET

```bash
# 生成新的安全密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 更新.env文件
nano /root/warm-mate-server/.env
# 替换 JWT_SECRET 的值

# 重启应用
pm2 restart warm-mate
```

### 定期备份

```bash
# 创建定时备份脚本
crontab -e

# 添加以下行（每天凌晨2点备份）
0 2 * * * mysqldump -u warmmate -p'warmmate123@' warm_mate > /root/backups/warm_mate_$(date +\%Y\%m\%d).sql
```

---

## 📈 性能监控

### 监控应用资源占用

```bash
# 持续监控PM2应用
pm2 monit

# 查看应用内存和CPU占用
ps aux | grep "node app.js"

# 查看系统资源
free -h          # 内存
df -h             # 磁盘
top               # 实时监控
```

### 查看PM2信息

```bash
# 详细应用信息
pm2 show warm-mate

# 保存PM2配置
pm2 save

# 启动所有应用
pm2 start all
```

---

## 🆘 获取帮助

### 常见资源

- [Express.js 文档](https://expressjs.com/)
- [MySQL 文档](https://dev.mysql.com/doc/)
- [PM2 文档](https://pm2.keymetrics.io/)
- [阿里云 ECS 文档](https://help.aliyun.com/product/25365.html)

### 查看详细错误

```bash
# 查看完整错误日志
cat /root/.pm2/logs/warm-mate-error.log

# 查看PM2诊断信息
pm2 diagnose
```

---

## 📝 更新日志

| 日期 | 操作 | 备注 |
|------|------|------|
| 2026-03-21 | 初始部署 | 应用成功启动，数据库已初始化 |

---

**最后更新**: 2026年3月21日  
**维护人员**: 开发团队

