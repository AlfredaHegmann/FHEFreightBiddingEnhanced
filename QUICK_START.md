# 快速启动指南 - 货运竞标平台

## 🚀 立即启动前端（端口 1401）

### 重要提示

由于 Hardhat 和 Next.js 依赖冲突，**强烈建议在子目录中运行前端**。

---

## 方法 1: 子目录启动（推荐）✅

```bash
# 1. 进入前端目录
cd D:\zamadapp\dapp140\freight-bidding-platform

# 2. 确保依赖已安装
npm install

# 3. 启动开发服务器（端口 1401）
npm run dev

# 4. 访问前端
# 浏览器打开: http://localhost:1401
```

---

## 方法 2: 根目录启动（需手动清理）

如果要在根目录运行：

```bash
# 1. 进入根目录
cd D:\zamadapp\dapp140

# 2. 清理旧依赖
rm -rf node_modules .next

# 3. 复制工作的依赖
cp -r freight-bidding-platform/node_modules .

# 4. 启动
npm run dev

# 5. 访问
# 浏览器打开: http://localhost:1401
```

---

## 项目已配置完成 ✅

### 前端文件位置

**主要位置**（推荐）:
- `D:\zamadapp\dapp140\freight-bidding-platform\` - 独立前端项目

**备用位置**:
- `D:\zamadapp\dapp140\app\` - 根目录 App Router
- `D:\zamadapp\dapp140\components\` - 根目录组件
- `D:\zamadapp\dapp140\lib\` - 根目录工具库

### 配置文件

- ✅ `package.json` - 端口 1401 已配置
- ✅ `next.config.js` - Next.js 配置
- ✅ `tailwind.config.ts` - Tailwind 配置
- ✅ `.env.local` - 环境变量
- ✅ `lib/contract.ts` - 合约配置

### 端口配置

前端端口: **1401**
- 开发: `npm run dev` → http://localhost:1401
- 生产: `npm start` → http://localhost:1401

---

## 当前合约信息

- **合约地址**: `0x9E6B9F8afcC5A6E98A8d9967f2cA2edb3C191576`
- **网络**: Sepolia Testnet
- **Chain ID**: 11155111
- **Etherscan**: https://sepolia.etherscan.io/address/0x9E6B9F8afcC5A6E98A8d9967f2cA2edb3C191576

---

## 功能清单

### 已实现 ✅

- [x] Next.js 14 项目结构
- [x] TypeScript 配置
- [x] Wagmi + RainbowKit 集成
- [x] 合约 ABI 配置
- [x] 首页（钱包连接）
- [x] Tailwind CSS 样式
- [x] 端口 1401 配置
- [x] 环境变量设置
- [x] Radix UI 组件库

### 待开发 📝

- [ ] Jobs 列表页面
- [ ] 创建 Job 表单
- [ ] Job 详情页面
- [ ] 投标功能
- [ ] 用户资料页面
- [ ] 交易历史
- [ ] 完整的错误处理
- [ ] 加载状态

---

## 开发命令

### 前端（Next.js）

```bash
cd freight-bidding-platform

# 开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 类型检查
npm run type-check

# 代码检查
npm run lint
```

### 后端（Hardhat）

```bash
cd D:\zamadapp\dapp140

# 编译合约
npm run compile

# 部署到 Sepolia
node scripts/deploy.js

# 与合约交互
node scripts/interact.js 0x9E6B9F8afcC5A6E98A8d9967f2cA2edb3C191576

# 运行完整模拟
node scripts/simulate.js 0x9E6B9F8afcC5A6E98A8d9967f2cA2edb3C191576
```

---

## 环境变量

### 前端 `.env.local`

```env
# 合约配置
NEXT_PUBLIC_CONTRACT_ADDRESS=0x9E6B9F8afcC5A6E98A8d9967f2cA2edb3C191576
NEXT_PUBLIC_CHAIN_ID=11155111

# 网络配置
NEXT_PUBLIC_NETWORK_NAME=sepolia
NEXT_PUBLIC_RPC_URL=https://rpc.sepolia.org

# WalletConnect 项目 ID（需要获取）
# 访问: https://cloud.walletconnect.com/
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### 获取 WalletConnect Project ID

1. 访问 https://cloud.walletconnect.com/
2. 注册/登录账号
3. 创建新项目
4. 复制 Project ID
5. 粘贴到 `.env.local`

---

