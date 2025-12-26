# 部署指南

## Netlify 部署步骤

### 方式一：命令行部署（推荐）

```bash
# 1. 安装 Netlify CLI
npm install -g netlify-cli

# 2. 登录 Netlify
netlify login

# 3. 进入项目目录
cd C:\Users\alex\Downloads\黑色极简客服对话窗口

# 4. 初始化 Netlify 项目（首次部署）
netlify init

# 5. 部署到生产环境
netlify deploy --prod
```

### 方式二：GitHub 连接部署

1. 将代码推送到 GitHub
2. 登录 [Netlify](https://app.netlify.com)
3. 点击 "Add new site" → "Import an existing project"
4. 选择 GitHub 仓库
5. 配置构建设置：
   - Build command: `npm run build`
   - Publish directory: `dist`
6. 添加环境变量（在 Site settings → Environment variables）

### 环境变量配置

在 Netlify Dashboard 中添加以下环境变量：

| 变量名 | 值 |
|--------|-----|
| VITE_SUPABASE_URL | https://zjodvwgmwwgixwpyuvos.supabase.co |
| VITE_SUPABASE_ANON_KEY | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpqb2R2d2dtd3dnaXh3cHl1dm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MzI2MTcsImV4cCI6MjA4MjMwODYxN30.8MtKA1siDQ7opsqN9uhPsq9ui_tYsfEQexvIqBjkNoc |

## 部署后

部署成功后会获得一个 `.netlify.app` 域名，例如：
- `https://your-site-name.netlify.app`

## 更新 touzices-nextjs 项目

部署成功后，需要更新 `touzices-nextjs` 项目中的客服链接：

1. 修改 `.env.production`：
   ```
   NEXT_PUBLIC_CUSTOMER_SERVICE_URL=https://your-site-name.netlify.app
   ```

2. 修改其他相关文件中的链接

## 自定义域名（可选）

1. 在 Netlify Dashboard → Domain settings
2. 添加自定义域名
3. 配置 DNS 解析

