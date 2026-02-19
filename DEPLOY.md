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

### 3.3 安装依赖并初始化

```bash
cd /var/www/fitai

# 安装依赖
npm install

# 创建数据目录（首次运行时会自动创建，也可手动创建）
mkdir -p data

# 启动应用（首次启动会自动创建数据库）
pm2 start server.js --name fitai

# 验证数据库是否创建成功
ls -la data/
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

> ⚠️ 注意：备份前请确保数据目录已创建。如果首次启动应用失败，先运行以下命令创建数据目录：
> ```bash
> mkdir -p /var/www/fitai/data
> pm2 restart fitai
> ```

#### 4.3.1 手动备份

```bash
# 创建备份目录
mkdir -p /var/backups/fitai

# 备份数据库文件
cp /var/www/fitai/data/fitai.db /var/backups/fitai/fitai.db.$(date +%Y%m%d_%H%M%S)

# 查看备份文件
ls -la /var/backups/fitai/
```

#### 4.3.2 自动备份（定时任务）

```bash
# 创建备份脚本
vi /usr/local/bin/backup-fitai.sh
```

写入以下内容：

```bash
#!/bin/bash

# 备份目录
BACKUP_DIR="/var/backups/fitai"
SOURCE_FILE="/var/www/fitai/data/fitai.db"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份文件名（包含日期时间）
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/fitai.db.$DATE"

# 执行备份
if [ -f "$SOURCE_FILE" ]; then
    cp "$SOURCE_FILE" "$BACKUP_FILE"
    echo "[$(date)] 备份成功: $BACKUP_FILE"
    
    # 清理7天前的旧备份
    find $BACKUP_DIR -name "fitai.db.*" -mtime +7 -delete
    echo "[$(date)] 已清理7天前的旧备份"
else
    echo "[$(date)] 警告: 源文件不存在: $SOURCE_FILE"
fi
```

```bash
# 添加执行权限
chmod +x /usr/local/bin/backup-fitai.sh

# 测试备份脚本
/usr/local/bin/backup-fitai.sh
```

#### 4.3.3 设置定时自动备份

```bash
# 编辑定时任务
crontab -e
```

添加以下行（每天凌晨3点执行）：

```
0 3 * * * /usr/local/bin/backup-fitai.sh >> /var/log/backup-fitai.log 2>&1
```

```bash
# 查看定时任务列表
crontab -l

# 查看备份日志
cat /var/log/backup-fitai.log
```

#### 4.3.4 恢复数据

```bash
# 1. 先停止应用
pm2 stop fitai

# 2. 查看可用备份
ls -la /var/backups/fitai/

# 3. 复制备份文件覆盖当前数据库
cp /var/backups/fitai/fitai.db.20260219_030000 /var/www/fitai/data/fitai.db

# 4. 重启应用
pm2 start fitai
```

#### 4.3.5 异地备份（可选 - 备份到本地电脑）

```bash
# 在本地电脑执行，从服务器下载备份
scp root@你的服务器IP:/var/backups/fitai/fitai.db.* ./

# 或使用FileZilla等SFTP工具下载
```

---

## 5. 域名与HTTPS

### 5.1 购买域名

1. 访问 [阿里云万网](https://wanwang.aliyun.com) 或 [腾讯云DNSPod](https://dnspod.cn)
2. 搜索想要的域名
3. 加入购物车并完成支付
4. 建议选择：.com、.cn、.io 等常见后缀

### 5.2 配置域名解析

1. 登录阿里云控制台 → "域名解析"
2. 点击"添加记录"：

| 记录类型 | 主机记录 | 记录值 |
|----------|----------|--------|
| A | @ | 你的服务器公网IP |
| A | www | 你的服务器公网IP |

3. 等待生效（通常1-30分钟）

### 5.3 申请免费SSL证书

1. 登录阿里云控制台
2. 搜索"SSL证书" → "免费证书"
3. 点击"创建证书"
4. 填写你的域名（如 yourdomain.com）
5. 验证域名所有权（DNS验证自动完成）
6. 审核通过后下载证书（Nginx格式）

### 5.4 配置HTTPS

#### 步骤1：上传证书到服务器

```bash
# 创建SSL目录
mkdir -p /etc/nginx/ssl

