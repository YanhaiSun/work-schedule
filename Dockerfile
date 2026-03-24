# 使用官方 Node.js 运行时作为基础镜像
FROM node:24-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 安装依赖（包括开发依赖用于构建）
RUN npm ci

# 复制应用源代码
COPY . .

# 构建 Next.js 应用
RUN npm run build

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]