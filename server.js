const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const https = require('https');
const httpsAgent = new https.Agent({ keepAlive: true });
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'fitai_secret_key_2026';

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

function simpleToken(user) {
    const payload = JSON.stringify({ id: user.id, type: user.type, time: Date.now() });
    return Buffer.from(payload).toString('base64');
}

function verifyToken(token) {
    try {
        const decoded = Buffer.from(token, 'base64').toString();
        return JSON.parse(decoded);
    } catch (e) {
        return null;
    }
}

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = require('./db');

async function initializeApp() {
    try {
        db.getDb();
        console.log('数据库初始化完成');
    } catch (e) {
        console.error('数据库初始化失败:', e.message);
    }
}

initializeApp();

function generateToken(user) {
    const payload = {
        id: user.id,
        type: user.type,
        phone: user.phone,
        email: user.email,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000
    };
    return Buffer.from(JSON.stringify(payload)).toString('base64');
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: '请先登录' });
    }
    
    try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
        if (decoded.exp < Date.now()) {
            return res.status(403).json({ error: '登录已过期，请重新登录' });
        }
        req.user = decoded;
        next();
    } catch (e) {
        return res.status(403).json({ error: '登录无效，请重新登录' });
    }
}

function authenticateAdmin(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: '请先登录' });
    }
    
    try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
        if (decoded.exp < Date.now()) {
            return res.status(403).json({ error: '登录已过期，请重新登录' });
        }
        if (decoded.type !== 'admin') {
            return res.status(403).json({ error: '权限不足' });
        }
        req.user = decoded;
        next();
    } catch (e) {
        return res.status(403).json({ error: '登录无效，请重新登录' });
    }
}

app.post('/api/auth/register', async (req, res) => {
    const { phone, email, password, name } = req.body;
    
    if (!password) {
        return res.status(400).json({ error: '请设置密码' });
    }
    
    if (!phone && !email) {
        return res.status(400).json({ error: '请提供手机号或邮箱' });
    }
    
    try {
        if (phone) {
            const existing = db.query('users', { where: { phone } });
            if (existing.length > 0) {
                return res.status(400).json({ error: '该手机号已被注册' });
            }
        }
        
        if (email) {
            const existing = db.query('users', { where: { email } });
            if (existing.length > 0) {
                return res.status(400).json({ error: '该邮箱已被注册' });
            }
        }
        
        const hashedPassword = db.hashPassword(password);
        const userId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        db.insert('users', {
            id: userId,
            phone: phone || '',
            email: email || '',
            password: hashedPassword,
            name: name || '',
            profile: null,
            training_plan: null,
            diet_plan: null,
            created_at: new Date().toISOString(),
            last_login: null,
            login_count: 0
        });
        
        const token = generateToken({ id: userId, type: 'user', phone: phone || '', email: email || '' });
        
        res.json({
            success: true,
            token,
            user: {
                id: userId,
                phone: phone || '',
                email: email || '',
                name: name || '',
                type: 'user'
            }
        });
    } catch (e) {
        console.error('注册失败:', e);
        res.status(500).json({ error: '注册失败' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { phone, email, password } = req.body;
    
    if (!password) {
        return res.status(400).json({ error: '请输入密码' });
    }
    
    if (!phone && !email) {
        return res.status(400).json({ error: '请输入手机号或邮箱' });
    }
    
    try {
        let users;
        if (phone) {
            users = db.query('users', { where: { phone } });
        } else {
            users = db.query('users', { where: { email } });
        }
        
        if (users.length === 0) {
            return res.status(401).json({ error: '账号不存在' });
        }
        
        const user = users[0];
        const validPassword = user.password === db.hashPassword(password);
        
        if (!validPassword) {
            return res.status(401).json({ error: '密码错误' });
        }
        
        db.update('users', user.id, {
            last_login: new Date().toISOString(),
            login_count: (user.login_count || 0) + 1
        });
        
        const token = generateToken({ id: user.id, type: 'user', phone: user.phone, email: user.email });
        
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                phone: user.phone,
                email: user.email,
                name: user.name,
                type: 'user'
            }
        });
    } catch (e) {
        console.error('登录失败:', e);
        res.status(500).json({ error: '登录失败' });
    }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
    try {
        const users = db.query('users', { where: { id: req.user.id } });
        
        if (users.length === 0) {
            return res.status(404).json({ error: '用户不存在' });
        }
        
        const user = users[0];
        res.json({
            id: user.id,
            phone: user.phone,
            email: user.email,
            name: user.name,
            profile: user.profile ? JSON.parse(user.profile) : {},
            trainingPlan: user.training_plan ? JSON.parse(user.training_plan) : {},
            dietPlan: user.diet_plan ? JSON.parse(user.diet_plan) : {},
            createdAt: user.created_at,
            lastLogin: user.last_login
        });
    } catch (e) {
        console.error('获取用户信息失败:', e);
        res.status(500).json({ error: '获取用户信息失败' });
    }
});

