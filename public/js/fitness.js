let userProfile = {};
let currentUser = null;
let currentWeek = 1;
let totalWeeks = 12;
let dailyFoodLog = [];
let dailyCalorieGoal = 2000;
let dailyProteinGoal = 150;
let currentDayOfWeek = new Date().getDay();
let todoStatus = {
    meals: {},
    training: false,
    mealCalories: {}
};

const foodDatabase = [
    { name: '米饭', icon: '🍚', calories: 116, protein: 2.6, carbs: 25.6, fat: 0.3, portion: '100g' },
    { name: '鸡胸肉', icon: '🍗', calories: 165, protein: 31, carbs: 0, fat: 3.6, portion: '100g' },
    { name: '牛肉', icon: '🥩', calories: 250, protein: 26, carbs: 0, fat: 15, portion: '100g' },
    { name: '鸡蛋', icon: '🥚', calories: 155, protein: 13, carbs: 1.1, fat: 11, portion: '100g' },
    { name: '牛奶', icon: '🥛', calories: 42, protein: 3.4, carbs: 5, fat: 1, portion: '100ml' },
    { name: '苹果', icon: '🍎', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, portion: '100g' },
    { name: '香蕉', icon: '🍌', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, portion: '100g' },
    { name: '面包', icon: '🍞', calories: 265, protein: 9, carbs: 49, fat: 3.2, portion: '100g' },
    { name: '面条', icon: '🍜', calories: 138, protein: 4.5, carbs: 25, fat: 2, portion: '100g' },
    { name: '饺子', icon: '🥟', calories: 253, protein: 8, carbs: 28, fat: 12, portion: '100g' },
    { name: '炒菜', icon: '🥬', calories: 78, protein: 2, carbs: 8, fat: 4, portion: '100g' },
    { name: '沙拉', icon: '🥗', calories: 35, protein: 1.5, carbs: 7, fat: 0.3, portion: '100g' },
    { name: '可乐', icon: '🥤', calories: 140, protein: 0, carbs: 39, fat: 0, portion: '330ml' },
    { name: '咖啡', icon: '☕', calories: 2, protein: 0.3, carbs: 0, fat: 0, portion: '100ml' },
    { name: '酸奶', icon: '🥛', calories: 63, protein: 3.2, carbs: 4.7, fat: 3.3, portion: '100g' },
    { name: '豆腐', icon: '🧈', calories: 76, protein: 8, carbs: 1.9, fat: 4.8, portion: '100g' },
    { name: '虾', icon: '🦐', calories: 99, protein: 24, carbs: 0.2, fat: 0.3, portion: '100g' },
    { name: '鱼', icon: '🐟', calories: 136, protein: 20, carbs: 0, fat: 5, portion: '100g' },
    { name: '米饭(满碗)', icon: '🍚', calories: 232, protein: 5.2, carbs: 51.2, fat: 0.6, portion: '200g' },
    { name: '鸡腿', icon: '🍗', calories: 209, protein: 26, carbs: 0, fat: 10.9, portion: '100g' }
];

const exerciseDatabase = {
    胸部: [
        { name: '卧推', sets: 4, reps: '8-12', rest: '90秒', tips: '双手握距略宽于肩，保持肩胛骨收紧', video: 'bench_press.mp4' },
        { name: '哑铃飞鸟', sets: 3, reps: '12-15', rest: '60秒', tips: '动作缓慢，控制幅度，避免肩部过度用力', video: 'dumbbell_fly.mp4' },
        { name: '俯卧撑', sets: 3, reps: '15-20', rest: '60秒', tips: '保持身体直线，核心收紧', video: 'pushup.mp4' },
        { name: '绳索夹胸', sets: 3, reps: '12-15', rest: '60秒', tips: '肘部微屈，想象抱树', video: 'cable_fly.mp4' }
    ],
    背部: [
        { name: '引体向上', sets: 4, reps: '6-12', rest: '120秒', tips: '背部发力，带动手臂', video: 'pullup.mp4' },
        { name: '杠铃划船', sets: 4, reps: '8-12', rest: '90秒', tips: '保持背部挺直，核心收紧', video: 'barbell_row.mp4' },
        { name: '高位下拉', sets: 3, reps: '10-15', rest: '60秒', tips: '胸部挺直，想象把杆拉向下巴', video: 'lat_pulldown.mp4' },
        { name: '哑铃划船', sets: 3, reps: '10-12', rest: '60秒', tips: '单手完成，另一手支撑', video: 'dumbbell_row.mp4' }
    ],
    腿部: [
        { name: '深蹲', sets: 4, reps: '8-12', rest: '120秒', tips: '膝盖与脚尖同向，臀部后坐', video: 'squat.mp4' },
        { name: '硬拉', sets: 4, reps: '8-10', rest: '120秒', tips: '保持背部挺直，重量贴近身体', video: 'deadlift.mp4' },
        { name: '腿举', sets: 3, reps: '12-15', rest: '90秒', tips: '脚距宽窄改变刺激部位', video: 'leg_press.mp4' },
        { name: '腿弯举', sets: 3, reps: '12-15', rest: '60秒', tips: '动作缓慢，充分收缩', video: 'leg_curl.mp4' }
    ],
    肩部: [
        { name: '哑铃推举', sets: 4, reps: '8-12', rest: '90秒', tips: '肘部略低于肩部', video: 'shoulder_press.mp4' },
        { name: '侧平举', sets: 3, reps: '12-15', rest: '60秒', tips: '小重量，多次重复', video: 'lateral_raise.mp4' },
        { name: '前平举', sets: 3, reps: '12-15', rest: '60秒', tips: '保持手臂伸直', video: 'front_raise.mp4' },
        { name: '面拉', sets: 3, reps: '12-15', rest: '60秒', tips: '绳索高度与头部同高', video: 'face_pull.mp4' }
    ],
    手臂: [
        { name: '哑铃弯举', sets: 3, reps: '10-12', rest: '60秒', tips: '避免借力', video: 'bicep_curl.mp4' },
        { name: '绳索下压', sets: 3, reps: '12-15', rest: '60秒', tips: '手肘紧贴身体', video: 'tricep_pushdown.mp4' },
        { name: '锤式弯举', sets: 3, reps: '10-12', rest: '60秒', tips: '掌心相对', video: 'hammer_curl.mp4' },
        { name: '窄距俯卧撑', sets: 3, reps: '10-15', rest: '60秒', tips: '双手靠近', video: 'narrow_pushup.mp4' }
    ],
    有氧: [
        { name: '跑步', duration: '30-45分钟', intensity: '中等', tips: '保持匀速，注意呼吸', video: 'running.mp4' },
        { name: '椭圆机', duration: '30-45分钟', intensity: '中等', tips: '脚不离踏板', video: 'elliptical.mp4' },
        { name: '跳绳', duration: '15-20分钟', intensity: '高', tips: '双膝微屈', video: 'jump_rope.mp4' },
        { name: '自行车', duration: '30-60分钟', intensity: '中等', tips: '调整阻力', video: 'cycling.mp4' }
    ],
    核心: [
        { name: '平板支撑', duration: '60-90秒', intensity: '中-高', tips: '保持身体直线', video: 'plank.mp4' },
        { name: '卷腹', sets: 3, reps: '15-20', rest: '45秒', tips: '不要用力拉脖子', video: 'crunch.mp4' },
        { name: '俄罗斯转体', sets: 3, reps: '20次', rest: '45秒', tips: '重心放在核心', video: 'russian_twist.mp4' },
        { name: '仰卧抬腿', sets: 3, reps: '12-15', rest: '45秒', tips: '下背部贴地', video: 'leg_raise.mp4' }
    ]
};

const gymData = [
    { name: '铁人健身工作室', address: '市中心商业区', distance: '0.5km', price: 899, rating: 4.8, features: ['器械区', '自由重量', '私教', '团课'], description: '专业器械齐全，教练团队优秀' },
    { name: '超级猩猩', address: '各区均有分店', distance: '1.2km', price: 699, rating: 4.6, features: ['24小时', '团课', '器械区'], description: '连锁品牌，课程丰富' },
    { name: '一兆韦德', address: '高端商业中心', distance: '2.0km', price: 1299, rating: 4.9, features: ['游泳池', '桑拿', '篮球场', '私教'], description: '高端健身会所，设施一流' },
    { name: '乐刻健身', address: '社区店', distance: '0.3km', price: 299, rating: 4.3, features: ['24小时', '自助'], description: '性价比高，方便快捷' },
    { name: '威尔仕', address: '购物中心', distance: '1.5km', price: 999, rating: 4.7, features: ['器械区', '游泳池', '团课'], description: '国际连锁，服务优质' },
    { name: '舒适堡', address: '写字楼内', distance: '0.8km', price: 599, rating: 4.5, features: ['器械区', '瑜伽', '桑拿'], description: '老牌健身品牌' }
];

