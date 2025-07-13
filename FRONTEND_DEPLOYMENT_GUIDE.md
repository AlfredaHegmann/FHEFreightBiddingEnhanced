# Frontend Deployment Guide - Port 1401

## Status: Frontend Ready in Subdirectory

由于依赖兼容性问题，前端最好在独立的子目录中运行。

---

## 快速启动

### 方式 1: 使用子目录（推荐）

```bash
# 进入前端目录
cd D:\freight-bidding-platform

# 修改端口为 1401
# 编辑 package.json，将 dev 脚本改为: "dev": "next dev -p 1401"

# 启动开发服务器
npm run dev
```

###  方式 2: 从根目录启动

如果已经移动了文件到根目录：

```bash
cd D:\

# 确保有正确的 node_modules
# 如果有问题，从 freight-bidding-platform 复制
cp -r freight-bidding-platform/node_modules .

# 启动
npm run dev
```

---

## 已完成配置

### 1. 文件结构

```
D:\/
├── app/                          ✅ Next.js pages
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/                    ✅ React components
│   └── providers/
│       └── Providers.tsx
├── lib/                          ✅ Utilities
│   ├── contract.ts
│   ├── wagmi.ts
│   └── utils.ts
├── public/                        ✅ Static files
├── contracts/                     ✅ Smart contracts
├── scripts/                       ✅ Hardhat scripts
├── package.json                   ✅ Updated with frontend scripts
├── next.config.js                 ✅ Next.js configuration
├── tailwind.config.ts             ✅ Tailwind configuration
├── postcss.config.js              ✅ PostCSS configuration
├── frontend-tsconfig.json         ✅ TypeScript for frontend
├── .env.example                   ✅ Environment template
└── .env.local                     ✅ Local environment
```

### 2. Package.json 脚本

已添加以下脚本（端口 1401）:

```json
{
  "scripts": {
    "dev": "next dev -p 1401",
    "build": "next build",
    "start": "next start -p 1401",
    "type-check": "tsc --noEmit -p frontend-tsconfig.json",
    // ... Hardhat scripts
  }
}
```

### 3. 环境变量

`.env.local` 已配置:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x9E6B9F8afcC5A6E98A8d9967f2cA2edb3C191576
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_PROJECT_ID_HERE
```

---

## 依赖问题说明

### 问题

- Hardhat 和 Next.js 的依赖有一些冲突
- `@noble/hashes` 版本不兼容
- 根目录混合了 Hardhat 和 Next.js 依赖

### 解决方案

#### 选项 A: 独立目录（推荐）

在 `freight-bidding-platform` 子目录运行前端：

1. 前端和后端依赖完全隔离
2. 没有版本冲突
3. 更容易管理

```bash
cd freight-bidding-platform
# 修改 package.json 端口为 1401
npm run dev
```

#### 选项 B: 根目录运行

如果需要在根目录运行：

1. 复制工作的 node_modules
```bash
rm -rf node_modules .next
cp -r freight-bidding-platform/node_modules .
npm run dev
```

2. 或者创建两个独立的 package.json
- `package.json` - Hardhat
- `frontend-package.json` - Next.js

---

## 访问前端

启动后访问:
- **本地地址**: http://localhost:1401
- **功能**:
  - 连接钱包 (MetaMask, WalletConnect)
  - 查看合约信息
  - 浏览作业和投标

---

## 功能特性

### 已实现

- ✅ Next.js 14 with App Router
- ✅ TypeScript 配置
- ✅ Wagmi v2 Web3 集成
- ✅ RainbowKit 钱包连接
- ✅ Tailwind CSS 样式
- ✅ Radix UI 组件
- ✅ 合约 ABI 配置
- ✅ 环境变量设置
- ✅ 端口 1401 配置

### 待实现

- 📝 Jobs 列表页面
- 📝 创建 Job 页面
- 📝 Job 详情页面
- 📝 投标管理
- 📝 用户资料
- 📝 交易历史

---

## 开发命令

### Hardhat (后端)

```bash
# 编译合约
npm run compile