app.put('/api/auth/profile', authenticateToken, (req, res) => {
    const { name, profile, trainingPlan, dietPlan } = req.body;
    
    try {
        const updates = {};
        if (name) updates.name = name;
        if (profile) updates.profile = JSON.stringify(profile);
        if (trainingPlan) updates.training_plan = JSON.stringify(trainingPlan);
        if (dietPlan) updates.diet_plan = JSON.stringify(dietPlan);
        
        if (Object.keys(updates).length > 0) {
            db.update('users', req.user.id, updates);
        }
        
        res.json({ success: true });
    } catch (e) {
        console.error('更新用户信息失败:', e);
        res.status(500).json({ error: '更新用户信息失败' });
    }
});

app.post('/api/auth/admin/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: '请输入用户名和密码' });
    }
    
    try {
        const admins = db.query('admins', { where: { username } });
        
        if (admins.length === 0) {
            return res.status(401).json({ error: '管理员账号不存在' });
        }
        
        const admin = admins[0];
        const validPassword = admin.password === db.hashPassword(password);
        
        if (!validPassword) {
            return res.status(401).json({ error: '密码错误' });
        }
        
        const token = generateToken({ id: admin.id, type: 'admin', username: admin.username });
        
        res.json({
            success: true,
            token,
            admin: {
                id: admin.id,
                username: admin.username,
                name: admin.name,
                type: 'admin'
            }
        });
    } catch (e) {
        console.error('管理员登录失败:', e);
        res.status(500).json({ error: '登录失败' });
    }
});

app.get('/api/admin/users', authenticateAdmin, (req, res) => {
    const { page = 1, limit = 20, search = '' } = req.query;
    
    try {
        let users;
        if (search) {
            users = db.query('users').filter(u => 
                (u.name && u.name.includes(search)) || 
                (u.phone && u.phone.includes(search)) || 
                (u.email && u.email.includes(search))
            );
        } else {
            users = db.query('users');
        }
        
        const total = users.length;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        users = users.slice(offset, offset + parseInt(limit));
        
        const userList = users.map(u => ({
            id: u.id,
            phone: u.phone,
            email: u.email,
            name: u.name,
            createdAt: u.created_at,
            lastLogin: u.last_login,
            loginCount: u.login_count || 0,
            hasProfile: !!u.profile,
            hasTrainingPlan: !!u.training_plan
        }));
        
        res.json({
            users: userList,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (e) {
        console.error('获取用户列表失败:', e);
        res.status(500).json({ error: '获取用户列表失败' });
    }
});

app.get('/api/admin/stats', authenticateAdmin, (req, res) => {
    try {
        const users = db.query('users');
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const thisMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const stats = {
            totalUsers: users.length,
            newUsersToday: users.filter(u => u.created_at && u.created_at.startsWith(today)).length,
            newUsersThisWeek: users.filter(u => u.created_at && u.created_at >= thisWeek).length,
            newUsersThisMonth: users.filter(u => u.created_at && u.created_at >= thisMonth).length,
            activeUsers: users.filter(u => u.last_login && u.last_login >= thisWeek).length,
            usersWithPlans: users.filter(u => u.training_plan).length,
            totalLogins: users.reduce((sum, u) => sum + (u.login_count || 0), 0)
        };
        
        res.json(stats);
    } catch (e) {
        console.error('获取统计数据失败:', e);
        res.status(500).json({ error: '获取统计数据失败' });
    }
});

app.get('/api/admin/user/:id', authenticateAdmin, (req, res) => {
    try {
        const users = db.query('users', { where: { id: req.params.id } });
        
        if (users.length === 0) {
            return res.status(404).json({ error: '用户不存在' });
        }
        
        const user = users[0];
        res.json({
            id: user.id,
            phone: user.phone,
            email: user.email,
            name: user.name,
            profile: user.profile ? JSON.parse(user.profile) : {},
            trainingPlan: user.training_plan ? JSON.parse(user.training_plan) : {},
            dietPlan: user.diet_plan ? JSON.parse(user.diet_plan) : {},
            createdAt: user.created_at,
            lastLogin: user.last_login,
            loginCount: user.login_count || 0
        });
    } catch (e) {
        console.error('获取用户详情失败:', e);
        res.status(500).json({ error: '获取用户详情失败' });
    }
});

app.post('/api/admin/admin', authenticateAdmin, (req, res) => {
    const { username, password, name } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: '请提供用户名和密码' });
    }
    
    try {
        const existing = db.query('admins', { where: { username } });
        if (existing.length > 0) {
            return res.status(400).json({ error: '用户名已存在' });
        }
        
        const hashedPassword = db.hashPassword(password);
        const adminId = 'admin-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        db.insert('admins', {
            id: adminId,
            username,
            password: hashedPassword,
            name: name || username,
            created_at: new Date().toISOString()
        });
        
        res.json({ success: true, admin: { id: adminId, username, name: name || username } });
    } catch (e) {
        console.error('创建管理员失败:', e);
        res.status(500).json({ error: '创建管理员失败' });
    }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'fitness.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'fitness-login.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'fitness-admin.html'));
});