const supplementData = [
    { name: '乳清蛋白粉', category: 'protein', price: 328, effect: '帮助肌肉恢复与生长', description: '高品质乳清蛋白，快速吸收', icon: '💪' },
    { name: '增肌粉', category: 'protein', price: 398, effect: '高效增肌，增加体重', description: '高热量配方，适合偏瘦人群', icon: '🏋️' },
    { name: '肌酸', category: 'preworkout', price: 168, effect: '提升力量和爆发力', description: '提高运动表现，增强泵感', icon: '⚡' },
    { name: '氮泵', category: 'preworkout', price: 228, effect: '提升训练专注度和泵感', description: '训练前20分钟服用', icon: '🔥' },
    { name: '左旋肉碱', category: 'fatburner', price: 198, effect: '辅助脂肪燃烧', description: '运动前服用效果更佳', icon: '💨' },
    { name: '减脂胶囊', category: 'fatburner', price: 268, effect: '提高基础代谢', description: '配合运动使用', icon: '📉' },
    { name: '维生素D3', category: 'vitamins', price: 89, effect: '促进钙吸收，增强免疫', description: '随餐服用', icon: '☀️' },
    { name: '复合维生素', category: 'vitamins', price: 158, effect: '补充多种维生素', description: '日常营养补充', icon: '🌟' },
    { name: '鱼油', category: 'vitamins', price: 128, effect: '保护心血管健康', description: '富含Omega-3', icon: '🐟' },
    { name: '支链氨基酸', category: 'protein', price: 188, effect: '减少肌肉分解', description: '训练中或训练后服用', icon: '🔗' }
];

function initUserMenu() {
    const token = localStorage.getItem('fitai_token');
    const userStr = localStorage.getItem('fitai_user');
    
    if (token && userStr) {
        try {
            currentUser = JSON.parse(userStr);
            updateUserMenu(true);
        } catch (e) {
            localStorage.removeItem('fitai_token');
            localStorage.removeItem('fitai_user');
            updateUserMenu(false);
        }
    } else {
        updateUserMenu(false);
    }
}

function updateUserMenu(isLoggedIn) {
    const avatarIcon = document.getElementById('avatarIcon');
    const dropdownContent = document.getElementById('dropdownContent');
    
    if (isLoggedIn && currentUser) {
        const initial = currentUser.name ? currentUser.name.charAt(0) : (currentUser.phone ? currentUser.phone.charAt(0) : '用户');
        avatarIcon.textContent = initial;
        
        dropdownContent.innerHTML = `
            <div class="user-info">
                <div class="name">${currentUser.name || '用户'}</div>
                <div class="phone">${currentUser.phone || currentUser.email || ''}</div>
            </div>
            <a href="#" onclick="showProfilePage()">修改个人信息</a>
            <a href="#" onclick="logoutUser()">退出登录</a>
        `;
    } else {
        avatarIcon.textContent = '👤';
        dropdownContent.innerHTML = `
            <a href="#" onclick="showLoginModal()">登录 / 注册</a>
        `;
    }
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('show');
}

function showLoginModal() {
    window.location.href = '/login';
}

function showProfilePage() {
    toggleUserDropdown();
    showPage('profile');
}

function logoutUser() {
    localStorage.removeItem('fitai_token');
    localStorage.removeItem('fitai_user');
    currentUser = null;
    updateUserMenu(false);
    showPage('home');
}

function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageName + '-page').classList.add('active');
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.textContent.includes(getPageName(pageName))) {
            link.classList.add('active');
        }
    });

    if (pageName === 'gym') {
        renderGyms(gymData);
    } else if (pageName === 'supplements') {
        renderSupplements(supplementData);
    } else if (pageName === 'plan' && Object.keys(userProfile).length > 0) {
        generatePlanOverview();
        renderTrainingPlan();
        renderDietPlan();
        renderSleepPlan();
        renderResultsPrediction();
        renderTodayTodo();
    }
}

function getPageName(pageName) {
    const names = {
        'home': '首页',
        'profile': '身体档案',
        'food': '食物识别',
        'plan': '训练计划',
        'gym': '健身房',
        'supplements': '补剂'
    };
    return names[pageName] || '';
}

function handleImageUpload(input, previewId) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById(previewId);
            preview.innerHTML = `<img src="${e.target.result}" alt="预览">`;
        };
        reader.readAsDataURL(file);
    }
}

function handleFoodImage(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('foodPreview');
            preview.innerHTML = `<img src="${e.target.result}" alt="食物">`;
        };
        reader.readAsDataURL(file);
    }
}

function analyzeFood() {
    const description = document.getElementById('foodDescription').value;
    const foods = matchFoods(description);
    
    displayFoodResults(foods);
    
    foods.forEach(food => {
        dailyFoodLog.push(food);
    });
    
    updateDailySummary();
}

function matchFoods(description) {
    const matched = [];
    const desc = description.toLowerCase();
    
    foodDatabase.forEach(food => {
        if (desc.includes(food.name.toLowerCase())) {
            matched.push({...food});
        }
    });
    
    if (matched.length === 0) {
        const randomFoods = foodDatabase.sort(() => 0.5 - Math.random()).slice(0, 2);
        randomFoods.forEach(food => matched.push({...food}));
    }
    
    return matched;
}

function displayFoodResults(foods) {
    const resultDiv = document.getElementById('foodResult');
    const grid = document.getElementById('foodResultGrid');
    
    resultDiv.style.display = 'block';
    grid.innerHTML = '';
    
    let totalCal = 0, totalPro = 0, totalCarb = 0, totalFat = 0;
    
    foods.forEach(food => {
        totalCal += food.calories;
        totalPro += food.protein;
        totalCarb += food.carbs;
        totalFat += food.fat;
        
        grid.innerHTML += `
            <div class="food-item">
                <div class="food-item-icon">${food.icon}</div>
                <div class="food-item-info">
                    <h4>${food.name}</h4>
                    <p>${food.calories} kcal | 蛋白质${food.protein}g | 碳水${food.carbs}g | 脂肪${food.fat}g</p>
                </div>
            </div>
        `;
    });
    
    document.getElementById('totalCalories').textContent = totalCal + ' kcal';
    document.getElementById('totalProtein').textContent = totalPro.toFixed(1) + 'g';
    document.getElementById('totalCarbs').textContent = totalCarb.toFixed(1) + 'g';
    document.getElementById('totalFat').textContent = totalFat.toFixed(1) + 'g';
}

function updateDailySummary() {
    let totalCal = 0, totalPro = 0;
    
    dailyFoodLog.forEach(food => {
        totalCal += food.calories;
        totalPro += food.protein;
    });
    
    document.getElementById('calorieProgress').textContent = `${totalCal} / ${dailyCalorieGoal} kcal`;
    document.getElementById('proteinProgress').textContent = `${totalPro.toFixed(0)} / ${dailyProteinGoal}g`;
    
    document.getElementById('calorieBar').style.width = Math.min((totalCal / dailyCalorieGoal) * 100, 100) + '%';
    document.getElementById('proteinBar').style.width = Math.min((totalPro / dailyProteinGoal) * 100, 100) + '%';
    
    const logList = document.getElementById('foodLogList');
    logList.innerHTML = dailyFoodLog.map((food, index) => `
        <div class="food-log-item">
            <div class="food-info">
                <span>${food.icon}</span>
                <span>${food.name} (${food.portion})</span>
            </div>
            <span class="calories">${food.calories} kcal</span>
        </div>
    `).join('');
}

function generatePlan() {
    userProfile = {
        name: document.getElementById('userName').value || '用户',
        age: parseInt(document.getElementById('userAge').value) || 25,
        gender: document.getElementById('userGender').value || 'male',
        height: parseInt(document.getElementById('userHeight').value) || 170,
        weight: parseFloat(document.getElementById('userWeight').value) || 70,
        waist: parseFloat(document.getElementById('userWaist').value) || 80,
        bodyFat: parseFloat(document.getElementById('userBodyFat').value) || 20,
        muscle: parseFloat(document.getElementById('userMuscle').value) || 30,
        bmr: parseFloat(document.getElementById('userBmr').value) || calculateBMR(),
        goal: document.getElementById('userGoal').value || 'lose_weight',
        targetWeight: parseFloat(document.getElementById('targetWeight').value) || 65,
        targetBodyFat: parseFloat(document.getElementById('targetBodyFat').value) || 15,
        targetWeeks: parseInt(document.getElementById('targetWeeks').value) || 12,
        exerciseFrequency: document.getElementById('exerciseFrequency').value || '3-4',
        exercisePreference: document.getElementById('exercisePreference').value || 'gym',
        sleepHours: parseFloat(document.getElementById('sleepHours').value) || 7,
        workType: document.getElementById('workType').value || 'sedentary'
    };
    
    totalWeeks = userProfile.targetWeeks;
    dailyCalorieGoal = calculateDailyCalories();
    dailyProteinGoal = calculateDailyProtein();
    
    showPage('plan');
}

function calculateBMR() {
    const height = parseInt(document.getElementById('userHeight').value) || 170;
    const weight = parseFloat(document.getElementById('userWeight').value) || 70;
    const age = parseInt(document.getElementById('userAge').value) || 25;
    const gender = document.getElementById('userGender').value || 'male';
    
    if (gender === 'male') {
        return Math.round(66.5 + (13.75 * weight) + (5.003 * height) - (6.755 * age));
    } else {
        return Math.round(655.1 + (9.563 * weight) + (1.850 * height) - (4.676 * age));
    }
}

