# FitAI 智能健身应用 - 部署手册

> 本手册适用于将FitAI健身应用部署到互联网
> 当前版本：健身应用专用（已移除宠物电商功能）

---

## 目录
1. [项目结构](#1-项目结构)
2. [GitHub部署](#2-github部署)
3. [服务器部署](#3-服务器部署)
4. [更新部署](#4-更新部署)
5. [域名与HTTPS](#5-域名与https)

---

## 1. 项目结构

```
kjds/                      # 项目根目录
├── server.js              # Node.js服务器
├── db.js                  # 数据库模块
├── package.json           # 依赖配置
├── DEPLOY.md              # 部署手册
├── data/                  # 数据存储
│   └── fitai.db           # SQLite数据库
└── public/                # 前端静态文件
    ├── fitness.html           # 健身应用首页
    ├── fitness-login.html     # 登录注册页
    ├── fitness-admin.html    # 管理后台
    ├── css/
    │   └── fitness.css
    └── js/
        └── fitness.js
```

### 保留的API接口

| 接口 | 说明 |
|------|------|
| POST /api/auth/register | 用户注册 |
| POST /api/auth/login | 用户登录 |
| GET /api/auth/me | 获取用户信息 |
| PUT /api/auth/profile | 更新用户资料 |
| POST /api/auth/admin/login | 管理员登录 |
| GET /api/admin/users | 用户列表 |
| GET /api/admin/stats | 统计数据 |
| GET /api/admin/user/:id | 用户详情 |
| POST /api/admin/admin | 创建管理员 |
| POST /api/ai/chat | AI对话 |

---

## 2. GitHub部署

### 2.1 初始化Git（首次部署）

```bash
cd /Users/mac/Documents/trae_projects/kjds

# 初始化Git仓库
git init

ignore 文件
cat > .gitignore# 创建 .git << 'EOF'
node_modules/
data/
*.log
.DS_Store
npm-debug.log*
.env
EOF

# 添加所有文件
git add .

# 提交代码
git commit -m "FitAI智能健身应用"

# 在GitHub创建仓库后，执行：
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

### 2.2 更新代码到GitHub（后续更新）

```bash
cd /Users/mac/Documents/trae_projects/kjds

# 添加所有修改
git add .

# 提交更新
git commit -m "更新说明"

# 推送到GitHub
git push origin main
```

---

## 3. 服务器部署

### 3.1 服务器初始化

```bash
# 连接服务器
ssh root@你的服务器IP

# 更新系统
apt update && apt upgrade -y

# 安装必要软件
apt install -y nodejs npm nginx git

# 验证安装
node -v    # 应显示 v18.x.x
npm -v
nginx -v
```

### 3.2 创建应用目录

```bash
# 创建应用目录
mkdir -p /var/www/fitai
cd /var/www/fitai

# 克隆GitHub代码
git clone https://github.com/你的用户名/你的仓库名.git .

# 或者手动上传文件
```

### 3.3 安装依赖

```bash
cd /var/www/fitai
npm install
```

### 3.4 配置PM2进程管理

```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start server.js --name fitai

# 设置开机自启
pm2 startup
# 运行输出的命令

# 保存进程列表
pm2 save
```

### 3.5 配置Nginx反向代理

```bash
# 创建Nginx配置
vi /etc/nginx/conf.d/fitai.conf
```

写入以下内容：

```nginx
server {
    listen 80;
    server_name 你的服务器IP或域名;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# 测试并重启Nginx
nginx -t
systemctl restart nginx
```

### 3.6 防火墙配置

```bash
# 开放端口
ufw allow 22    # SSH
ufw allow 80     # HTTP
ufw allow 443    # HTTPS
ufw enable
```

---

## 4. 更新部署

当本地代码更新后，需要同步到服务器。

### 4.1 方式一：Git拉取更新（推荐）

```bash
# 连接服务器
ssh root@你的服务器IP

# 进入项目目录
cd /var/www/fitai

# 拉取最新代码
git pull origin main

# 重启应用
pm2 restart fitai

# 查看状态
pm2 status
```

### 4.2 方式二：手动上传更新

```bash
# 停止PM2
pm2 stop fitai

# 删除旧文件（保留data目录）
rm -rf /var/www/fitai/public/*
rm -rf /var/www/fitai/server.js
rm -rf /var/www/fitai/db.js

# 上传新文件（使用FileZilla或scp）

# 重新安装依赖
cd /var/www/fitai
npm install

# 启动应用
pm2 start fitai
```

### 4.3 数据备份（重要）

```bash
# 备份数据库
cp /var/www/fitai/data/fitai.db /var/www/fitai/data/fitai.db.backup.$(date +%Y%m%d)
```

---

## 5. 域名与HTTPS

### 5.1 域名解析

1. 购买域名（阿里云万网）
2. 添加A记录解析到服务器IP

### 5.2 配置HTTPS（免费SSL）

1. 申请免费SSL证书（阿里云SSL证书控制台）
2. 下载证书（Nginx格式）
3. 上传到服务器：

```bash
mkdir -p /etc/nginx/ssl

# 上传证书文件到 /etc/nginx/ssl/
# 证书文件：fitai.pem, fitai.key
```

4. 更新Nginx配置：

```nginx
server {
    listen 80;
    server_name 你的域名;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name 你的域名;

    ssl_certificate /etc/nginx/ssl/fitai.pem;
    ssl_certificate_key /etc/nginx/ssl/fitai.key;

    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    add_header Strict-Transport-Security "max-age=63072000" always;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

5. 重启Nginx：
```bash
nginx -t && systemctl restart nginx
```

---

## 常用命令

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs fitai

# 重启应用
pm2 restart fitai

# 查看Nginx状态
systemctl status nginx

# 重启Nginx
systemctl restart nginx

# 查看端口占用
netstat -tlnp | grep 3000
```

---

## 管理员账号

| 项目 | 值 |
|------|-----|
| 登录地址 | http://你的服务器IP/admin |
| 用户名 | admin |
| 密码 | admin123 |

---

## 常见问题

### 网站无法访问
```bash
# 检查PM2
pm2 status

# 检查端口
netstat -tlnp | grep 3000

# 检查Nginx
nginx -t
systemctl status nginx
```

### 数据库无法写入
```bash
# 检查data目录权限
ls -la /var/www/fitai/data

# 修复权限
chmod -R 755 /var/www/fitai/data
```

---

> 📝 手册版本：v2.0  
> 📅 更新日期：2026年2月19日  
> 📌 项目：FitAI智能健身应用
