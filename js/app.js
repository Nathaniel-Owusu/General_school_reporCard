// Core Application Logic

// Helper to get data
function getSchoolData() {
    return JSON.parse(localStorage.getItem('schoolData')) || MOCK_DATA;
}

// Security: Prevent XSS
function escapeHtml(text) {
    if (!text) return text;
    return text
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Helper to save data
function saveSchoolData(data) {
    localStorage.setItem('schoolData', JSON.stringify(data));
}

// Grade Calculation
// Grade Calculation
// Grade Calculation
function calculateGrade(total, gradingSystem) {
    // defaults
    const defaults = [
        { min: 80, max: 100, grade: '1', remark: 'HIGHEST', color: 'text-green-700', bg: 'bg-green-100' },
        { min: 70, max: 79, grade: '2', remark: 'HIGHER', color: 'text-blue-700', bg: 'bg-blue-100' },
        { min: 65, max: 69, grade: '3', remark: 'HIGH', color: 'text-blue-600', bg: 'bg-blue-50' },
        { min: 60, max: 64, grade: '4', remark: 'HIGH AVERAGE', color: 'text-yellow-700', bg: 'bg-yellow-100' },
        { min: 55, max: 59, grade: '5', remark: 'AVERAGE', color: 'text-yellow-600', bg: 'bg-yellow-50' },
        { min: 50, max: 54, grade: '6', remark: 'LOW AVERAGE', color: 'text-yellow-600', bg: 'bg-yellow-50' },
        { min: 45, max: 49, grade: '7', remark: 'LOW', color: 'text-orange-700', bg: 'bg-orange-100' },
        { min: 40, max: 44, grade: '8', remark: 'LOWER', color: 'text-red-600', bg: 'bg-red-50' },
        { min: 0, max: 39, grade: '9', remark: 'LOWEST', color: 'text-red-700', bg: 'bg-red-100' }
    ];

    let system = gradingSystem;
    if (!system) {
        try {
            const data = getSchoolData();
            if (data && data.settings && data.settings.gradingSystem && data.settings.gradingSystem.length > 0) {
                system = data.settings.gradingSystem;
            }
        } catch (e) {
            console.warn("Could not load grading system from data", e);
        }
    }
    
    if (!system) system = defaults;

    // Find the matching range
    // Ensure total is treated as a number
    total = parseFloat(total);

    for (let rule of system) {
        if (total >= rule.min && total <= rule.max) {
             // Map dynamic rules to colors if they don't have them (simple heuristic or default)
             let color = rule.color || 'text-gray-700';
             let bg = rule.bg || 'bg-gray-100';
             
             // If coming from settings, we might not have colors saved, so infer them or use defaults
             if(!rule.color) {
                 if(rule.remark.includes('HIGHEST') || rule.grade === 'A' || rule.grade === '1') { color = 'text-green-700'; bg = 'bg-green-100'; }
                 else if(rule.remark.includes('FAIL') || rule.grade === 'F' || rule.grade === '9') { color = 'text-red-700'; bg = 'bg-red-100'; }
                 else if(total >= 70) { color = 'text-blue-700'; bg = 'bg-blue-100'; }
                 else if(total >= 50) { color = 'text-yellow-700'; bg = 'bg-yellow-100'; }
                 else { color = 'text-orange-700'; bg = 'bg-orange-100'; }
             }

             return { 
                 grade: rule.grade, 
                 remark: rule.remark, 
                 color: color, 
                 bg: bg 
             };
        }
    }

    return { grade: '-', remark: 'N/A', color: 'text-gray-400', bg: 'bg-gray-50' };
}

// Auth Functions
function login(type, credentials) {
    const data = getSchoolData();
    
    if (type === 'student') {
        const student = data.students.find(s => s.id === credentials.id);
        if (student) {
            sessionStorage.setItem('currentUser', JSON.stringify({ type: 'student', ...student }));
            return { success: true, redirect: 'student-report.html' };
        }
    } else if (type === 'staff') {
        const teacher = data.teachers.find(t => t.email === credentials.email && t.password === credentials.password);
        if (teacher) {
            sessionStorage.setItem('currentUser', JSON.stringify({ type: 'teacher', ...teacher }));
            return { success: true, redirect: 'teacher-portal.html' };
        }
        
        const admin = data.admins.find(a => a.email === credentials.email && a.password === credentials.password);
        if (admin) {
            sessionStorage.setItem('currentUser', JSON.stringify({ type: 'admin', ...admin }));
            return { success: true, redirect: 'admin-dashboard.html' };
        }
    }
    
    return { success: false, message: 'Invalid credentials' };
}

function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

function checkAuth(allowedTypes) {
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!user || (allowedTypes && !allowedTypes.includes(user.type))) {
        window.location.href = 'login.html';
    }
    return user;
}
