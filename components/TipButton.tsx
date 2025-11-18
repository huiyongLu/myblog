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
  recipientAddress: string; // 接收打赏的地址
  postTitle?: string; // 文章标题，用于显示
}

export function TipButton({ recipientAddress, postTitle }: TipButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [lastHash, setLastHash] = useState<string | undefined>();
  const { address, isConnected } = useAccount();

  const {
    data: hash,
    sendTransaction,
    isPending: isSending,
    error: sendError,
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
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

  // 跟踪交易哈希变化
  useEffect(() => {
    if (hash && hash !== lastHash) {
      setLastHash(hash);
    }
  }, [hash, lastHash]);

  // 交易状态反馈
  useEffect(() => {
    if (isSending && hash) {
      message.loading({ content: "正在发送交易...", key: "tip", duration: 0 });
    } else if (isConfirming && hash) {
      message.loading({ content: "等待交易确认...", key: "tip", duration: 0 });
    }
  }, [isSending, isConfirming, hash]);

  // 交易成功反馈
  useEffect(() => {
    if (isConfirmed && hash) {
      message.success({
        content: `打赏成功！感谢您的支持 🎉`,
        key: "tip",
        duration: 5,
      });
      setIsModalOpen(false);
      setAmount("");
      setLastHash(undefined);
    }
  }, [isConfirmed, hash]);

  // 交易错误反馈
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
                loading={isSending || isConfirming}
                disabled={!amount || parseFloat(amount) <= 0}
                className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                style={{
                  background:
                    "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
                }}
              >
                {isSending
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
