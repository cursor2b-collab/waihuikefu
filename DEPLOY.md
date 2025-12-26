# Vercel 部署步骤

## 解决 "Detected linked project does not have 'id'" 错误

这个错误通常是因为项目还没有正确链接到 Vercel。请按以下步骤操作：

### 步骤 1：首次部署（开发环境）

```bash
cd "C:\Users\alex\Downloads\黑色极简客服对话窗口"
vercel
```

这会：
- 创建新的 Vercel 项目
- 询问项目配置
- 进行首次部署到预览环境

### 步骤 2：配置环境变量

在 Vercel 网站的项目设置中添加环境变量：
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 步骤 3：部署到生产环境

```bash
vercel --prod
```

## 或者：通过 Vercel 网站部署

1. 访问 https://vercel.com
2. 点击 "Add New" → "Project"
3. 导入项目（Git 仓库或上传文件夹）
4. 配置：
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. 添加环境变量
6. 点击 "Deploy"

## 如果仍然遇到问题

删除 `.vercel` 目录并重新开始：

```bash
# Windows PowerShell
Remove-Item -Recurse -Force .vercel
vercel
```