# 方法A：使用scp上传（本地终端执行）
scp /本地/证书/目录/fitai.pem root@你的服务器IP:/etc/nginx/ssl/
scp /本地/证书/目录/fitai.key root@你的服务器IP:/etc/nginx/ssl/

# 方法B：使用FileZilla等SFTP工具上传
# 上传到 /etc/nginx/ssl/ 目录
```

#### 步骤2：配置Nginx

```bash
# 编辑Nginx配置
vi /etc/nginx/conf.d/fitai.conf
```

完整配置如下：

```nginx
# HTTP自动跳转到HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # HTTP跳转HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS配置
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL证书配置
    ssl_certificate /etc/nginx/ssl/fitai.pem;
    ssl_certificate_key /etc/nginx/ssl/fitai.key;

    # SSL安全配置
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # TLS协议版本
    ssl_protocols TLSv1.2 TLSv1.3;

    # 加密套件
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS安全头
    add_header Strict-Transport-Security "max-age=63072000" always;

    # 代理配置
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
# 测试配置
nginx -t

# 重启Nginx
systemctl restart nginx
```

#### 步骤5：验证HTTPS

访问 https://你的域名 ，确认：
- ✅ 锁形图标显示
- ✅ 证书有效

### 5.5 备案（国内服务器必须）

如果使用国内服务器，必须完成ICP备案：

1. 登录 https://beian.aliyun.com
2. 点击"开始备案"
3. 填写备案信息：
   - 个人：身份证、手机号、幕布照片
   - 企业：营业执照、法人信息等
4. 提交初审（1-2工作日）
5. 管局审核（20工作日左右）
6. 备案成功后，在网站底部添加备案号：

```html
<div style="text-align: center; padding: 20px; font-size: 12px; color: #666;">
    <a href="http://www.beian.miit.gov.cn" target="_blank">京ICP备XXXXXXXX号</a>
</div>
```

---

## 6. 监控与维护

### 6.1 查看系统资源

```bash
# 查看CPU和内存使用
top

# 或使用htop（更直观）
apt install -y htop
htop

# 查看磁盘使用
df -h

# 查看内存使用
free -h
```

### 6.2 查看应用日志

```bash
# 实时查看日志
pm2 logs fitai

# 查看最近100行日志
pm2 logs fitai --lines 100

# 查看错误日志
pm2 logs fitai --err
```

### 6.3 设置告警（可选）

可以使用PM2 Plus或自建监控：

```bash
# 安装监控模块
npm install -g pm2-plus
pm2 link
```

---

## 7. 安全加固

### 7.1 修改SSH端口

```bash
# 编辑SSH配置
vi /etc/ssh/sshd_config

# 找到 #Port 22，修改为：
Port 2222

# 重启SSH
systemctl restart ssh
```

### 7.2 禁用root登录

```bash
# 创建新用户
adduser deployer

# 赋予sudo权限
usermod -aG sudo deployer

# 配置SSH只允许新用户登录
vi /etc/ssh/sshd_config

# 添加：
AllowUsers deployer
PermitRootLogin no

# 重启SSH
systemctl restart ssh
```

### 7.3 配置防火墙

```bash
# 开放必要端口
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 3000/tcp  # Node.js（仅内部访问）

# 启用防火墙
ufw enable

# 查看状态
ufw status
```

### 7.4 定期更新系统

```bash
# 每周执行一次
apt update && apt upgrade -y
```

---

## 8. 常用命令速查

### 应用管理
```bash
# 查看应用状态
pm2 status

# 重启应用
pm2 restart fitai

# 停止应用
pm2 stop fitai

# 删除应用
pm2 delete fitai

