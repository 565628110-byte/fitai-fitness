# FitAI 智能健身应用 - 完整部署手册

> 本手册将帮助你从零开始，将FitAI健身应用部署到互联网
> 预计完成时间：2-4小时（不含备案等待时间）

---

## 📋 部署架构概览

```
用户访问 → 域名 → CDN/阿里云DNS → 阿里云服务器 → Node.js应用
                                    ↓
                              数据存储 (data/fitai.db)
```

---

## 第一阶段：代码准备

### 1.1 创建GitHub仓库

1. 打开浏览器访问 https://github.com
2. 点击右上角 **"+"** → **"New repository"**
3. 填写信息：
   - Repository name: `fitai-fitness`
   - Description: `FitAI智能健身应用`
   - 选择 **Public** 或 **Private**
4. 点击 **"Create repository"**

### 1.2 初始化本地Git仓库

打开终端，进入项目目录：

```bash
cd /Users/mac/Documents/trae_projects/kjds

# 初始化Git
git init

# 创建 .gitignore 文件
cat > .gitignore << 'EOF'
node_modules/
data/
*.log
.DS_Store
npm-debug.log*
.env
EOF

# 添加所有文件
git add .

# 第一次提交
git commit -m "FitAI智能健身应用 - 初始版本"

# 关联GitHub仓库（将下面命令替换为你GitHub上的仓库地址）
git remote add origin https://github.com/你的GitHub用户名/fitai-fitness.git

# 推送到GitHub
git push -u origin main
```

> 💡 **提示**：如果遇到推送失败，可能需要先执行 `git pull origin main --allow-unrelated-histories`

---

## 第二阶段：阿里云服务器配置

### 2.1 购买服务器

1. 访问 https://www.aliyun.com 并登录
2. 点击 **"产品"** → **"云服务器ECS"**
3. 点击 **"立即购买"**，配置如下：

| 配置项 | 推荐选择 |
|--------|----------|
| 付费模式 | 按量付费 或 包年包月 |
| 地域 | 华北2（北京）/ 华北3（张家口）等 |
| 实例规格 | ecs.t6-c1m1.large (2核2G) |
| 操作系统 | Ubuntu 22.04 LTS |
| 存储 | 40GB SSD云盘 |
| 带宽 | 5-10Mbps |
| 公网IP | 勾选"分配公网IPv4地址" |

4. 确认订单并支付
5. 购买成功后，在ECS控制台记录：
   - **公网IP地址**（例如：47.xxx.xxx.xxx）
   - **登录密码**或设置**密钥对**

### 2.2 连接服务器

```bash
# 打开终端，连接服务器
ssh root@你的服务器IP

# 首次连接会提示确认，输入 yes 并回车
# 然后输入服务器密码
```

### 2.3 安装必要软件

```bash
# 更新系统
apt update && apt upgrade -y

# 安装Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 验证安装
node -v    # 应显示 v18.x.x
npm -v     # 应显示 9.x.x 或更高

# 安装Nginx
apt install -y nginx

# 安装Git
apt install -y git
```

### 2.4 配置防火墙

```bash
# 开放必要端口
ufw allow 22    # SSH
ufw allow 80     # HTTP
ufw allow 443    # HTTPS
ufw enable       # 启用防火墙
```

---

## 第三阶段：部署应用

### 3.1 创建应用目录并拉取代码

```bash
# 创建应用目录
mkdir -p /var/www/fitai
cd /var/www/fitai

# 从GitHub克隆代码
# 将下面的URL替换为你GitHub仓库的地址
git clone https://github.com/你的GitHub用户名/fitai-fitness.git .

# 如果是私有仓库，可能需要输入GitHub用户名和Token
```

### 3.2 安装依赖并测试

```bash
# 安装Node.js依赖
npm install

# 临时启动测试
node server.js

# 如果看到 "Server running at http://localhost:3000" 表示成功
# 按 Ctrl+C 停止测试
```

### 3.3 安装并配置PM2（进程管理器）