function calculateDailyCalories() {
    const bmr = userProfile.bmr || calculateBMR();
    const activityFactors = {
        '0': 1.2,
        '1-2': 1.375,
        '3-4': 1.55,
        '5-6': 1.725,
        '7': 1.9
    };
    
    const activityFactor = activityFactors[userProfile.exerciseFrequency] || 1.55;
    let targetCalories = Math.round(bmr * activityFactor);
    
    if (userProfile.goal === 'lose_weight') {
        targetCalories -= 500;
    } else if (userProfile.goal === 'build_muscle') {
        targetCalories += 300;
    }
    
    return targetCalories;
}

function calculateDailyProtein() {
    const weight = userProfile.weight || 70;
    let proteinPerKg = 1.8;
    
    if (userProfile.goal === 'lose_weight') {
        proteinPerKg = 2.0;
    } else if (userProfile.goal === 'build_muscle') {
        proteinPerKg = 2.2;
    }
    
    return Math.round(weight * proteinPerKg);
}

function generatePlanOverview() {
    const goalNames = {
        'lose_weight': '减脂瘦身',
        'build_muscle': '增肌塑形',
        'improve_health': '改善健康',
        'endurance': '提升耐力',
        'flexibility': '提升柔韧性',
        'competition': '健美比赛'
    };
    
    document.getElementById('displayGoal').textContent = goalNames[userProfile.goal] || '减脂瘦身';
    document.getElementById('displayDuration').textContent = totalWeeks + '周';
    document.getElementById('displayFrequency').textContent = userProfile.exerciseFrequency === '0' ? '从零开始' : userProfile.exerciseFrequency + '次/周';
    
    const weightDiff = userProfile.weight - userProfile.targetWeight;
    document.getElementById('displayEffect').textContent = weightDiff > 0 ? `-${weightDiff.toFixed(1)}kg` : `+${Math.abs(weightDiff).toFixed(1)}kg`;
}