## 故障排除

### 问题 1: 端口被占用

```bash
# Windows
netstat -ano | findstr :1401
taskkill /F /PID <进程ID>

# Linux/Mac
lsof -ti:1401 | xargs kill -9
```

### 问题 2: 依赖错误

```bash
# 清理并重装
cd freight-bidding-platform
rm -rf node_modules .next package-lock.json
npm install
```

### 问题 3: 类型错误

```bash
# 检查类型
npm run type-check

# 重新生成
rm -rf .next
npm run dev
```

### 问题 4: 构建失败

```bash
# 清理缓存
rm -rf .next
rm -rf node_modules/.cache

# 重新构建
npm run build
```

---

## 推荐工作流

### 日常开发

1. **启动后端测试节点**（如需）
   ```bash
   npm run node
   ```

2. **启动前端开发服务器**
   ```bash
   cd freight-bidding-platform
   npm run dev
   ```

3. **浏览器访问**
   http://localhost:1401

4. **连接钱包**
   - MetaMask切换到 Sepolia 网络
   - 点击"Connect Wallet"

### 部署合约

```bash
# 1. 确保 .env 配置正确
# 2. 部署到 Sepolia
node scripts/deploy.js

# 3. 更新前端合约地址（如果重新部署）
# 编辑 lib/contract.ts 或 .env.local
```

### 部署前端到 Vercel

```bash
# 1. 推送到 GitHub
git add .
git commit -m "Deploy frontend"
git push

# 2. 在 Vercel 导入项目
# 3. 配置环境变量
# 4. 部署
```

---

## 项目文档

- **FRONTEND_DEPLOYMENT_GUIDE.md** - 详细部署指南
- **FRONTEND_IMPLEMENTATION_COMPLETE.md** - 实现完成总结
- **FRONTEND_SETUP.md** - 详细设置指南
- **PROJECT_COMPLETE_SUMMARY.md** - 项目完整总结
- **README.md** - 项目主文档

---

## 技术栈

| 组件 | 技术 | 版本 |
|------|------|------|
| 框架 | Next.js | 14.2.x |
| 语言 | TypeScript | 5.5.x |
| Web3 | Wagmi | 2.12.x |
| 钱包 | RainbowKit | 2.1.x |
| 样式 | Tailwind CSS | 3.4.x |
| 组件 | Radix UI | 最新 |
| 打包 | ESBuild | 0.23.x |
| 部署 | Vercel | - |

---

## 快速测试

### 测试钱包连接

1. 启动前端: `cd freight-bidding-platform && npm run dev`
2. 访问: http://localhost:1401
3. 点击"Connect Wallet"
4. 选择 MetaMask
5. 切换到 Sepolia 网络
6. 查看合约地址显示

### 测试合约交互

```bash
# 1. 注册为托运人
node scripts/interact.js 0x9E6B9F8afcC5A6E98A8d9967f2cA2edb3C191576
# 选择: 1. Register as Shipper

# 2. 创建任务
# 选择: 3. Create Job

# 3. 查看任务
# 选择: 6. Get Job Details
```

---

## 🎯 下一步行动

### 立即可做

1. ✅ 启动前端查看首页
   ```bash
   cd freight-bidding-platform
   npm run dev
   ```

2. ✅ 获取 WalletConnect Project ID
   - https://cloud.walletconnect.com/

3. ✅ 测试钱包连接
   - 访问 http://localhost:1401
   - 连接 MetaMask

### 继续开发

4. 📝 实现 Jobs 列表页面
   - 创建 `app/jobs/page.tsx`
   - 添加合约读取 hooks

5. 📝 实现创建 Job 表单
   - 创建 `app/jobs/create/page.tsx`
   - 添加表单验证

6. 📝 实现投标功能
   - 创建投标表单组件
   - 集成合约写入

---

## 总结

### ✅ 已完成

- 前端项目完整配置
- 端口 1401 已设置
- 两个运行位置可选（推荐子目录）
- 合约集成完成
- 文档齐全

### 🚀 快速启动

```bash
cd D:\zamadapp\dapp140\freight-bidding-platform
npm run dev
# 访问: http://localhost:1401
```

### 📝 下一步

开发更多页面和功能，参考 `FRONTEND_IMPLEMENTATION_COMPLETE.md`

---

**创建时间**: 2025-10-23
**端口**: 1401
**状态**: ✅ 随时可用
