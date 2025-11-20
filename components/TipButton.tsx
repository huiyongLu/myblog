"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { parseEther } from "viem";
import { Button, Input, Modal, message, Space } from "antd";
import { GiftOutlined, SendOutlined } from "@ant-design/icons";

interface TipButtonProps {
  recipientAddress: string;
  postTitle?: string;
}

export function TipButton({ recipientAddress, postTitle }: TipButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const { isConnected, chainId } = useAccount();

  const {
    data: hash,
    sendTransaction,
    isPending: isSending,
    error: sendError,
    reset: resetSendTransaction,
  } = useSendTransaction();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isConfirmationError,
    data: receipt,
    error: confirmationError,
  } = useWaitForTransactionReceipt({
    hash: hash || undefined,
    chainId: chainId || undefined,
    query: {
      enabled: !!hash, // 只有在有 hash 时才启用查询
      retry: 10, // 重试次数
      retryDelay: 2000, // 重试延迟（毫秒）
      refetchInterval: (query) => {
        // 如果交易已确认或出错，停止轮询
        if (query.state.status === "success" || query.state.status === "error") {
          return false;
        }
        // 否则每 2 秒轮询一次
        return 2000;
      },
    },
  });

  const handleTip = async () => {
    if (!isConnected) {
      message.warning("请先连接钱包");
      setIsModalOpen(true);
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      message.error("请输入有效的打赏金额");
      return;
    }

    try {
      sendTransaction({
        to: recipientAddress as `0x${string}`,
        value: parseEther(amount),
      });
    } catch (error) {
      console.error("发送交易失败:", error);
      message.error("发送交易失败，请重试");
    }
  };

  useEffect(() => {
    if (isSending && hash) {
      message.loading({ content: "正在发送交易...", key: "tip", duration: 0 });
    } else if (isConfirming && hash && !isConfirmed) {
      message.loading({ content: "等待交易确认...", key: "tip", duration: 0 });
    } else if (!isSending && !isConfirming && hash) {
      message.destroy("tip");
    }
  }, [isSending, isConfirming, hash, isConfirmed]);

  useEffect(() => {
    if (hash) {
      console.log("交易哈希:", hash);
      console.log("交易状态:", {
        isSending,
        isConfirming,
        isConfirmed,
        isConfirmationError,
        receipt: receipt ? "已获取" : "未获取",
      });
    }
  }, [hash, isSending, isConfirming, isConfirmed, isConfirmationError, receipt]);

  useEffect(() => {
    if (isConfirmed && hash && receipt) {
      console.log("交易确认成功:", { hash, receipt });
      message.destroy("tip");
      message.success({
        content: `打赏成功！感谢您的支持 🎉`,
        key: "tip-success",
        duration: 5,
      });
      const timer = setTimeout(() => {
        setIsModalOpen(false);
        setAmount("");
        // 重置交易状态，以便进行下一次交易
        resetSendTransaction();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, hash, receipt, resetSendTransaction]);

  useEffect(() => {
    if (isConfirmationError && hash) {
      console.error("交易确认错误:", confirmationError);
      message.destroy("tip");
      message.error({
        content: confirmationError
          ? `交易确认失败: ${confirmationError.message}`
          : "交易确认失败，请检查交易状态",
        key: "tip-error",
        duration: 5,
      });
    }
  }, [isConfirmationError, hash, confirmationError]);

  useEffect(() => {
    if (sendError) {
      message.error({
        content: `交易失败: ${sendError.message}`,
        key: "tip",
        duration: 5,
      });
    }
  }, [sendError]);

  return (
    <>
      <Button
        type="primary"
        icon={<GiftOutlined />}
        size="large"
        onClick={() => setIsModalOpen(true)}
        className="mb-6 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
        style={{
          background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
        }}
      >
        打赏支持
      </Button>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <GiftOutlined className="text-pink-500" />
            <span>打赏作者</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setAmount("");
        }}
        footer={null}
        className="rounded-3xl"
        styles={{
          content: {
            backgroundColor: "var(--surface-bg)",
            borderColor: "var(--surface-border)",
          },
        }}
      >
        <div className="space-y-4">
          {postTitle && (
            <div
              className="rounded-2xl border p-4"
              style={{ borderColor: "var(--surface-border)" }}
            >
              <p
                className="text-sm mb-1"
                style={{ color: "var(--muted-text)" }}
              >
                文章标题
              </p>
              <p
                className="font-medium"
                style={{ color: "var(--surface-text)" }}
              >
                {postTitle}
              </p>
            </div>
          )}

          {!isConnected ? (
            <div className="space-y-4">
              <p className="text-sm" style={{ color: "var(--muted-text)" }}>
                请先连接钱包以进行打赏
              </p>
              <div className="flex justify-center">
                <ConnectButton />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label
                  className="mb-2 block text-sm font-medium"
                  style={{ color: "var(--surface-text)" }}
                >
                  打赏金额 (ETH)
                </label>
                <Input
                  type="number"
                  placeholder="请输入打赏金额"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="0.001"
                  size="large"
                  className="rounded-xl"
                  prefix={<span className="text-slate-500">Ξ</span>}
                  suffix={
                    <Space>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => setAmount("0.01")}
                        className="text-xs"
                      >
                        0.01 ETH
                      </Button>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => setAmount("0.05")}
                        className="text-xs"
                      >
                        0.05 ETH
                      </Button>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => setAmount("0.1")}
                        className="text-xs"
                      >
                        0.1 ETH
                      </Button>
                    </Space>
                  }
                />
              </div>

              <div
                className="rounded-2xl border p-4"
                style={{ borderColor: "var(--surface-border)" }}
              >
                <p
                  className="text-xs mb-2"
                  style={{ color: "var(--muted-text)" }}
                >
                  接收地址
                </p>
                <p
                  className="text-sm font-mono break-all"
                  style={{ color: "var(--surface-text)" }}
                >
                  {recipientAddress}
                </p>
              </div>

              <Button
                type="primary"
                icon={<SendOutlined />}
                block
                size="large"
                onClick={handleTip}
                loading={isSending || (isConfirming && !isConfirmed)}
                disabled={!amount || parseFloat(amount) <= 0 || isConfirmed}
                className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                style={{
                  background:
                    "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
                }}
              >
                {isConfirmed
                  ? "打赏成功！"
                  : isSending
                  ? "发送中..."
                  : isConfirming
                  ? "确认中..."
                  : "确认打赏"}
              </Button>

              {hash && (
                <div
                  className="rounded-2xl border p-3"
                  style={{ borderColor: "var(--surface-border)" }}
                >
                  <p
                    className="text-xs mb-1"
                    style={{ color: "var(--muted-text)" }}
                  >
                    交易哈希
                  </p>
                  <a
                    href={`https://etherscan.io/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-sky-500 hover:underline break-all"
                  >
                    {hash}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
