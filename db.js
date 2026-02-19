const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_FILE = path.join(__dirname, 'data', 'fitai.db');

const db = {
    users: [],
    admins: [],
    userProgress: []
};

function loadDb() {
    try {
        if (fs.existsSync(DB_FILE)) {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('加载数据库失败:', e);
    }
    return { users: [], admins: [], userProgress: [] };
}

function saveDb(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

let dbData = null;

function getDb() {
    if (!dbData) {
        dbData = loadDb();
        
        if (dbData.admins.length === 0) {
            const hashPassword = crypto.createHash('sha256').update('admin123').digest('hex');
            dbData.admins.push({
                id: 'admin-001',
                username: 'admin',
                password: hashPassword,
                name: '系统管理员',
                created_at: new Date().toISOString()
            });
            saveDb(dbData);
            console.log('默认管理员账号已创建');
        }
    }
    return dbData;
}

function query(table, filter = {}) {
    const data = getDb();
    let rows = [...(data[table] || [])];
    
    if (filter.where) {
        rows = rows.filter(row => {
            for (const key in filter.where) {
                if (key.includes(' LIKE')) {
                    const field = key.replace(' LIKE', '');
                    const pattern = filter.where[key].replace(/%/g, '');
                    if (!row[field] || !row[field].includes(pattern)) return false;
                } else if (row[key] !== filter.where[key]) {
                    return false;
                }
            }
            return true;
        });
    }
    
    if (filter.orderBy) {
        const [field, desc] = filter.orderBy.split(' ');
        rows.sort((a, b) => {
            if (desc === 'DESC') return b[field] > a[field] ? 1 : -1;
            return a[field] > b[field] ? 1 : -1;
        });
    }
    
    if (filter.limit) {
        rows = rows.slice(filter.offset || 0, (filter.offset || 0) + filter.limit);
    }
    
    return rows;
}

function insert(table, data) {
    const db = getDb();
    db[table].push(data);
    saveDb(db);
    return [data];
}

function update(table, id, data) {
    const db = getDb();
    const index = db[table].findIndex(row => row.id === id);
    if (index !== -1) {
        db[table][index] = { ...db[table][index], ...data };
        saveDb(db);
        return true;
    }
    return false;
}

function count(table, filter = {}) {
    return query(table, filter).length;
}

function sum(table, field, filter = {}) {
    const rows = query(table, filter);
    return rows.reduce((sum, row) => sum + (row[field] || 0), 0);
}

module.exports = {
    getDb,
    query,
    insert,
    update,
    count,
    sum,
    hashPassword: (password) => crypto.createHash('sha256').update(password).digest('hex')
};