```bash
# 全局安装PM2
npm install -g pm2

# 使用PM2启动应用
pm2 start server.js --name fitai

# 设置开机自启
pm2 startup
# 运行输出的命令，例如：
# systemctl enable pm2-root

# 保存PM2进程列表
pm2 save
```

### 3.4 验证PM2运行状态

```bash
# 查看运行状态
pm2 status

# 查看日志
pm2 logs fitai

# 重启应用
pm2 restart fitai
```

---

## 第四阶段：配置Nginx反向代理

### 4.1 创建Nginx配置文件

```bash
vi /etc/nginx/conf.d/fitai.conf
```

按 `i` 进入编辑模式，粘贴以下内容：

```nginx
server {
    listen 80;
    server_name 你的服务器IP或域名;

    # 静态文件缓存
    location /static/ {
        alias /var/www/fitai/public/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API代理
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 主应用
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

按 `Esc` 退出编辑，输入 `:wq` 保存退出。

### 4.2 重启Nginx

```bash
# 测试配置是否正确
nginx -t

# 重启Nginx
systemctl restart nginx
```

### 4.3 访问测试

打开浏览器，访问：`http://你的服务器IP`

如果看到FitAI健身应用界面，说明部署成功！

---

## 第五阶段：域名配置（可选但推荐）

### 5.1 购买域名

1. 访问 https://wanwang.aliyun.com
2. 搜索想要的域名（如 `fitai.com` 或 `fitai.cn`）
3. 选择合适的域名后加入购物车
4. 完成支付

### 5.2 配置域名解析

1. 登录阿里云控制台
2. 进入 **"域名解析"**
3. 点击 **"添加记录"**：

| 记录类型 | 主机记录 | 记录值 |
|----------|----------|--------|
| A | @ | 你的服务器公网IP |
| A | www | 你的服务器公网IP |

4. 等待解析生效（通常几分钟）

### 5.3 更新Nginx配置

```bash
vi /etc/nginx/conf.d/fitai.conf
```

修改 `server_name` 为你的域名：

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    # ... 其余不变
}
```

```bash
nginx -t && systemctl restart nginx
```

---

## 第六阶段：HTTPS配置（推荐）

### 6.1 申请免费SSL证书

1. 登录阿里云控制台
2. 搜索 **"SSL证书"**
3. 点击 **"免费证书"** → **"创建证书"**
4. 填写你的域名，提交审核
5. 审核通过后下载证书

### 6.2 配置HTTPS

```bash
# 创建证书目录
mkdir -p /etc/nginx/ssl

# 上传证书文件到服务器
# 可以使用FileZilla或scp命令上传
# 假设证书文件为：fitai.pem 和 fitai.key

vi /etc/nginx/conf.d/fitai.conf
```

更新配置文件：

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    # HTTP自动跳转到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/nginx/ssl/fitai.pem;
    ssl_certificate_key /etc/nginx/ssl/fitai.key;

    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    add_header Strict-Transport-Security "max-age=63072000" always;

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
nginx -t && systemctl restart nginx
```

---

## 第七阶段：ICP备案（如需使用国内服务器）

### 7.1 备案条件
- 使用阿里云国内节点的服务器
- 有已完成注册的域名

### 7.2 备案流程

1. 登录 https://beian.aliyun.com
2. 点击 **"开始备案"**
3. 选择备案类型（个人/企业）
4. 填写信息：
   - 个人：身份证信息、手机号码、幕布照片
   - 企业：营业执照、法人信息等
5. 提交初审（1-2工作日）
6. 阿里云审核通过后，管局审核（20个工作日左右）
7. 备案成功后，将备案号挂在网站底部

### 7.3 备案信息模板

```html
<!-- 在 fitness.html 底部添加 -->
<div style="text-align: center; padding: 20px; font-size: 12px; color: #666;">
    <a href="http://www.beian.miit.gov.cn" target="_blank">京ICP备XXXXXXXX号</a>
</div>
```

---

## 第八阶段：数据备份

### 8.1 备份数据库

