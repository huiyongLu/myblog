import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia } from "wagmi/chains";

// 获取 WalletConnect Project ID
// 1. 访问 https://cloud.walletconnect.com
// 2. 创建新项目或使用现有项目
// 3. 复制 Project ID
// 4. 在 .env.local 中添加: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID";

if (projectId === "YOUR_PROJECT_ID") {
  console.warn(
    "⚠️ 请设置 NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID 环境变量。访问 https://cloud.walletconnect.com 获取 Project ID"
  );
}

export const config = getDefaultConfig({
  appName: "My Blog",
  projectId,
  chains: [mainnet, sepolia],
  ssr: true, // Next.js App Router 需要启用 SSR
});