function renderTrainingPlan() {
    const days = generateTrainingDays();
    const container = document.getElementById('trainingDays');
    container.innerHTML = '';
    
    const getExerciseType = (typeStr) => {
        if (typeStr.includes('+')) {
            return typeStr.split('+')[0];
        }
        return typeStr;
    };
    
    days.forEach((day, index) => {
        let exerciseHTML = '';
        
        if (day.type === '休息') {
            exerciseHTML = `
                <div class="rest-day-content">
                    <div class="rest-tips">
                        <h4>🌙 休息建议</h4>
                        <ul>
                            ${day.restTips.map(tip => `<li>${tip}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="light-activity">
                        <h4>🚶 轻度活动（可选）</h4>
                        <ul>
                            ${day.lightActivity.map(act => `<li>${act}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        } else {
            const exerciseTypes = day.exercises || [getExerciseType(day.type)];
            let allExercises = [];
            
            exerciseTypes.forEach(type => {
                if (exerciseDatabase[type]) {
                    allExercises = [...allExercises, ...exerciseDatabase[type].slice(0, 2)];
                }
            });
            
            exerciseHTML = allExercises.slice(0, 5).map(ex => `
                <div class="exercise-item" onclick="showExerciseDetail('${getExerciseType(day.type)}', '${ex.name}')">
                    <span class="exercise-name">${ex.name}</span>
                    <div class="exercise-detail-info">
                        <span>${ex.sets ? ex.sets + '组 x ' + ex.reps : ex.duration}</span>
                        <span>休息${ex.rest || '60秒'}</span>
                    </div>
                </div>
            `).join('');
        }
        
        container.innerHTML += `
            <div class="training-day ${day.type === '休息' ? 'rest-day' : ''}">
                <div class="day-header">
                    <span class="day-type ${day.type === '休息' ? 'rest' : ''}">${day.type}</span>
                    <span class="day-duration">${day.duration}</span>
                </div>
                <h3 class="day-title">${day.title}</h3>
                <div class="exercise-list">${exerciseHTML}</div>
            </div>
        `;
    });
    
    document.getElementById('currentWeek').textContent = `第${currentWeek}周`;
}

function generateTrainingDays() {
    const days = [];
    const frequency = userProfile.exerciseFrequency || '3-4';
    
    const weeklyWorkouts = {
        '0': 2,
        '1-2': 3,
        '3-4': 4,
        '5-6': 5,
        '7': 6
    };
    
    const numWorkouts = weeklyWorkouts[frequency] || 4;
    
    const weekProgress = Math.min((currentWeek - 1) / totalWeeks, 1);
    const intensityMultiplier = 1 + weekProgress * 0.3;
    
    const getWorkoutSchedule = (numWorkouts) => {
        const schedules = {
            2: [
                { type: '力量训练', title: '上半身力量训练', exercises: ['胸部', '背部', '肩部'], isRest: false },
                { type: '休息', title: '休息恢复', isRest: true },
                { type: '有氧', title: '有氧训练', exercises: ['有氧'], isRest: false },
                { type: '休息', title: '休息恢复', isRest: true },
                { type: '休息', title: '休息恢复', isRest: true },
                { type: '休息', title: '休息恢复', isRest: true },
                { type: '力量训练', title: '下半身力量训练', exercises: ['腿部', '核心'], isRest: false }
            ],
            3: [
                { type: '力量训练', title: '上半身力量训练', exercises: ['胸部', '背部', '核心'], isRest: false },
                { type: '休息', title: '休息恢复', isRest: true },
                { type: '有氧', title: '有氧训练', exercises: ['有氧'], isRest: false },
                { type: '休息', title: '休息恢复', isRest: true },
                { type: '力量训练', title: '下半身力量训练', exercises: ['腿部', '核心'], isRest: false },
                { type: '休息', title: '休息恢复', isRest: true },
                { type: '休息', title: '休息恢复', isRest: true }
            ],
            4: [
                { type: '力量训练', title: '胸部+背部训练', exercises: ['胸部', '背部'], isRest: false },
                { type: '休息', title: '休息恢复', isRest: true },
                { type: '力量训练', title: '腿部+核心训练', exercises: ['腿部', '核心'], isRest: false },
                { type: '休息', title: '休息恢复', isRest: true },
                { type: '力量训练', title: '肩部+手臂训练', exercises: ['肩部', '手臂'], isRest: false },
                { type: '休息', title: '休息恢复', isRest: true },
                { type: '有氧', title: '有氧训练', exercises: ['有氧'], isRest: false }
            ],
            5: [
                { type: '力量训练', title: '胸部+核心训练', exercises: ['胸部', '核心'], isRest: false },
                { type: '休息', title: '休息恢复', isRest: true },
                { type: '力量训练', title: '背部+核心训练', exercises: ['背部', '核心'], isRest: false },
                { type: '有氧', title: '有氧训练', exercises: ['有氧'], isRest: false },
                { type: '力量训练', title: '腿部训练', exercises: ['腿部'], isRest: false },
                { type: '休息', title: '休息恢复', isRest: true },
                { type: '有氧', title: '有氧训练', exercises: ['有氧'], isRest: false }
            ],
            6: [
                { type: '力量训练', title: '胸部训练', exercises: ['胸部'], isRest: false },
                { type: '休息', title: '休息恢复', isRest: true },
                { type: '力量训练', title: '背部训练', exercises: ['背部'], isRest: false },
                { type: '有氧', title: '有氧训练', exercises: ['有氧'], isRest: false },
                { type: '力量训练', title: '腿部训练', exercises: ['腿部'], isRest: false },
                { type: '有氧', title: '有氧训练', exercises: ['有氧'], isRest: false },
                { type: '休息', title: '休息恢复', isRest: true }
            ]
        };
        return schedules[numWorkouts] || schedules[4];
    };
    
    const allWorkouts = getWorkoutSchedule(numWorkouts);
    
    const restTips = [
        '保证7-9小时优质睡眠',
        '多补充水分，每天2-3升',
        '可以进行轻度拉伸',
        '训练后24-48小时肌肉酸痛是正常的',
        '可使用泡沫轴放松肌肉',
        '补充足够的蛋白质帮助恢复'
    ];
    
    const lightActivities = [
        '散步20-30分钟',
        '瑜伽拉伸15-20分钟',
        '轻松骑行',
        '游泳（轻松 pace）'
    ];
    
    for (let i = 0; i < 7; i++) {
        const workout = allWorkouts[i];
        
        if (workout.isRest || numWorkouts === 0) {
            const shuffledTips = [...restTips].sort(() => 0.5 - Math.random()).slice(0, 4);
            const shuffledActivities = [...lightActivities].sort(() => 0.5 - Math.random()).slice(0, 2);
            days.push({
                type: '休息',
                title: '休息恢复日',
                duration: '完全休息或轻度活动',
                restTips: shuffledTips,
                lightActivity: shuffledActivities
            });
        } else {
            const isCardio = workout.exercises && workout.exercises.includes('有氧');
            const duration = isCardio ? 
                `${Math.round(30 * intensityMultiplier)}-${Math.round(45 * intensityMultiplier)}分钟` :
                `${Math.round(45 * intensityMultiplier)}-${Math.round(60 * intensityMultiplier)}分钟`;
            
            days.push({
                type: workout.type,
                title: workout.title,
                duration: duration,
                intensity: Math.round((1 + weekProgress * 0.3) * 100) + '%',
                exercises: workout.exercises || []
            });
        }
    }
    
    return days;
}

function getDayTitle(type) {
    const titles = {
        '胸部': '胸部训练日',
        '背部': '背部训练日',
        '腿部': '腿部训练日',
        '肩部': '肩部训练日',
        '手臂': '手臂训练日',
        '有氧': '有氧训练日',
        '核心': '核心训练日',
        '休息': '完全休息'
    };
    return titles[type] || '训练日';
}

function showExerciseDetail(type, name) {
    const exercises = exerciseDatabase[type] || [];
    const exercise = exercises.find(e => e.name === name);
    
    if (!exercise) return;
    
    document.getElementById('exercise-detail-page').classList.add('active');
    document.querySelectorAll('.page').forEach(page => {
        if (page.id !== 'exercise-detail-page') {
            page.classList.remove('active');
        }
    });
    
    const detailContainer = document.getElementById('exerciseDetail');
    detailContainer.innerHTML = `
        <div class="exercise-video">
            <div class="video-placeholder">
                <div class="icon">🎬</div>
                <p>AI动作演示视频</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">${name}</p>
            </div>
        </div>
        <div class="exercise-info">
            <h2>${name}</h2>
            
            <h4>📋 训练参数</h4>
            <ul>
                <li><strong>组数：</strong>${exercise.sets || '3-4组'}</li>
                <li><strong>次数/时长：</strong>${exercise.reps || exercise.duration}</li>
                <li><strong>休息时间：</strong>${exercise.rest || '60-90秒'}</li>
            </ul>
            
            <h4>🎯 动作要领</h4>
            <ul>
                <li>${exercise.tips}</li>
                <li>保持动作标准，避免借力</li>
                <li>控制动作节奏，感受目标肌肉收缩</li>
                <li>如有不适，立即停止并咨询专业教练</li>
            </ul>
            
            <div class="exercise-tips">
                <h4>💡 小贴士</h4>
                <p>建议配合呼吸节奏发力，下放时吸气，上推时呼气。训练前做好热身，训练后适当拉伸。</p>
            </div>
        </div>
    `;
}

function changeWeek(direction) {
    currentWeek += direction;
    if (currentWeek < 1) currentWeek = 1;
    if (currentWeek > totalWeeks) currentWeek = totalWeeks;
    
    document.getElementById('currentWeek').textContent = `第${currentWeek}周`;
    renderTrainingPlan();
}

function showPlanTab(tabName) {
    document.querySelectorAll('.plan-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabName + '-tab').classList.add('active');
    event.target.classList.add('active');
}

function renderDietPlan() {
    const isRestDay = (dayIndex) => {
        const frequency = userProfile.exerciseFrequency || '3-4';
        const weeklyWorkouts = { '0': 2, '1-2': 3, '3-4': 4, '5-6': 5, '7': 6 };
        const numWorkouts = weeklyWorkouts[frequency] || 4;
        return dayIndex >= numWorkouts;
    };
    
    const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const weekProgress = Math.min((currentWeek - 1) / totalWeeks, 1);
    const calorieAdjustment = 1 - weekProgress * 0.1;
    
    const getMealsForDay = (isRest) => {
        const baseCalories = isRest ? dailyCalorieGoal * 0.85 : dailyCalorieGoal;
        const adjustedCalories = Math.round(baseCalories * calorieAdjustment);
        
        if (isRest) {
            return [
                { name: '早餐', time: '8:00', calories: Math.round(adjustedCalories * 0.3), items: [
                    { name: '全麦面包', amount: '2片' }, { name: '鸡蛋', amount: '1个' }, { name: '牛奶', amount: '200ml' }
                ]},
                { name: '午餐', time: '12:30', calories: Math.round(adjustedCalories * 0.35), items: [
                    { name: '米饭', amount: '100g' }, { name: '鱼肉', amount: '120g' }, { name: '蔬菜', amount: '200g' }
                ]},
                { name: '晚餐', time: '19:00', calories: Math.round(adjustedCalories * 0.35), items: [
                    { name: '米饭', amount: '80g' }, { name: '鸡胸肉', amount: '100g' }, { name: '蔬菜', amount: '200g' }
                ]}
            ];
        } else {
            return [
                { name: '早餐', time: '7:30', calories: Math.round(adjustedCalories * 0.3), items: [
                    { name: '全麦面包', amount: '3片' }, { name: '鸡蛋', amount: '2个' }, { name: '牛奶', amount: '250ml' }, { name: '香蕉', amount: '1根' }
                ]},
                { name: '训练前加餐', time: '10:00', calories: Math.round(adjustedCalories * 0.1), items: [
                    { name: '香蕉', amount: '1根' }, { name: '坚果', amount: '20g' }
                ]},
                { name: '午餐', time: '12:30', calories: Math.round(adjustedCalories * 0.3), items: [
                    { name: '米饭', amount: '150g' }, { name: '鸡胸肉', amount: '150g' }, { name: '蔬菜', amount: '200g' }, { name: '橄榄油', amount: '10ml' }
                ]},
                { name: '训练后加餐', time: '16:30', calories: Math.round(adjustedCalories * 0.1), items: [
                    { name: '蛋白粉', amount: '1勺' }, { name: '香蕉', amount: '1根' }
                ]},
                { name: '晚餐', time: '19:30', calories: Math.round(adjustedCalories * 0.2), items: [
                    { name: '米饭', amount: '100g' }, { name: '牛肉/鱼', amount: '120g' }, { name: '蔬菜', amount: '200g' }, { name: '豆腐', amount: '80g' }
                ]}
            ];
        }
    };
    
    let html = `<div class="week-selector">
            <button class="week-btn" onclick="changeDietWeek(-1)">◀ 上一周</button>
            <span id="currentDietWeek">第${currentWeek}周</span>
            <button class="week-btn" onclick="changeDietWeek(1)">下一周 ▶</button>
        </div>`;
    
    html += '<div class="diet-week-grid">';
    
    for (let i = 0; i < 7; i++) {
        const isRest = isRestDay(i);
        const meals = getMealsForDay(isRest);
        const dayCalories = meals.reduce((sum, m) => sum + m.calories, 0);
        
        html += `
            <div class="day-diet-card ${isRest ? 'rest-day' : 'workout-day'}">
                <div class="day-diet-header">
                    <h4>${dayNames[i]}</h4>
                    <span class="day-diet-type">${isRest ? '🌙 休息日' : '💪 训练日'}</span>
                </div>
                <div class="day-diet-calories">${dayCalories} kcal</div>
                <div class="day-meals">
                    ${meals.map(meal => `
                        <div class="meal-block">
                            <div class="meal-time">${meal.time}</div>
                            <div class="meal-name">${meal.name}</div>
                            <div class="meal-cal">${meal.calories} kcal</div>
                            <div class="meal-items">
                                ${meal.items.map(item => `<span>${item.name} ${item.amount}</span>`).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    
    html += `
        <div class="diet-summary">
            <h3>📊 本周营养要点</h3>
            <div class="summary-grid">
                <div class="summary-item">
                    <span class="label">日均热量</span>
                    <span class="value">${Math.round(dailyCalorieGoal * calorieAdjustment)} kcal</span>
                </div>
                <div class="summary-item">
                    <span class="label">蛋白质</span>
                    <span class="value">${dailyProteinGoal}g</span>
                </div>
                <div class="summary-item">
                    <span class="label">碳水</span>
                    <span class="value">${Math.round(dailyCalorieGoal * 0.4 / 4)}g</span>
                </div>
                <div class="summary-item">
                    <span class="label">脂肪</span>
                    <span class="value">${Math.round(dailyCalorieGoal * 0.25 / 9)}g</span>
                </div>
            </div>
        </div>
    `;
    
    const container = document.getElementById('dietPlan');
    container.innerHTML = html;
}

function changeDietWeek(direction) {
    currentWeek += direction;
    if (currentWeek < 1) currentWeek = 1;
    if (currentWeek > totalWeeks) currentWeek = totalWeeks;
    
    document.getElementById('currentDietWeek').textContent = `第${currentWeek}周`;
    renderDietPlan();
}

function renderTodayTodo() {
    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const today = new Date();
    const dayIndex = today.getDay();
    
    document.getElementById('todayDate').textContent = `周${dayNames[dayIndex]} ${today.getMonth() + 1}月${today.getDate()}日`;
    
    const frequency = userProfile.exerciseFrequency || '3-4';
    const weeklyWorkouts = { '0': 2, '1-2': 3, '3-4': 4, '5-6': 5, '7': 6 };
    const numWorkouts = weeklyWorkouts[frequency] || 4;
    const isRestDay = dayIndex >= numWorkouts;
    
    const weekProgress = Math.min((currentWeek - 1) / totalWeeks, 1);
    const calorieAdjustment = 1 - weekProgress * 0.1;
    const adjustedCalories = Math.round((isRestDay ? dailyCalorieGoal * 0.85 : dailyCalorieGoal) * calorieAdjustment);
    
    const todos = [];
    
    const mealCalorieTargets = {
        'breakfast': { target: adjustedCalories * 0.3, name: '早餐' },
        'pre-workout': { target: 150, name: '训练前加餐' },
        'lunch': { target: adjustedCalories * 0.3, name: '午餐' },
        'post-workout': { target: 200, name: '训练后加餐' },
        'dinner': { target: adjustedCalories * 0.2, name: '晚餐' }
    };
    
    const isMeal = (id) => ['breakfast', 'lunch', 'dinner', 'pre-workout', 'post-workout'].includes(id);
    
    if (isRestDay) {
        todos.push(
            { id: 'breakfast', title: '早餐', detail: `${adjustedCalories * 0.3} kcal`, type: 'meal', target: mealCalorieTargets.breakfast.target, completed: todoStatus.meals['breakfast'] || false },
            { id: 'lunch', title: '午餐', detail: `${adjustedCalories * 0.35} kcal`, type: 'meal', target: mealCalorieTargets.lunch.target, completed: todoStatus.meals['lunch'] || false },
            { id: 'dinner', title: '晚餐', detail: `${adjustedCalories * 0.35} kcal`, type: 'meal', target: mealCalorieTargets.dinner.target, completed: todoStatus.meals['dinner'] || false }
        );
    } else {
        todos.push(
            { id: 'breakfast', title: '早餐', detail: `${adjustedCalories * 0.3} kcal`, type: 'meal', target: mealCalorieTargets.breakfast.target, completed: todoStatus.meals['breakfast'] || false },
            { id: 'pre-workout', title: '训练前加餐', detail: '~150 kcal', type: 'meal', target: mealCalorieTargets['pre-workout'].target, completed: todoStatus.meals['pre-workout'] || false },
            { id: 'lunch', title: '午餐', detail: `${adjustedCalories * 0.3} kcal`, type: 'meal', target: mealCalorieTargets.lunch.target, completed: todoStatus.meals['lunch'] || false },
            { id: 'post-workout', title: '训练后加餐', detail: '~200 kcal', type: 'meal', target: mealCalorieTargets['post-workout'].target, completed: todoStatus.meals['post-workout'] || false },
            { id: 'dinner', title: '晚餐', detail: `${adjustedCalories * 0.2} kcal`, type: 'meal', target: mealCalorieTargets.dinner.target, completed: todoStatus.meals['dinner'] || false },
            { id: 'training', title: getTrainingTitle(dayIndex), detail: getTrainingDetail(dayIndex), type: 'training', completed: todoStatus.training }
        );
    }
    
    const todoList = document.getElementById('todoList');
    todoList.innerHTML = todos.map(todo => {
        const actualCalories = todoStatus.mealCalories ? (todoStatus.mealCalories[todo.id] || 0) : 0;
        const isCalorieMet = todo.target ? Math.abs(actualCalories - todo.target) <= 50 : false;
        
        let statusIcon = todo.completed ? '✓' : '';
        let statusClass = todo.completed ? 'completed' : '';
        let calorieStatus = '';
        
        if (isMeal(todo.id) && todo.completed) {
            if (isCalorieMet) {
                calorieStatus = '<span class="calorie-status success">✓ 热量达标</span>';
            } else if (actualCalories > 0) {
                const diff = actualCalories - todo.target;
                calorieStatus = `<span class="calorie-status ${diff > 0 ? 'over' : 'under'}">${diff > 0 ? '+' : ''}${diff} kcal</span>`;
            }
        }
        
        return `
            <div class="todo-item ${statusClass}" onclick="${isMeal(todo.id) ? `showMealDetail('${todo.id}')` : `toggleTodo('${todo.id}')`}">
                <div class="todo-checkbox">${statusIcon}</div>
                <div class="todo-content">
                    <div class="todo-title">${todo.title} ${calorieStatus}</div>
                    <div class="todo-detail">${todo.detail}</div>
                </div>
                <span class="todo-tag ${todo.type}">${todo.type === 'training' ? '🏋️ 训练' : '🍽️ 饮食'}</span>
            </div>
        `;
    }).join('');
    
    const completedCount = todos.filter(t => t.completed).length;
    const totalCount = todos.length;
    document.getElementById('todoProgress').textContent = `${completedCount}/${totalCount}`;
    document.getElementById('todoProgressBar').style.width = `${(completedCount / totalCount) * 100}%`;
}

function getTrainingTitle(dayIndex) {
    const frequency = userProfile.exerciseFrequency || '3-4';
    const weeklyWorkouts = { '0': 2, '1-2': 3, '3-4': 4, '5-6': 5, '7': 6 };
    const numWorkouts = weeklyWorkouts[frequency] || 4;
    const schedules = {
        2: ['', '上半身力量训练', '', '有氧训练', '', '', '', '下半身力量训练'],
        3: ['', '上半身力量训练', '', '有氧训练', '', '下半身力量训练', '', ''],
        4: ['', '胸部+背部训练', '', '腿部+核心训练', '', '肩部+手臂训练', '', '有氧训练'],
        5: ['', '胸部+核心训练', '', '背部+核心训练', '有氧训练', '腿部训练', '', '有氧训练'],
        6: ['', '胸部训练', '', '背部训练', '有氧训练', '腿部训练', '有氧训练', '']
    };
    const schedule = schedules[numWorkouts] || schedules[4];
    const title = schedule[dayIndex];
    return title || '休息日';
}

function getTrainingDetail(dayIndex) {
    const frequency = userProfile.exerciseFrequency || '3-4';
    const weeklyWorkouts = { '0': 2, '1-2': 3, '3-4': 4, '5-6': 5, '7': 6 };
    const numWorkouts = weeklyWorkouts[frequency] || 4;
    
    const schedules = {
        2: ['', '胸部+背部+肩部', '', '30分钟有氧', '', '', '', '腿部+核心'],
        3: ['', '胸部+背部+核心', '', '30分钟有氧', '', '腿部+核心', '', ''],
        4: ['', '胸部+背部', '', '腿部+核心', '', '肩部+手臂', '', '30分钟有氧'],
        5: ['', '胸部+核心', '', '背部+核心', '30分钟有氧', '腿部', '', '30分钟有氧'],
        6: ['', '胸部', '', '背部', '30分钟有氧', '腿部', '30分钟有氧', '']
    };
    const schedule = schedules[numWorkouts] || schedules[4];
    const detail = schedule[dayIndex];
    
    if (!detail) return '好好休息';
    return detail.includes('有氧') ? `约${detail}` : `${detail} 45-60分钟`;
}

function toggleTodo(todoId) {
    if (todoId === 'training') {
        todoStatus.training = !todoStatus.training;
    } else {
        todoStatus.meals[todoId] = !todoStatus.meals[todoId];
    }
    renderTodayTodo();
    saveTodoStatus();
}

function showMealDetail(mealId) {
    const modal = document.createElement('div');
    modal.className = 'meal-modal';
    modal.id = 'mealModal';
    modal.innerHTML = `
        <div class="meal-modal-content">
            <div class="meal-modal-header">
                <h3>${getMealName(mealId)} 打卡</h3>
                <span class="close-modal" onclick="closeMealModal()">×</span>
            </div>
            <div class="meal-modal-body">
                <div class="upload-section">
                    <div class="upload-box" onclick="document.getElementById('mealPhoto').click()">
                        <input type="file" id="mealPhoto" accept="image/*" hidden onchange="handleMealPhoto(this)">
                        <div class="upload-placeholder" id="mealPhotoPreview">
                            <span class="upload-icon">📷</span>
                            <span>点击上传食物照片</span>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label>食物描述</label>
                    <input type="text" id="mealDescription" placeholder="如：宫保鸡丁饭+米饭" oninput="estimateCalories()">
                </div>
                <div class="calorie-estimate">
                    <span>预估热量：</span>
                    <span id="estimatedCalories" class="calorie-value">0</span>
                    <span>kcal</span>
                </div>
                <div class="meal-foods-list" id="mealFoodsList"></div>
            </div>
            <div class="meal-modal-footer">
                <button class="btn btn-secondary" onclick="closeMealModal()">取消</button>
                <button class="btn btn-primary" onclick="confirmMeal('${mealId}')">确认打卡</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function getMealName(mealId) {
    const names = {
        'breakfast': '早餐',
        'lunch': '午餐',
        'dinner': '晚餐',
        'pre-workout': '训练前加餐',
        'post-workout': '训练后加餐'
    };
    return names[mealId] || '餐';
}

function closeMealModal() {
    const modal = document.getElementById('mealModal');
    if (modal) {
        modal.remove();
    }
}

let currentMealFoods = [];

function handleMealPhoto(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('mealPhotoPreview').innerHTML = `<img src="${e.target.result}" alt="食物">`;
            analyzeMealPhoto(e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

function analyzeMealPhoto(imageData) {
    const description = document.getElementById('mealDescription').value;
    const matchedFoods = matchFoods(description || '常见食物');
    
    currentMealFoods = matchedFoods;
    displayMealFoods(matchedFoods);
}

function estimateCalories() {
    const description = document.getElementById('mealDescription').value;
    const matchedFoods = matchFoods(description || '常见食物');
    currentMealFoods = matchedFoods;
    displayMealFoods(matchedFoods);
}

function displayMealFoods(foods) {
    const list = document.getElementById('mealFoodsList');
    const totalCal = foods.reduce((sum, f) => sum + f.calories, 0);
    
    document.getElementById('estimatedCalories').textContent = totalCal;
    
    list.innerHTML = foods.map((food, index) => `
        <div class="meal-food-item">
            <span>${food.icon} ${food.name}</span>
            <span>${food.calories} kcal</span>
        </div>
    `).join('');
}

function confirmMeal(mealId) {
    const totalCal = currentMealFoods.reduce((sum, f) => sum + f.calories, 0);
    todoStatus.mealCalories = todoStatus.mealCalories || {};
    todoStatus.mealCalories[mealId] = totalCal;
    todoStatus.meals[mealId] = true;
    
    renderTodayTodo();
    saveTodoStatus();
    closeMealModal();
}

function openAIAssistant() {
    document.getElementById('aiChatModal').classList.add('active');
}

function closeAIAssistant() {
    document.getElementById('aiChatModal').classList.remove('active');
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function askQuickQuestion(question) {
    document.getElementById('aiChatInput').value = question;
    sendMessage();
}

function sendMessage() {
    const input = document.getElementById('aiChatInput');
    const message = input.value.trim();
    if (!message) return;
    
    addUserMessage(message);
    input.value = '';
    
    const loadingMessage = addLoadingMessage();
    
    fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: message,
            context: userProfile
        })
    })
    .then(response => response.json())
    .then(data => {
        removeLoadingMessage(loadingMessage);
        if (data.success) {
            addAIMessage(data.response);
        } else {
            addAIMessage('抱歉，现在无法回答您的问题。请稍后再试。');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        removeLoadingMessage(loadingMessage);
        const fallbackResponse = getAIResponse(message);
        addAIMessage(fallbackResponse);
    });
}

function addLoadingMessage() {
    const container = document.getElementById('aiChatMessages');
    const loadingId = 'loading-' + Date.now();
    container.innerHTML += `
        <div class="ai-message" id="${loadingId}">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <p>正在思考中...</p>
            </div>
        </div>
    `;
    container.scrollTop = container.scrollHeight;
    return loadingId;
}

function removeLoadingMessage(loadingId) {
    const el = document.getElementById(loadingId);
    if (el) el.remove();
}

function addUserMessage(message) {
    const container = document.getElementById('aiChatMessages');
    container.innerHTML += `
        <div class="user-message">
            <div class="message-avatar">👤</div>
            <div class="message-content">
                <p>${message}</p>
            </div>
        </div>
    `;
    container.scrollTop = container.scrollHeight;
}

function addAIMessage(response) {
    const container = document.getElementById('aiChatMessages');
    container.innerHTML += `
        <div class="ai-message">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                ${response}
            </div>
        </div>
    `;
    container.scrollTop = container.scrollHeight;
}

function getAIResponse(question) {
    const q = question.toLowerCase();
    const today = new Date().getDay();
    
    if (q.includes('今天') || q.includes('今天练什么') || q.includes('今天训练')) {
        return getTodayTrainingInfo();
    }
    if (q.includes('增肌') || q.includes('长肌肉') || q.includes('肌肉')) {
        return `<p>增肌关键在于：</p>
<ul>
<li><strong>蛋白质摄入</strong>：每天每公斤体重摄入1.6-2.2克蛋白质</li>
<li><strong>力量训练</strong>：以8-12次的重量为主，刺激肌肉生长</li>
<li><strong>充足睡眠</strong>：肌肉在睡眠中恢复生长，保证7-9小时</li>
<li><strong>热量盈余</strong>：摄入略高于消耗，多300-500kcal</li>
</ul>
<p>建议训练后30分钟内补充蛋白质和碳水！</p>`;
    }
    if (q.includes('减脂') || q.includes('减肥') || q.includes('瘦')) {
        return `<p>减脂建议：</p>
<ul>
<li><strong>热量缺口</strong>：每天消耗比摄入多300-500kcal</li>
<li><strong>蛋白质</strong>：保持高蛋白摄入，每公斤1.6-2克，防止肌肉流失</li>
<li><strong>有氧训练</strong>：每周3-5次，每次30-45分钟</li>
<li><strong>力量训练</strong>：保持肌肉量，提高基础代谢</li>
<li><strong>睡眠</strong>：保证7-8小时，睡眠不足影响代谢</li>
</ul>`;
    }
    if (q.includes('拉伸') || q.includes('柔韧') || q.includes('放松')) {
        return `<p>训练后拉伸动作：</p>
<ul>
<li><strong>胸部</strong>：门框拉伸30秒</li>
<li><strong>背部</strong>：猫式伸展，10-15次</li>
<li><strong>腿部</strong>：前屈腿压腿，每侧30秒</li>
<li><strong>肩部</strong>：手臂交叉拉伸，每侧30秒</li>
</ul>
<p>拉伸可以减少肌肉酸痛，提高柔韧性！</p>`;
    }
    if (q.includes('饮食') || q.includes('吃') || q.includes('食谱')) {
        return `<p>健康饮食建议：</p>
<ul>
<li><strong>早餐</strong>：碳水+蛋白质+水果（燕麦+鸡蛋+牛奶）</li>
<li><strong>午餐</strong>：碳水+蛋白质+蔬菜（米饭+鸡胸肉+蔬菜）</li>
<li><strong>晚餐</strong>：蛋白质+蔬菜（鱼肉+蔬菜，不吃或少吃主食）</li>
<li><strong>加餐</strong>：坚果、香蕉、酸奶</li>
</ul>
<p>注意：训练前1-2小时不要吃太饱！</p>`;
    }
    if (q.includes('训练动作') || q.includes('动作') || q.includes('怎么做')) {
        return `<p>常见训练动作要点：</p>
<ul>
<li><strong>深蹲</strong>：膝盖与脚尖同向，臀部后坐，核心收紧</li>
<li><strong>卧推</strong>：握距略宽于肩，肩胛骨收紧，下放至胸部</li>
<li><strong>硬拉</strong>：背部挺直，重量贴近身体，膝盖微屈</li>
<li><strong>划船</strong>：背部发力，带动手臂，核心保持稳定</li>
</ul>
<p>记住：动作标准比重量更重要！</p>`;
    }
    if (q.includes('有氧') || q.includes('跑步') || q.includes('自行车')) {
        return `<p>有氧训练建议：</p>
<ul>
<li><strong>跑步</strong>：保持匀速，呼吸节奏稳定</li>
<li><strong>椭圆机</strong>：脚不离踏板，阻力适中</li>
<li><strong>跳绳</strong>：双膝微屈，核心收紧</li>
<li><strong>时间</strong>：每次30-45分钟，燃脂效果好</li>
</ul>
<p>建议在力量训练后进行有氧！</p>`;
    }
    if (q.includes('睡眠') || q.includes('休息') || q.includes('恢复')) {
        return `<p>训练后恢复建议：</p>
<ul>
<li><strong>睡眠</strong>：每天7-9小时，肌肉在睡眠中生长</li>
<li><strong>拉伸</strong>：训练后立即进行拉伸</li>
<li><strong>补充</strong>：训练后30分钟内补充蛋白质</li>
<li><strong>水分</strong>：每天2-3升水</li>
<li><strong>休息</strong>：同一肌群训练间隔48小时</li>
</ul>`;
    }
    if (q.includes('膝盖') || q.includes('腰') || q.includes('受伤') || q.includes('疼痛')) {
        return `<p>如果出现疼痛，请注意：</p>
<ul>
<li>立即停止训练，不要硬撑</li>
<li>轻微酸痛可以冰敷，严重时及时就医</li>
<li>训练前做好热身</li>
<li>动作要标准，避免代偿</li>
<li>建议咨询专业教练或物理治疗师</li>
</ul>
<p>健康最重要，不要勉强！</p>`;
    }
    if (q.includes('补剂') || q.includes('蛋白粉') || q.includes('肌酸')) {
        return `<p>常见补剂建议：</p>
<ul>
<li><strong>蛋白粉</strong>：训练后30分钟内补充，帮助肌肉恢复</li>
<li><strong>肌酸</strong>：提升力量和爆发力，每天5克</li>
<li><strong>氮泵</strong>：训练前20分钟服用，提升专注度</li>
<li><strong>维生素D</strong>：促进钙吸收，增强免疫</li>
</ul>
<p>补剂是辅助，饮食才是基础！</p>`;
    }
    
    return `<p感谢你的提问！</p>
<ul>
<li>可以问我关于训练动作、饮食建议、减脂增肌等问题</li>
<li>或者点击下方快捷问题快速获取答案</li>
</ul>`;
}

function getTodayTrainingInfo() {
    const frequency = userProfile.exerciseFrequency || '3-4';
    const weeklyWorkouts = { '0': 2, '1-2': 3, '3-4': 4, '5-6': 5, '7': 6 };
    const numWorkouts = weeklyWorkouts[frequency] || 4;
    
    const schedules = {
        2: ['', '上半身力量训练', '', '有氧训练', '', '', '', '下半身力量训练'],
        3: ['', '上半身力量训练', '', '有氧训练', '', '下半身力量训练', '', ''],
        4: ['', '胸部+背部训练', '', '腿部+核心训练', '', '肩部+手臂训练', '', '有氧训练'],
        5: ['', '胸部+核心训练', '', '背部+核心训练', '有氧训练', '腿部训练', '', '有氧训练'],
        6: ['', '胸部训练', '', '背部训练', '有氧训练', '腿部训练', '有氧训练', '']
    };
    
    const schedule = schedules[numWorkouts] || schedules[4];
    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const today = new Date().getDay();
    const training = schedule[today];
    
    if (!training) {
        return `<p>今天是<span style="color:#888">${dayNames[today]}</span>，是休息日！</p>
<ul>
<li>建议进行轻度活动，如散步、拉伸</li>
<li>保证充足睡眠，让身体恢复</li>
<li>注意饮食均衡</li>
</ul>`;
    }
    
    const isCardio = training.includes('有氧');
    return `<p>今天是<span style="color:#ff6b6b">${dayNames[today]}</span>，训练内容：</p>
<ul>
<li><strong>${training}</strong></li>
<li>${isCardio ? '有氧运动：30-45分钟' : '力量训练：45-60分钟'}</li>
<li>训练前记得热身5-10分钟</li>
<li>训练后做好拉伸放松</li>
</ul>
<p>加油！💪</p>`;
}

function saveTodoStatus() {
    const today = new Date().toDateString();
    const data = {
        date: today,
        status: todoStatus
    };
    localStorage.setItem('fitai_todo_' + today, JSON.stringify(data));
}

function loadTodoStatus() {
    const today = new Date().toDateString();
    const saved = localStorage.getItem('fitai_todo_' + today);
    if (saved) {
        const data = JSON.parse(saved);
        if (data.date === today) {
            todoStatus = data.status;
        }
    }
}

loadTodoStatus();

let assessmentData = {
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    bodyFat: '',
    muscle: '',
    goal: '',
    targetWeight: '',
    targetWeeks: '',
    exerciseFrequency: '',
    exercisePreference: '',
    sleepHours: '',
    workType: ''
};

let assessmentStep = 0;
const assessmentQuestions = [
    { key: 'name', question: '你好！我是你的AI健身助手 🤖\n\n首先，请告诉我你的名字怎么称呼？' },
    { key: 'age', question: '好的[name]！请问你今年多大年龄？' },
    { key: 'gender', question: '请问你的性别是？' },
    { key: 'height', question: '请问你的身高是多少厘米？' },
    { key: 'weight', question: '请问你现在的体重是多少公斤？' },
    { key: 'bodyFat', question: '你知道自己现在的体脂率吗？如果知道的话可以告诉我大概多少%，不知道的话也可以跳过。' },
    { key: 'goal', question: '你主要的健身目标是什么？例如：减脂瘦身、增肌塑形、改善健康、提升耐力等' },
    { key: 'targetWeight', question: '你的目标体重是多少公斤？' },
    { key: 'targetWeeks', question: '你希望用多长时间达成目标？（周）' },
    { key: 'exerciseFrequency', question: '你目前每周运动几次？例如：几乎不运动、每周1-2次、每周3-4次、每周5-6次、每天运动' },
    { key: 'exercisePreference', question: '你更偏好哪种训练方式？居家锻炼、健身房、户外运动、还是混合？' },
    { key: 'sleepHours', question: '你每天大概睡几个小时？' },
    { key: 'workType', question: '你的工作类型是？久坐办公、站立工作、体力工作、还是自由职业？' }
];

function startAIAssessment() {
    document.getElementById('assessmentIntro').style.display = 'none';
    document.getElementById('assessmentChat').style.display = 'block';
    assessmentStep = 0;
    assessmentData = {};
    document.getElementById('assessmentMessages').innerHTML = '';
    askNextQuestion();
}

function restartAssessment() {
    document.getElementById('assessmentIntro').style.display = 'block';
    document.getElementById('assessmentChat').style.display = 'none';
    document.getElementById('assessmentResult').style.display = 'none';
    assessmentStep = 0;
    assessmentData = {};
}

function askNextQuestion() {
    if (assessmentStep >= assessmentQuestions.length) {
        showAssessmentResult();
        return;
    }
    
    updateProgressDots(assessmentStep + 1);
    
    const q = assessmentQuestions[assessmentStep];
    let question = q.question;
    if (assessmentData.name && question.includes('[name]')) {
        question = question.replace('[name]', assessmentData.name);
    }
    
    addAIMessageToAssessment(question);
}

function updateProgressDots(step) {
    const dots = document.querySelectorAll('.progress-dots .dot');
    dots.forEach((dot, index) => {
        if (index + 1 < step) {
            dot.classList.add('completed');
            dot.classList.remove('active');
        } else if (index + 1 === step) {
            dot.classList.add('active');
            dot.classList.remove('completed');
        } else {
            dot.classList.remove('active', 'completed');
        }
    });
}

function addAIMessageToAssessment(message) {
    const container = document.getElementById('assessmentMessages');
    container.innerHTML += `
        <div class="ai-message">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <p>${message.replace(/\n/g, '<br>')}</p>
            </div>
        </div>
    `;
    container.scrollTop = container.scrollHeight;
}

function addUserMessageToAssessment(message) {
    const container = document.getElementById('assessmentMessages');
    container.innerHTML += `
        <div class="user-message">
            <div class="message-avatar">👤</div>
            <div class="message-content">
                <p>${message}</p>
            </div>
        </div>
    `;
    container.scrollTop = container.scrollHeight;
}

function handleAssessmentKeyPress(event) {
    if (event.key === 'Enter') {
        sendAssessmentMessage();
    }
}

function sendAssessmentMessage() {
    const input = document.getElementById('assessmentInput');
    const message = input.value.trim();
    if (!message) return;
    
    addUserMessageToAssessment(message);
    input.value = '';
    
    processAnswer(message);
}

function processAnswer(answer) {
    const q = assessmentQuestions[assessmentStep];
    const key = q.key;
    
    assessmentData[key] = parseAnswer(key, answer);
    
    assessmentStep++;
    
    setTimeout(() => {
        askNextQuestion();
    }, 500);
}

function parseAnswer(key, answer) {
    const lowerAnswer = answer.toLowerCase();
    
    switch(key) {
        case 'name':
            return answer.trim();
        case 'age':
            const age = answer.match(/\d+/);
            return age ? age[0] : '';
        case 'gender':
            if (lowerAnswer.includes('男') || lowerAnswer.includes('先生') || lowerAnswer.includes('m')) return 'male';
            if (lowerAnswer.includes('女') || lowerAnswer.includes('女士') || lowerAnswer.includes('f')) return 'female';
            return '';
        case 'height':
            const height = answer.match(/\d+/);
            return height ? height[0] : '';
        case 'weight':
            const weight = answer.match(/\d+(\.\d+)?/);
            return weight ? weight[0] : '';
        case 'bodyFat':
            const bf = answer.match(/\d+(\.\d+)?/);
            if (lowerAnswer.includes('不') || lowerAnswer.includes('没') || lowerAnswer.includes('知') || lowerAnswer.includes('跳')) {
                return '';
            }
            return bf ? bf[0] : '';
        case 'goal':
            if (lowerAnswer.includes('减脂') || lowerAnswer.includes('瘦身') || lowerAnswer.includes('减肥')) return 'lose_weight';
            if (lowerAnswer.includes('增肌') || lowerAnswer.includes('长肌肉') || lowerAnswer.includes('塑形')) return 'build_muscle';
            if (lowerAnswer.includes('健康') || lowerAnswer.includes('体质')) return 'improve_health';
            if (lowerAnswer.includes('耐力')) return 'endurance';
            if (lowerAnswer.includes('柔韧')) return 'flexibility';
            return 'improve_health';
        case 'targetWeight':
            const tw = answer.match(/\d+(\.\d+)?/);
            return tw ? tw[0] : '';
        case 'targetWeeks':
            const weeks = answer.match(/\d+/);
            return weeks ? weeks[0] : '12';
        case 'exerciseFrequency':
            if (lowerAnswer.includes('不') || lowerAnswer.includes('0')) return '0';
            if (lowerAnswer.includes('1-2') || lowerAnswer.includes('1') || lowerAnswer.includes('两次')) return '1-2';
            if (lowerAnswer.includes('3-4') || lowerAnswer.includes('3') || lowerAnswer.includes('四次')) return '3-4';
            if (lowerAnswer.includes('5-6') || lowerAnswer.includes('5') || lowerAnswer.includes('六次')) return '5-6';
            if (lowerAnswer.includes('7') || lowerAnswer.includes('每天')) return '7';
            return '3-4';
        case 'exercisePreference':
            if (lowerAnswer.includes('居家') || lowerAnswer.includes('家里')) return 'home';
            if (lowerAnswer.includes('健身房') || lowerAnswer.includes(' gym')) return 'gym';
            if (lowerAnswer.includes('户外') || lowerAnswer.includes('外面')) return 'outdoor';
            return 'mixed';
        case 'sleepHours':
            const sleep = answer.match(/\d+(\.\d+)?/);
            return sleep ? sleep[0] : '7';
        case 'workType':
            if (lowerAnswer.includes('久坐') || lowerAnswer.includes('办公') || lowerAnswer.includes('坐')) return 'sedentary';
            if (lowerAnswer.includes('站立') || lowerAnswer.includes('站')) return 'standing';
            if (lowerAnswer.includes('体力') || lowerAnswer.includes('劳')) return 'active';
            return 'sedentary';
        default:
            return answer;
    }
}

function showAssessmentResult() {
    document.getElementById('assessmentChat').style.display = 'none';
    document.getElementById('assessmentResult').style.display = 'block';
    
    updateProgressDots(5);
    
    const goalNames = {
        'lose_weight': '减脂瘦身',
        'build_muscle': '增肌塑形',
        'improve_health': '改善健康',
        'endurance': '提升耐力',
        'flexibility': '提升柔韧性'
    };
    
    const genderNames = {
        'male': '男',
        'female': '女'
    };
    
    const frequencyNames = {
        '0': '几乎不运动',
        '1-2': '每周1-2次',
        '3-4': '每周3-4次',
        '5-6': '每周5-6次',
        '7': '每天运动'
    };
    
    const preferenceNames = {
        'home': '居家锻炼',
        'gym': '健身房',
        'outdoor': '户外运动',
        'mixed': '混合'
    };
    
    const workNames = {
        'sedentary': '久坐办公',
        'standing': '站立工作',
        'active': '体力工作',
        'freelance': '自由职业'
    };
    
    const summary = `
        <h4>📋 评估信息汇总</h4>
        <ul>
            <li><span class="label">姓名</span><span class="value">${assessmentData.name || '未设置'}</span></li>
            <li><span class="label">年龄</span><span class="value">${assessmentData.age || '未设置'}岁</span></li>
            <li><span class="label">性别</span><span class="value">${genderNames[assessmentData.gender] || '未设置'}</span></li>
            <li><span class="label">身高</span><span class="value">${assessmentData.height || '未设置'}cm</span></li>
            <li><span class="label">体重</span><span class="value">${assessmentData.weight || '未设置'}kg</span></li>
            <li><span class="label">体脂率</span><span class="value">${assessmentData.bodyFat ? assessmentData.bodyFat + '%' : '未设置'}</span></li>
            <li><span class="label">健身目标</span><span class="value">${goalNames[assessmentData.goal] || '未设置'}</span></li>
            <li><span class="label">目标体重</span><span class="value">${assessmentData.targetWeight || '未设置'}kg</span></li>
            <li><span class="label">计划周期</span><span class="value">${assessmentData.targetWeeks || '12'}周</span></li>
            <li><span class="label">运动频率</span><span class="value">${frequencyNames[assessmentData.exerciseFrequency] || '未设置'}</span></li>
            <li><span class="label">训练偏好</span><span class="value">${preferenceNames[assessmentData.exercisePreference] || '未设置'}</span></li>
            <li><span class="label">睡眠时长</span><span class="value">${assessmentData.sleepHours || '7'}小时</span></li>
            <li><span class="label">工作类型</span><span class="value">${workNames[assessmentData.workType] || '未设置'}</span></li>
        </ul>
    `;
    
    document.getElementById('resultSummary').innerHTML = summary;
}

function generatePlanFromAssessment() {
    document.getElementById('userName').value = assessmentData.name;
    document.getElementById('userAge').value = assessmentData.age;
    document.getElementById('userGender').value = assessmentData.gender;
    document.getElementById('userHeight').value = assessmentData.height;
    document.getElementById('userWeight').value = assessmentData.weight;
    document.getElementById('userBodyFat').value = assessmentData.bodyFat;
    document.getElementById('userGoal').value = assessmentData.goal;
    document.getElementById('targetWeight').value = assessmentData.targetWeight;
    document.getElementById('targetWeeks').value = assessmentData.targetWeeks;
    document.getElementById('exerciseFrequency').value = assessmentData.exerciseFrequency;
    document.getElementById('exercisePreference').value = assessmentData.exercisePreference;
    document.getElementById('sleepHours').value = assessmentData.sleepHours;
    document.getElementById('workType').value = assessmentData.workType;
    
    generatePlan();
}

function renderSleepPlan() {
    const sleepData = [
        {
            title: '睡眠时长',
            items: [
                '建议每天保证7-9小时优质睡眠',
                '固定作息时间，形成生物钟',
                '训练日可适当增加睡眠时间'
            ]
        },
        {
            title: '睡前习惯',
            items: [
                '睡前1小时避免使用电子设备',
                '睡前2小时停止进食',
                '可进行轻度拉伸放松'
            ]
        },
        {
            title: '睡眠质量',
            items: [
                '保持卧室温度18-22℃',
                '使用遮光窗帘',
                '可使用耳塞或眼罩'
            ]
        },
        {
            title: '训练后恢复',
            items: [
                '训练后及时补充蛋白质',
                '可使用泡沫轴放松',
                '深呼吸练习帮助放松'
            ]
        }
    ];
    
    const container = document.getElementById('sleepPlan');
    container.innerHTML = sleepData.map(item => `
        <div class="sleep-card">
            <h4>${item.title}</h4>
            <ul>
                ${item.items.map(i => `<li>✓ ${i}</li>`).join('')}
            </ul>
        </div>
    `).join('');
}

function renderResultsPrediction() {
    const weightLoss = userProfile.weight - userProfile.targetWeight;
    const bodyFatLoss = userProfile.bodyFat - userProfile.targetBodyFat;
    const muscleGain = userProfile.goal === 'build_muscle' ? 3 : 0;
    
    const results = [
        {
            title: '体重变化',
            value: weightLoss > 0 ? `-${weightLoss.toFixed(1)}kg` : `+${Math.abs(weightLoss).toFixed(1)}kg`,
            desc: '预计体重变化'
        },
        {
            title: '体脂率',
            value: `-${bodyFatLoss.toFixed(1)}%`,
            desc: '预计体脂率下降'
        },
        {
            title: '肌肉量',
            value: `+${muscleGain}kg`,
            desc: '预计肌肉增长'
        },
        {
            title: '腰围',
            value: `-${((userProfile.waist - userProfile.targetWeight / userProfile.height * 100) || 5).toFixed(1)}cm`,
            desc: '预计腰围减小'
        }
    ];
    
    const container = document.getElementById('resultsPrediction');
    container.innerHTML = results.map(r => `
        <div class="result-card">
            <h4>${r.title}</h4>
            <div class="result-value">${r.value}</div>
            <div class="result-desc">${r.desc}</div>
        </div>
    `).join('');
}

function searchGyms() {
    const location = document.getElementById('userLocation').value;
    const budget = document.getElementById('budgetRange').value;
    const features = document.getElementById('gymFeatures').value;
    
    let filtered = [...gymData];
    
    if (budget) {
        const priceRanges = { 'low': [0, 500], 'medium': [500, 1000], 'high': [1000, 2000], 'premium': [2000, 99999] };
        const range = priceRanges[budget];
        filtered = filtered.filter(g => g.price >= range[0] && g.price < range[1]);
    }
    
    if (features) {
        filtered = filtered.filter(g => g.features.includes(getFeatureName(features)));
    }
    
    renderGyms(filtered);
}

function getFeatureName(feature) {
    const names = {
        'pool': '游泳池',
        'sauna': '桑拿',
        'group': '团课',
        'pt': '私教',
        '24h': '24小时'
    };
    return names[feature] || feature;
}

function renderGyms(gyms) {
    const container = document.getElementById('gymList');
    container.innerHTML = gyms.map(gym => `
        <div class="gym-card">
            <div class="gym-image">🏢</div>
            <div class="gym-info">
                <h3>${gym.name}</h3>
                <p class="gym-address">📍 ${gym.address} | 距离${gym.distance}</p>
                <p class="gym-description">${gym.description}</p>
                <div class="gym-features">
                    ${gym.features.map(f => `<span class="feature-tag">${f}</span>`).join('')}
                </div>
                <div class="gym-price">
                    <span class="price">¥${gym.price}/月</span>
                    <span class="rating">⭐ ${gym.rating}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function renderSupplements(supplements) {
    const container = document.getElementById('supplementList');
    container.innerHTML = supplements.map(supp => `
        <div class="supplement-card" data-category="${supp.category}">
            <div class="supplement-icon">${supp.icon}</div>
            <h4>${supp.name}</h4>
            <p class="description">${supp.description}</p>
            <div class="supp-price price">¥${supp.price}</div>
            <div class="effect">${supp.effect}</div>
        </div>
    `).join('');
}

function filterSupplements(category) {
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    const cards = document.querySelectorAll('.supplement-card');
    cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initUserMenu();
    renderSupplements(supplementData);
    renderGyms(gymData);
});
