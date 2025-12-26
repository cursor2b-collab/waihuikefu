# Vercel 部署指南

## 部署步骤

### 方法一：通过 Vercel CLI 部署

1. **安装 Vercel CLI**（如果还没有安装）：
   ```bash
   npm i -g vercel
   ```

2. **登录 Vercel**：
   ```bash
   vercel login
   ```

3. **在项目目录中部署**：
   ```bash
   cd "C:\Users\alex\Downloads\黑色极简客服对话窗口"
   vercel
   ```

4. **配置环境变量**：
   在 Vercel 项目设置中添加以下环境变量：
   - `VITE_SUPABASE_URL` - 你的 Supabase 项目 URL
   - `VITE_SUPABASE_ANON_KEY` - 你的 Supabase Anon Key

### 方法二：通过 Vercel 网站部署

1. **访问 [vercel.com](https://vercel.com)** 并登录

2. **导入项目**：
   - 点击 "Add New" → "Project"
   - 连接你的 Git 仓库（GitHub/GitLab/Bitbucket）
   - 或者直接拖拽项目文件夹

3. **配置项目**：
   - Framework Preset: Vite
   - Root Directory: `./`（默认）
   - Build Command: `npm run build`（自动检测）
   - Output Directory: `dist`（自动检测）

4. **添加环境变量**：
   - 在项目设置 → Environment Variables 中添加：
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

5. **部署**：
   - 点击 "Deploy"

## 访问地址

部署完成后，你可以通过以下 URL 访问：

- **用户端**：`https://your-project.vercel.app/`
- **客服后台**：`https://your-project.vercel.app/?mode=agent`
- **管理后台**：`https://your-project.vercel.app/?mode=admin`

## 注意事项

1. **环境变量**：确保在 Vercel 项目设置中正确配置了 Supabase 环境变量
2. **构建输出**：Vite 默认输出到 `dist` 目录，已在 `vercel.json` 中配置
3. **路由**：所有路由都会重定向到 `index.html`，支持客户端路由

## 更新部署

每次推送到 Git 仓库后，Vercel 会自动重新部署。也可以手动触发部署：

```bash
vercel --prod
```