# 查看日志
pm2 logs fitai

# 实时监控
pm2 monit
```

### Nginx管理
```bash
# 测试配置
nginx -t

# 重启
systemctl restart nginx

# 停止
systemctl stop nginx

# 查看状态
systemctl status nginx
```

### 日志查看
```bash
# 系统日志
journalctl -u nginx -f

# 访问日志
tail -f /var/log/nginx/access.log

# 错误日志
tail -f /var/log/nginx/error.log
```

### 端口与进程
```bash
# 查看端口占用
netstat -tlnp | grep 3000

# 查看所有Node进程
ps aux | grep node

# 查看进程树
pstree -p
```

---

## 9. 管理员账号

| 项目 | 值 |
|------|-----|
| 登录地址 | http://你的服务器IP/admin |
| 用户名 | admin |
| 密码 | admin123 |

### 修改管理员密码

1. 登录管理后台
2. 点击"管理员"菜单
3. 创建新管理员，或修改现有密码

---

## 10. 常见问题解决

### 问题1：网站无法访问

```bash
# 1. 检查PM2是否运行
pm2 status

# 2. 检查端口3000是否监听
netstat -tlnp | grep 3000

# 3. 检查Nginx是否运行
systemctl status nginx

# 4. 检查防火墙
ufw status

# 5. 检查应用日志
pm2 logs fitai --lines 50
```

### 问题2：数据库无法写入

```bash
# 1. 检查data目录是否存在
ls -la /var/www/fitai/data/

# 2. 检查目录权限
ls -la /var/www/fitai/

# 3. 修复权限
chown -R www-data:www-data /var/www/fitai/data
chmod -R 755 /var/www/fitai/data

# 4. 如果目录不存在，手动创建
mkdir -p /var/www/fitai/data
chown -R www-data:www-data /var/www/fitai/data
```

### 问题3：域名解析不生效

```bash
# 1. 检查解析是否正确配置
nslookup yourdomain.com

# 2. 等待DNS传播（可能需要30分钟）
# 3. 清除本地DNS缓存
# Windows: ipconfig /flushdns
# Mac: sudo killall -HUP mDNSResponder
# Linux: systemd-resolve --flush-caches
```

### 问题4：HTTPS证书无效

```bash
# 1. 检查证书文件是否存在
ls -la /etc/nginx/ssl/

# 2. 检查证书是否过期
openssl x509 -in /etc/nginx/ssl/fitai.pem -noout -dates

# 3. 重新申请证书并上传
```

### 问题5：PM2应用启动失败

```bash
# 1. 查看错误日志
pm2 logs fitai --err

# 2. 手动启动测试
cd /var/www/fitai
node server.js

# 3. 检查端口是否被占用
lsof -i :3000

# 4. 杀死占用端口的进程
kill $(lsof -t -i:3000)

# 5. 重新启动
pm2 start server.js --name fitai
```

---

## 11. 快速部署命令汇总

```bash
# ========== 首次部署 ==========
# 1. 连接服务器
ssh root@你的服务器IP

# 2. 安装环境
apt update && apt install -y nodejs nginx git

# 3. 部署代码
mkdir -p /var/www/fitai
cd /var/www/fitai
git clone 你的GitHub仓库地址 .
npm install

# 4. 启动应用
npm install -g pm2
pm2 start server.js --name fitai
pm2 startup
pm2 save

# 5. 配置Nginx
# (见上文5.4节)

# ========== 更新部署 ==========
# 1. 连接服务器
ssh root@你的服务器IP

# 2. 备份数据
mkdir -p /var/backups/fitai
cp /var/www/fitai/data/fitai.db /var/backups/fitai/fitai.db.$(date +%Y%m%d)

# 3. 更新代码
cd /var/www/fitai
git pull origin main

# 4. 重启应用
pm2 restart fitai
```

---

> 📝 手册版本：v2.1  
> 📅 更新日期：2026年2月19日  
> 📌 项目：FitAI智能健身应用
