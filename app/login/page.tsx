"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Form, message } from "antd";
import { GithubOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function LoginPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showResendEmail, setShowResendEmail] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string>("");
  const router = useRouter();
  const { signIn, signUp, signInWithGitHub, resendConfirmationEmail } =
    useAuth();

  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const result = isSignUp
        ? await signUp(values.email, values.password)
        : await signIn(values.email, values.password);

      if (result.error) {
        console.error("登录/注册错误:", result.error);
        const errorMessage = result.error.message || "操作失败，请重试";
        // 检查多个可能的错误码字段
        const errorObj = result.error as {
          code?: string;
          status?: string | number;
          name?: string;
        };
        const errorCode = errorObj.code || errorObj.status || errorObj.name;

        console.log("错误码:", errorCode, "错误信息:", errorMessage);

        // 如果是邮箱未验证错误，显示重新发送邮件的选项
        if (
          errorCode === "email_not_confirmed" ||
          errorMessage?.includes("Email not confirmed") ||
          errorMessage?.includes("email_not_confirmed")
        ) {
          setPendingEmail(values.email);
          setShowResendEmail(true);
          message.warning({
            content:
              "您的邮箱尚未验证。请检查您的邮箱收件箱（包括垃圾邮件文件夹），或点击下方按钮重新发送验证邮件。",
            duration: 8,
          });
        } else {
          message.error(errorMessage);
          setShowResendEmail(false);
        }
        setLoading(false);
        return;
      }

      // 检查是否有数据返回
      if (!result.data) {
        console.error("登录/注册返回数据为空");
        message.error("操作失败，请重试");
        setLoading(false);
        return;
      }

      if (isSignUp) {
        // 注册成功，检查是否需要邮箱验证
        if (result.data.user) {
          if (!result.data.session) {
            // 需要邮箱验证
            message.success({
              content: "注册成功！请检查您的邮箱以验证账户。验证后即可登录。",
              duration: 5,
            });
            setTimeout(() => {
              setIsSignUp(false);
              form.resetFields();
            }, 3000);
            setLoading(false);
            return;
          } else {
            // 注册成功且自动登录
            message.success("注册成功！欢迎加入！");
          }
        } else {
          console.error("注册失败：用户数据为空");
          message.error("注册失败，请重试");
          setLoading(false);
          return;
        }
      } else {
        // 登录逻辑
        if (!result.data.session) {
          console.error("登录失败：会话数据为空");
          message.error("登录失败，请检查您的邮箱和密码");
          setLoading(false);
          return;
        }
      }

      // 登录/注册成功，确保有 session
      if (result.data.session) {
        message.success(isSignUp ? "注册成功！" : "登录成功！");

        // 触发登录成功事件（useAuth hook 会监听并更新状态）
        window.dispatchEvent(
          new CustomEvent("auth:signed-in", { detail: result.data.session })
        );

        // 延迟跳转以确保状态更新
        // 只使用 router.push，避免多重刷新导致的问题
        setTimeout(() => {
          router.push("/");
        }, 500);
      } else {
        console.error("登录/注册成功但无会话数据");
        message.error("操作失败，请重试");
        setLoading(false);
      }
    } catch (err) {
      console.error("登录/注册异常:", err);
      const errorMessage =
        err instanceof Error ? err.message : "操作失败，请重试";
      message.error(errorMessage);
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!pendingEmail) {
      message.error("邮箱地址不能为空");
      return;
    }

    setResendLoading(true);
    try {
      const { error } = await resendConfirmationEmail(pendingEmail);
      if (error) {
        message.error(error.message || "发送验证邮件失败，请重试");
      } else {
        message.success({
          content: `验证邮件已发送至 ${pendingEmail}，请查收并点击链接完成验证。`,
          duration: 5,
        });
        setShowResendEmail(false);
      }
    } catch (err) {
      console.error("重新发送验证邮件异常:", err);
      message.error("发送验证邮件失败，请重试");
    } finally {
      setResendLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGitHub();
      if (error) {
        message.error(error.message);
        setLoading(false);
      }
    } catch {
      message.error("GitHub 登录失败，请重试");
      setLoading(false);
    }
  };

  return (
    <div className="relative isolate overflow-hidden min-h-screen flex items-center justify-center">
      <div className="absolute inset-0 -z-20 bg-[#060e1f] dark:bg-[#f8fafc]" />
      <div
        className="absolute inset-0 -z-10 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(72, 118, 255, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(72, 118, 255, 0.15) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="absolute -top-32 right-[-15%] h-96 w-96 -z-10 rounded-full bg-sky-500/30 blur-[140px]" />
      <div className="absolute -bottom-40 left-[-10%] h-96 w-96 -z-10 rounded-full bg-purple-500/20 blur-[160px]" />

      <div className="w-full max-w-md px-4">
        <div
          className="rounded-3xl border p-8 shadow-2xl backdrop-blur transition-colors duration-300"
          style={{
            backgroundColor: "var(--surface-bg)",
            borderColor: "var(--surface-border)",
            boxShadow: "var(--surface-shadow)",
          }}
        >
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-semibold text-(--surface-text) mb-2">
              {isSignUp ? "注册账户" : "欢迎回来"}
            </h1>
            <p className="text-sm text-(--surface-text)/70">
              {isSignUp ? "创建新账户以开始使用" : "登录以继续访问您的账户"}
            </p>
          </div>

          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            className="space-y-4"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "请输入邮箱地址" },
                { type: "email", message: "请输入有效的邮箱地址" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="邮箱地址"
                size="large"
                className="rounded-xl"
                style={{
                  backgroundColor: "var(--surface-bg)",
                  borderColor: "var(--surface-border)",
                  color: "var(--surface-text)",
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "请输入密码" },
                {
                  min: 6,
                  message: "密码至少需要 6 个字符",
                },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: "密码必须包含大小写字母和数字",
                },
              ]}
              help={
                isSignUp ? "密码至少 6 位，需包含大小写字母和数字" : undefined
              }
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={
                  isSignUp ? "密码（至少6位，包含大小写字母和数字）" : "密码"
                }
                size="large"
                className="rounded-xl"
                style={{
                  backgroundColor: "var(--surface-bg)",
                  borderColor: "var(--surface-border)",
                  color: "var(--surface-text)",
                }}
              />
            </Form.Item>

            {isSignUp && (
              <Form.Item
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "请确认密码" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("两次输入的密码不一致"));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="确认密码"
                  size="large"
                  className="rounded-xl"
                  style={{
                    backgroundColor: "var(--surface-bg)",
                    borderColor: "var(--surface-border)",
                    color: "var(--surface-text)",
                  }}
                />
              </Form.Item>
            )}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                className="rounded-xl bg-sky-500 hover:bg-sky-600"
              >
                {isSignUp ? "注册" : "登录"}
              </Button>
            </Form.Item>

            {showResendEmail && (
              <Form.Item>
                <div
                  className="rounded-lg border p-4"
                  style={{
                    backgroundColor: "var(--surface-bg)",
                    borderColor: "var(--surface-border)",
                  }}
                >
                  <p
                    className="text-sm mb-3"
                    style={{ color: "var(--surface-text)" }}
                  >
                    您的邮箱尚未验证。请检查您的邮箱收件箱（包括垃圾邮件文件夹），或点击下方按钮重新发送验证邮件。
                  </p>
                  <Button
                    type="default"
                    onClick={handleResendEmail}
                    loading={resendLoading}
                    block
                    size="middle"
                    className="rounded-xl"
                  >
                    重新发送验证邮件
                  </Button>
                </div>
              </Form.Item>
            )}
          </Form>

          <div className="my-6 flex items-center">
            <div
              className="flex-1 border-t"
              style={{ borderColor: "var(--surface-border)" }}
            />
            <span className="px-4 text-xs text-(--surface-text)/70">或</span>
            <div
              className="flex-1 border-t"
              style={{ borderColor: "var(--surface-border)" }}
            />
          </div>

          <Button
            icon={<GithubOutlined />}
            onClick={handleGitHubLogin}
            loading={loading}
            block
            size="large"
            className="rounded-xl border-slate-700 bg-slate-900/60 text-slate-200 hover:border-sky-500 hover:text-sky-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:text-sky-200"
            style={{
              borderColor: "var(--surface-border)",
              backgroundColor: "var(--surface-bg)",
              color: "var(--surface-text)",
            }}
          >
            使用 GitHub 登录
          </Button>

          <div className="mt-6 text-center text-sm">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setShowResendEmail(false);
                setPendingEmail("");
                form.resetFields();
              }}
              className="text-sky-400 hover:text-sky-300 transition-colors"
            >
              {isSignUp ? "已有账户？立即登录" : "没有账户？立即注册"}
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/"
              className="text-xs text-(--surface-text)/70 hover:text-sky-400 transition-colors"
            >
              返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