```bash
# 创建备份脚本
mkdir -p /var/backups/fitai
vi /usr/local/bin/backup-fitai.sh
```

添加以下内容：

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/fitai"
SOURCE_DIR="/var/www/fitai/data"

mkdir -p $BACKUP_DIR
cp $SOURCE_DIR/fitai.db $BACKUP_DIR/fitai_$DATE.db

# 只保留最近7天的备份
find $BACKUP_DIR -name "fitai_*.db" -mtime +7 -delete

echo "Backup completed: fitai_$DATE.db"
```

```bash
# 添加执行权限
chmod +x /usr/local/bin/backup-fitai.sh

# 设置定时任务（每天凌晨3点执行）
crontab -e
# 添加以下行：
0 3 * * * /usr/local/bin/backup-fitai.sh >> /var/log/backup-fitai.log 2>&1
```

---

## 部署检查清单

### ✅ 部署前检查
- [ ] 代码已推送到GitHub
- [ ] 阿里云服务器已购买
- [ ] 域名已购买（如需要）

### ✅ 服务器配置
- [ ] Node.js 已安装
- [ ] Nginx 已安装
- [ ] 防火墙已配置
- [ ] PM2 已配置并开机自启

### ✅ 应用部署
- [ ] 代码已克隆到服务器
- [ ] npm依赖已安装
- [ ] 应用可以正常启动
- [ ] 访问 http://服务器IP 正常

### ✅ 域名与安全
- [ ] 域名解析已配置
- [ ] SSL证书已申请
- [ ] HTTPS已配置
- [ ] 防火墙规则正确

### ✅ 数据安全
- [ ] 备份脚本已创建
- [ ] 定时任务已设置
- [ ] 重要数据已备份

---

## 常用命令速查

```bash
# 查看应用状态
pm2 status

# 查看应用日志
pm2 logs fitai

# 重启应用
pm2 restart fitai

# 查看Nginx状态
systemctl status nginx

# 重启Nginx
systemctl restart nginx

# 查看系统日志
journalctl -u nginx -f

# 查看端口占用
netstat -tlnp | grep 3000

# 实时查看访问日志
tail -f /var/log/nginx/access.log
```

---

## 常见问题解决

### 问题1：无法连接服务器
```bash
# 检查SSH服务状态
systemctl status ssh

# 检查防火墙
ufw status
```

### 问题2：网站无法访问
```bash
# 检查PM2是否运行
pm2 status

# 检查端口是否监听
netstat -tlnp | grep 3000

# 检查Nginx配置
nginx -t

# 查看Nginx错误日志
tail -f /var/log/nginx/error.log
```

### 问题3：数据库无法写入
```bash
# 检查data目录权限
ls -la /var/www/fitai/data

# 修复权限
chown -R www-data:www-data /var/www/fitai/data
chmod -R 755 /var/www/fitai/data
```

### 问题4：域名解析不生效
- 等待5-10分钟让DNS传播
- 检查域名解析记录是否正确
- 尝试刷新本地DNS：`ipconfig /flushdns` (Windows) 或 `sudo killall -HUP mDNSResponder` (Mac)

---

## 后续维护

### 更新应用版本
```bash
cd /var/www/fitai
git pull origin main
pm2 restart fitai
```

### 监控服务器资源
```bash
# 查看CPU和内存使用
htop

# 查看磁盘使用
df -h
```

### 扩展建议
- **数据库升级**：从文件数据库迁移到MySQL
- **CDN加速**：使用阿里云CDN加速静态资源
- **负载均衡**：使用SLB进行负载均衡
- **监控告警**：配置云监控告警

---

## 联系与支持

如果部署过程中遇到问题，可以：
1. 查阅PM2文档：https://pm2.keymetrics.io/docs/
2. 查阅Nginx文档：http://nginx.org/en/docs/
3. 阿里云工单支持

---

> 📝 **手册版本**：v1.0  
> 📅 **更新时间**：2026年2月19日  
> 👤 **项目**：FitAI智能健身应用