const DASHSCOPE_API_KEY = 'sk-da1d47f6072445cca8159084c28b021f';

app.post('/api/ai/chat', async (req, res) => {
  const { message, context } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: '消息不能为空' });
  }
  
  const fitnessContext = `你是FitAI智能健身助手，专门帮助用户解答健身相关问题。
用户信息：年龄${context?.age || '未设置'}岁，身高${context?.height || '未设置'}cm，体重${context?.weight || '未设置'}kg，训练目标${getGoalName(context?.goal)}.
请用中文回答用户的健身问题，包括训练动作、饮食建议、减脂增肌、运动损伤等方面。
如果用户问的不是健身相关问题，可以简单回答并引导回到健身话题。
回答要专业、简洁、实用。`;
  
  const prompt = `${fitnessContext}

用户问题: ${message}

请回答:`;
  
  const requestData = {
    model: "qwen-turbo",
    input: {
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    },
    parameters: {
      result_format: "message"
    }
  };
  
  const postData = JSON.stringify(requestData);
  
  const options = {
    hostname: 'dashscope.aliyuncs.com',
    path: '/api/v1/services/aigc/text-generation/generation',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    },
    agent: httpsAgent
  };
  
  const req2 = https.request(options, (res2) => {
    let data = '';
    
    res2.on('data', (chunk) => {
      data += chunk;
    });
    
    res2.on('end', () => {
      try {
        const result = JSON.parse(data);
        
        if (result.output && result.output.choices && result.output.choices[0]) {
          const responseText = result.output.choices[0].message.content;
          res.json({ success: true, response: responseText });
        } else if (result.code) {
          console.error('API Error:', result);
          res.status(400).json({ error: result.message || 'API调用失败', details: result });
        } else {
          console.error('Unknown response:', result);
          res.status(500).json({ error: 'API响应格式错误' });
        }
      } catch (e) {
        console.error('解析响应失败:', e, data);
        res.status(500).json({ error: '解析响应失败' });
      }
    });
  });
  
  req2.on('error', (e) => {
    console.error('API请求失败:', e);
    res.status(500).json({ error: 'API请求失败: ' + e.message });
  });
  
  req2.write(postData);
  req2.end();
});

function getGoalName(goal) {
  const goals = {
    'lose_weight': '减脂',
    'build_muscle': '增肌',
    'improve_health': '改善健康',
    'endurance': '提升耐力',
    'flexibility': '提升柔韧性',
    'competition': '健美比赛'
  };
  return goals[goal] || '未设置';
}

app.listen(PORT, () => {
  console.log(`FitAI Server running at http://localhost:${PORT}`);
});
