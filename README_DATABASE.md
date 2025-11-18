# 数据库设置说明

## 用户表设置

本项目使用 Supabase 作为后端数据库。在开始使用之前，需要先创建用户表。

### 方法一：使用 Supabase Dashboard（推荐）

1. 登录 [Supabase Dashboard](https://app.supabase.com/)
2. 选择你的项目
3. 进入 **SQL Editor**
4. 复制 `supabase/migrations/001_create_users_table.sql` 文件中的内容
5. 粘贴到 SQL Editor 中并执行

### 方法二：使用 Supabase CLI

如果你已经安装了 Supabase CLI，可以运行：

```bash
supabase db push
```

## 环境变量配置

确保在 `.env.local` 文件中配置了以下环境变量：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**重要提示：**
- `SUPABASE_SERVICE_ROLE_KEY` 是服务端使用的密钥，具有更高的权限
- 请勿在客户端代码中暴露 `SUPABASE_SERVICE_ROLE_KEY`
- 可以在 Supabase Dashboard 的 **Settings > API** 中找到这些密钥

## 用户表结构

用户表 (`users`) 包含以下字段：

- `id` (UUID): 主键，关联 `auth.users.id`
- `email` (TEXT): 用户邮箱，唯一
- `username` (TEXT): 用户名（可选）
- `full_name` (TEXT): 全名（可选）
- `avatar_url` (TEXT): 头像 URL（可选）
- `bio` (TEXT): 个人简介（可选）
- `created_at` (TIMESTAMPTZ): 创建时间
- `updated_at` (TIMESTAMPTZ): 更新时间

## 自动创建用户记录

系统会在以下情况自动创建用户记录：

1. **数据库触发器**：当新用户在 `auth.users` 表中注册时，会自动在 `users` 表中创建对应的记录
2. **OAuth 回调**：GitHub OAuth 登录成功后，会在回调路由中创建用户记录
3. **邮箱注册**：邮箱注册成功后，会在客户端调用 API 创建用户记录

## API 使用示例

### 创建用户

```typescript
import { createUser } from "@/lib/user-api";

const user = await createUser({
  id: "user-uuid",
  email: "user@example.com",
  username: "username",
  full_name: "Full Name",
});
```

### 获取用户

```typescript
import { getUser } from "@/lib/user-api";

const user = await getUser("user-uuid");
```

### 更新用户

```typescript
import { updateUser } from "@/lib/user-api";

const updatedUser = await updateUser("user-uuid", {
  username: "new-username",
  bio: "New bio",
});
```

### 删除用户

```typescript
import { deleteUser } from "@/lib/user-api";

await deleteUser("user-uuid");
```

## API 路由

- `GET /api/users?id={userId}` - 根据 ID 查询用户
- `GET /api/users?email={email}` - 根据邮箱查询用户
- `GET /api/users` - 查询所有用户（需要认证）
- `POST /api/users` - 创建用户
- `PUT /api/users` - 更新用户
- `DELETE /api/users?id={userId}` - 删除用户
- `GET /api/users/[id]` - 根据 ID 查询单个用户
- `PUT /api/users/[id]` - 更新用户
- `DELETE /api/users/[id]` - 删除用户
- `POST /api/users/create-from-auth` - 从当前认证用户创建用户记录

## Row Level Security (RLS)

用户表启用了 RLS，策略如下：

- 用户可以查看自己的信息
- 用户可以更新自己的信息
- 用户可以插入自己的信息（注册时）
- 所有人可以查看用户的基本信息（公开用户列表）

如果需要修改权限策略，可以在 Supabase Dashboard 的 **Authentication > Policies** 中修改。

