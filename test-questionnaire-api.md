# 问卷结果 API 测试指南

## 1. 获取认证令牌

首先需要登录获取 Access-Token：

```bash
curl -X POST http://47.94.217.78:7001/alibaba-ai/v1/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

响应示例：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGc...",
    "userId": 1
  }
}
```

## 2. 保存问卷结果

**请求：**
```bash
curl -X POST http://47.94.217.78:7001/alibaba-ai/v1/questionnaireResults/savePhq9Result \
  -H "Content-Type: application/json" \
  -H "Access-Token: YOUR_TOKEN_HERE" \
  -d '{
    "questionnaireName": "PHQ-9抑郁筛查量表",
    "questionnaireType": "mood",
    "score": 12,
    "depressionLevel": "轻度抑郁",
    "levelDescription": "您可能有轻度的抑郁症状，建议咨询心理医生",
    "resultData": {
      "answers": [1,2,1,0,1,2,1,0,1],
      "categories": {
        "coreSymptoms": 5,
        "sleep": 2,
        "appetite": 3,
        "worthlessness": 2
      }
    }
  }'
```

**成功响应：**
```json
{
  "code": 200,
  "message": "问卷结果保存成功",
  "data": {
    "id": 123
  }
}
```

## 3. 获取用户问卷历史记录

**请求：**
```bash
curl -X GET http://47.94.217.78:7001/alibaba-ai/v1/questionnaireResults/listByUserId/1 \
  -H "Access-Token: YOUR_TOKEN_HERE"
```

**成功响应：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": 123,
      "userId": 1,
      "questionnaireName": "PHQ-9抑郁筛查量表",
      "questionnaireType": "mood",
      "score": 12,
      "depressionLevel": "轻度抑郁",
      "levelDescription": "您可能有轻度的抑郁症状，建议咨询心理医生",
      "resultData": {...},
      "createTime": "2024-03-24T10:30:00.000Z"
    }
  ]
}
```

## 4. 获取最新问卷结果

**请求：**
```bash
curl -X GET http://47.94.217.78:7001/alibaba-ai/v1/questionnaireResults/latestByUserId/1 \
  -H "Access-Token: YOUR_TOKEN_HERE"
```

## 5. 获取问卷结果详情

**请求：**
```bash
curl -X GET http://47.94.217.78:7001/alibaba-ai/v1/questionnaireResults/123 \
  -H "Access-Token: YOUR_TOKEN_HERE"
```

## 6. 删除单个问卷结果

**请求：**
```bash
curl -X DELETE http://47.94.217.78:7001/alibaba-ai/v1/questionnaireResults/123 \
  -H "Access-Token: YOUR_TOKEN_HERE"
```

## 7. 批量删除问卷结果

**请求：**
```bash
curl -X DELETE http://47.94.217.78:7001/alibaba-ai/v1/questionnaireResults/batch \
  -H "Content-Type: application/json" \
  -H "Access-Token: YOUR_TOKEN_HERE" \
  -d '{
    "ids": [123, 124, 125]
  }'
```

## 8. 获取问卷统计

**请求：**
```bash
curl -X GET http://47.94.217.78:7001/alibaba-ai/v1/questionnaireResults/count \
  -H "Access-Token: YOUR_TOKEN_HERE"
```

**成功响应：**
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "count": 5
  }
}
```

## 问卷类型和名称对应关系

| questionnaireName | questionnaireType | 说明 |
|---|---|---|
| PHQ-9抑郁筛查量表 | mood | 抑郁症筛查 |
| GAD-7焦虑筛查量表 | mood | 焦虑症筛查 |
| CPSS创伤后应激量表 | stress | 压力评估 |
| UCLA孤独感量表 | social | 社交和孤独感 |
| ITS人际信任量表 | social | 社交信任评估 |
| PSQI睡眠质量指数 | sleep | 睡眠质量评估 |
| SDS自评抑郁量表 | sleep | 睡眠相关抑郁 |

## 测试步骤

1. 使用有效的用户账号登录获取 Access-Token
2. 使用 POST /savePhq9Result 保存测试数据（3-5 条）
3. 使用 GET /listByUserId 验证数据已保存
4. 使用 GET /latestByUserId 验证最新记录
5. 使用 GET /:id 验证单条详情
6. 使用 DELETE /:id 验证删除功能
7. 前端页面 pages/phq7-test/history.vue 应该能加载历史记录

## 常见错误

| 错误码 | 含义 | 解决方案 |
|---|---|---|
| 400 | 参数缺失或无效 | 检查请求体中的必填字段 |
| 401 | 未认证 | 检查 Access-Token 是否正确和有效 |
| 403 | 禁止访问 | 用户无权访问这条记录 |
| 404 | 记录不存在 | 检查 ID 是否正确 |
| 500 | 服务器错误 | 检查服务器日志 |
