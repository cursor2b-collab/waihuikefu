# Supabase 实时在线客服配置说明

## 已完成的配置

✅ Supabase 项目连接已配置  
✅ 数据库表结构已存在（conversations、messages）  
✅ Realtime 功能已启用  
✅ 客户端代码已集成  

## 当前配置信息

- **项目ID**: xfcbxphhesbhazmjaztj
- **项目URL**: https://xfcbxphhesbhazmjaztj.supabase.co
- **Anon Key**: 已配置在代码中（建议使用环境变量）

## 环境变量配置

1. 在项目根目录创建 `.env` 文件：

```env
VITE_SUPABASE_URL=https://xfcbxphhesbhazmjaztj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmY2J4cGhoZXNiaGF6bWphenRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MzA2MDQsImV4cCI6MjA3NjIwNjYwNH0.Fe3NMFJn8_rQDRbIKEc-SwLTC2Zj9AyVLtwJZF4IlVY
```

## 数据库表说明

### conversations 表
- 存储用户会话信息
- 自动创建新会话
- 会话ID保存在浏览器 localStorage

### messages 表
- 存储所有消息记录
- 支持实时同步（Realtime 已启用）
- 消息类型：customer（用户）、agent（客服）、system（系统）

## 功能特性

1. **实时消息同步**
   - 使用 Supabase Realtime 订阅消息变化
   - 新消息自动推送到所有连接的客户端

2. **会话持久化**
   - 会话ID保存在 localStorage
   - 刷新页面后保持会话

3. **消息类型支持**
   - 文本消息
   - 表情消息
   - 图片消息（Base64 编码）

## 使用流程

1. 用户打开应用
2. 系统自动创建或恢复会话
3. 加载历史消息
4. 订阅实时消息更新
5. 发送消息时写入数据库
6. 通过 Realtime 自动同步到所有客户端

## 安全说明

⚠️ **重要**: 当前使用的是 Anon Key，适合前端使用。如需更高级的安全控制，建议：

1. 配置 Row Level Security (RLS) 策略
2. 使用 Service Role Key 进行服务端操作
3. 实现用户认证系统

## 测试建议

1. 打开两个浏览器窗口测试实时同步
2. 刷新页面测试会话持久化
3. 检查浏览器控制台是否有错误
4. 验证消息是否正确保存到数据库

## 故障排查

如果实时消息不工作：

1. 检查 Supabase Dashboard > Database > Replication
2. 确认 `messages` 表的 Realtime 已启用
3. 检查浏览器控制台的网络请求
4. 验证环境变量是否正确配置