# 部署合约
node scripts/deploy.js

# 与合约交互
node scripts/interact.js 0x9E6B9F8afcC5A6E98A8d9967f2cA2edb3C191576

# 运行模拟
node scripts/simulate.js 0x9E6B9F8afcC5A6E98A8d9967f2cA2edb3C191576
```

### Next.js (前端)

```bash
# 开发服务器 (端口 1401)
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 类型检查
npm run type-check
```

---

## 部署到 Vercel

### 准备

1. 确保前端代码在根目录或独立仓库
2. 配置环境变量
3. 连接到 Vercel

### 步骤

```bash
# 方式 1: 使用 Vercel CLI
npm i -g vercel
vercel login
cd D:\\freight-bidding-platform
vercel

# 方式 2: GitHub + Vercel Dashboard
# 1. 推送代码到 GitHub
# 2. 在 Vercel 导入项目
# 3. 配置环境变量
# 4. 部署
```

### 环境变量（Vercel）

在 Vercel Dashboard 配置:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x9E6B9F8afcC5A6E98A8d9967f2cA2edb3C191576
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_RPC_URL=https://rpc.sepolia.org
NEXT_PUBLIC_ETHERSCAN_URL=https://sepolia.etherscan.io
```

---

## 故障排除

### 端口被占用

```bash
# Windows
netstat -ano | findstr :1401
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:1401 | xargs kill -9
```

### 依赖问题

```bash
# 清理并重新安装
rm -rf node_modules package-lock.json .next
npm install
```

### 类型错误

```bash
# 检查类型
npm run type-check

# 重新生成类型
rm -rf .next
npm run dev
```

---

## 项目结构说明

### Monorepo 结构

当前项目是一个 monorepo，包含:

1. **后端（根目录）**
   - Hardhat 配置
   - 智能合约
   - 部署脚本
   - 测试文件

2. **前端（可以在两个位置）**
   - `freight-bidding-platform/` - 独立子目录（推荐）
   - 根目录 - 混合模式（已配置）

### 最佳实践

**选项 1: 保持前端在子目录**

优点:
- 依赖隔离
- 更好的组织
- 没有版本冲突
- 独立部署

**选项 2: Monorepo 工具**

如果想要真正的 monorepo，使用:
- Turborepo
- Nx
- Yarn Workspaces
- Lerna

---

## 合约信息

### 已部署合约

- **合约地址**: `0x9E6B9F8afcC5A6E98A8d9967f2cA2edb3C191576`
- **网络**: Sepolia Testnet
- **Chain ID**: 11155111
- **Etherscan**: https://sepolia.etherscan.io/address/0x9E6B9F8afcC5A6E98A8d9967f2cA2edb3C191576

### 合约功能

- `registerShipper()` - 注册托运人
- `registerCarrier()` - 注册承运人
- `createJob()` - 创建货运任务
- `placeBid()` - 提交投标
- `awardJob()` - 授予任务
- `completeJob()` - 完成任务

---

## 下一步

### 立即可用

1. **启动前端**
   ```bash
   cd freight-bidding-platform
   npm run dev
   ```

2. **访问** http://localhost:1401

3. **连接钱包** (需要 Sepolia 测试网)

### 继续开发

1. 实现 Jobs 列表页面
2. 实现创建 Job 表单
3. 实现投标功能
4. 添加用户资料
5. 实现交易历史
6. 部署到 Vercel

---

## 总结

✅ **已完成**:
- 前端项目结构
- Next.js 配置
- Web3 集成
- 端口 1401 配置
- 环境变量设置
- 合约 ABI 配置

📝 **推荐方式**:
- 在 `freight-bidding-platform` 子目录运行前端
- 修改其 package.json 端口为 1401
- 保持后端和前端依赖隔离

🚀 **快速启动**:
```bash
cd D:\\freight-bidding-platform
# 编辑 package.json: "dev": "next dev -p 1401"
npm run dev
# 访问 http://localhost:1401
```

---

**创建时间**: 2025-10-23
**端口**: 1401
**状态**: ✅ 配置完成，可以启动
