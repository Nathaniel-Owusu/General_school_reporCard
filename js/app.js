/**
 * Core Application Logic
 * Bridges the UI with the Storage Layer
 */

// --- Authentication ---

const GES_SUBJECTS = [
    // KG
    { name: 'Language & Literacy', code: 'LIT', level: 'KG' },
    { name: 'Numeracy', code: 'NUM', level: 'KG' },
    { name: 'Environmental Studies', code: 'ENV', level: 'KG' },
    { name: 'Creative Arts', code: 'ART', level: 'KG' },
    { name: 'Our World Our People', code: 'OWOP', level: 'KG' },
    { name: 'Physical Development', code: 'PHY', level: 'KG' },
    { name: 'Religious & Moral Education', code: 'RME', level: 'KG' },
    // Primary
    { name: 'English Language', code: 'ENG', level: 'Primary' },
    { name: 'Mathematics', code: 'MATH', level: 'Primary' },
    { name: 'Science', code: 'SCI', level: 'Primary' },
    { name: 'Our World Our People', code: 'OWOP', level: 'Primary' },
    { name: 'Creative Arts', code: 'ART', level: 'Primary' },
    { name: 'Religious & Moral Education', code: 'RME', level: 'Primary' },
    { name: 'Physical Education', code: 'PE', level: 'Primary' },
    { name: 'Ghanaian Language', code: 'GHA', level: 'Primary' },
    { name: 'Computing / ICT', code: 'ICT', level: 'Primary' },
    // JHS
    { name: 'English Language', code: 'ENG', level: 'JHS' },
    { name: 'Mathematics', code: 'MATH', level: 'JHS' },
    { name: 'Integrated Science', code: 'SCI', level: 'JHS' },
    { name: 'Social Studies', code: 'SOC', level: 'JHS' },
    { name: 'Religious & Moral Education', code: 'RME', level: 'JHS' },
    { name: 'Computing', code: 'COM', level: 'JHS' },
    { name: 'Career Technology', code: 'CAT', level: 'JHS' },
    { name: 'Creative Arts & Design', code: 'CAD', level: 'JHS' },
    { name: 'Ghanaian Language', code: 'GHA', level: 'JHS' },
    { name: 'French', code: 'FRE', level: 'JHS' }
];

const GES_CLASSES = [
    { name: 'KG 1', level: 'KG' }, { name: 'KG 2', level: 'KG' },
    { name: 'Class 1', level: 'Primary' }, { name: 'Class 2', level: 'Primary' },
    { name: 'Class 3', level: 'Primary' }, { name: 'Class 4', level: 'Primary' },
    { name: 'Class 5', level: 'Primary' }, { name: 'Class 6', level: 'Primary' },
    { name: 'JHS 1', level: 'JHS' }, { name: 'JHS 2', level: 'JHS' }, { name: 'JHS 3', level: 'JHS' }
];

function checkAuth(allowedRoles) {
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = 'login.html';
        return null;
    }
    if (allowedRoles && !allowedRoles.includes(user.role || 'student')) {
        // 'student' role logic check
        if(user.index_number && allowedRoles.includes('student')) return user;
        
        alert('Unauthorized Access');
        window.location.href = 'login.html';
        return null;
    }
    return user;
}

async function login(type, credentials) {
    const db = Storage.get();
    if (!db) return { success: false, message: 'Database error' };

    if (type === 'student') {
        const student = db.students.find(s => s.id === credentials.id);
        if (student) {
             // Find school for context
             const school = db.schools.find(s => s.id === student.school_id);
             const sessionUser = { ...student, type: 'student', school_name: school ? school.name : 'Unknown' };
             sessionStorage.setItem('currentUser', JSON.stringify(sessionUser));
             return { success: true, redirect: 'student-report.html', user: sessionUser };
        }
    } else {
        // Admin or Teacher
        const user = db.users.find(u => u.email === credentials.email && u.password === credentials.password);
        if (user) {
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            const redirect = user.role === 'admin' ? 'admin-dashboard.html' : 'teacher-portal.html';
            return { success: true, redirect: redirect, user: user };
        }
    }
    return { success: false, message: 'Invalid credentials' };
}

function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// --- Admin Controller ---

async function fetchAdminData(action, params = {}) {
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!user || user.role !== 'admin') return null;
    
    const db = Storage.get();
    const schoolId = user.school_id;
    let result = null;
    let didUpdate = false;

    // READ Operations
    if (action === 'stats') {
        result = {
            students: db.students.filter(s => s.school_id === schoolId).length,
            teachers: db.users.filter(u => u.school_id === schoolId && u.role === 'teacher').length,
            classes: db.classes.filter(c => c.school_id === schoolId).length,
            subjects: db.subjects.filter(s => s.school_id === schoolId).length
        };
    }
    
    else if (action === 'students') {
        result = db.students.filter(s => s.school_id === schoolId);
    }
    
    else if (action === 'classes') {
        result = db.classes.filter(c => c.school_id === schoolId);
    }

    else if (action === 'teachers') {
        result = db.users.filter(u => u.school_id === schoolId && u.role === 'teacher');
    }

    else if (action === 'subjects') {
        result = db.subjects.filter(s => s.school_id === schoolId);
    }
    
    else if (action === 'get_settings') {
         const school = db.schools.find(s => s.id === schoolId);
         result = school ? { ...school.settings, schoolName: school.name, schoolLogo: school.logo, schoolAddress: school.address, contactPhone: school.contact_phone, contactEmail: school.contact_email } : {};
    }

    else if (action === 'save_settings') {
        const school = db.schools.find(s => s.id === schoolId);
        if (school) {
            // Update Core Info
            if(params.schoolName) school.name = params.schoolName;
            if(params.schoolAddress) school.address = params.schoolAddress;
            if(params.contactPhone) school.contact_phone = params.contactPhone;
            if(params.contactEmail) school.contact_email = params.contactEmail;
            if(params.schoolLogo) school.logo = params.schoolLogo;
            
            // Update Settings Object
            // We merge carefully
            if(params.currentTerm) school.settings.currentTerm = params.currentTerm;
            if(params.academicYear) school.settings.academicYear = params.academicYear;
            if(params.gradingSystem) school.settings.gradingSystem = params.gradingSystem;
            if(params.attendance) school.settings.attendance = params.attendance;
            if(params.toggles) school.settings.toggles = { ...school.settings.toggles, ...params.toggles };
            
            didUpdate = true;
            result = { success: true };
        }
    }

    else if (action === 'backup') {
        // Return full DB for this school context
        // Ideally filter only this school's data, but for single-tenant local:
        result = JSON.stringify(db);
    }

    else if (action === 'restore') {
        if(params.data) {
             Storage.save(params.data); // Full replace
             return { success: true };
        }
        return { success: false, message: 'No data provided' };
    }

    // WRITE Operations
    if (action === 'add_student') {
        const index = db.students.findIndex(s => s.id === params.id);
        if (index >= 0) {
            db.students[index] = { ...db.students[index], ...params };
        } else {
            db.students.push({
                id: params.id || Storage.generateId('ST'),
                school_id: schoolId,
                name: params.name,
                class: params.class,
                gender: params.gender,
                status: params.status || 'Active',
                scores: [],
                attendance: { present: 0, total: 0 }
            });
        }
        didUpdate = true;
        result = { success: true };
    }

    else if (action === 'delete_student') {
        db.students = db.students.filter(s => s.id !== params.id);
        didUpdate = true;
        result = { success: true };
    }

    else if (action === 'add_class') {
         const index = db.classes.findIndex(c => c.id === params.id);
         if (index >= 0) {
             db.classes[index].name = params.name;
             db.classes[index].level = params.level;
             db.classes[index].class_teacher_id = params.class_teacher_id;
             db.classes[index].active = params.active !== 'false' && params.active !== false; // handle string/bool
         } else {
             db.classes.push({
                 id: params.id || Storage.generateId('CLS'),
                 school_id: schoolId,
                 name: params.name,
                 level: params.level,
                 class_teacher_id: params.class_teacher_id,
                 active: params.active !== 'false' && params.active !== false,
                 subjects: []
             });
         }
         didUpdate = true;
         result = { success: true };
    }

    else if (action === 'delete_class') {
        const cls = db.classes.find(c => c.id === params.id);
        if(!cls) return { success: false, message: 'Class not found' };

        // Check for dependencies (Students)
        // We need to check if ANY student is currently assigned to this class (by name or ID)
        // assuming student.class stores the class NAME based on current usage, or ID. 
        // Let's check student structure in add_student (line 184: class: params.class). 
        // It seems it stores the Class Name. We should probably migrate to IDs, but for now check both just in case.
        const hasStudents = db.students.some(s => s.class === cls.name || s.class_id === cls.id);
        
        if(hasStudents) {
            result = { success: false, message: `Cannot delete class. There are active students enrolled in ${cls.name}.` };
        } else {
            db.classes = db.classes.filter(c => c.id !== params.id);
            didUpdate = true;
            result = { success: true };
        }
    }

    else if (action === 'add_teacher') {
        const index = db.users.findIndex(u => u.id === params.id);
        if(index >= 0) {
            db.users[index].name = params.name;
            db.users[index].email = params.email;
            if(params.password) db.users[index].password = params.password;
        } else {
            db.users.push({
                id: params.id || Storage.generateId('TCH'),
                school_id: schoolId,
                role: 'teacher',
                name: params.name,
                email: params.email,
                password: params.password,
                assigned_classes: []
            });
        }
        didUpdate = true;
        result = { success: true };
    }

    else if (action === 'delete_teacher') {
        db.users = db.users.filter(u => u.id !== params.id);
        didUpdate = true;
        result = { success: true };
    }

    else if (action === 'add_subject') {
         const index = db.subjects.findIndex(s => s.id === params.id);
         if(index >= 0) {
             // Edit
             const s = db.subjects[index];
             s.name = params.name;
             s.code = params.code;
             s.level = params.level;
             s.active = params.active; // Boolean
         } else {
            // New
            db.subjects.push({
                id: params.id || Storage.generateId('SUB'),
                school_id: schoolId,
                name: params.name,
                code: params.code,
                level: params.level, 
                active: params.active !== false // Default true
            });
         }
        didUpdate = true;
        result = { success: true };
    }

    else if (action === 'delete_subject') {
        db.subjects = db.subjects.filter(s => s.id !== params.id);
        didUpdate = true;
        result = { success: true };
    }

    else if (action === 'assign_class_subjects') {
        const cls = db.classes.find(c => c.id === params.class_id);
        if (cls) {
            cls.subjects = params.subjects;
            didUpdate = true;
            result = { success: true };
        }
    }
    
    else if (action === 'results_queue') {
        // Flatten all student scores
        const queue = [];
        db.students.filter(s => s.school_id === schoolId).forEach(std => {
            if(std.scores) {
                std.scores.forEach(sc => {
                    queue.push({
                        student_id: std.id,
                        student_name: std.name,
                        class: std.class,
                        subject_id: sc.subject_id,
                        subject: sc.subject, // Denormalized name
                        class_score: sc.class_score,
                        exam_score: sc.exam_score,
                        total: (parseInt(sc.class_score)||0) + (parseInt(sc.exam_score)||0),
                        status: sc.status
                    });
                });
            }
        });
        result = queue;
    }
    
    else if (action === 'update_result_status') {
         const std = db.students.find(s => s.id === params.student_id);
         if(std && std.scores) {
             const score = std.scores.find(sc => sc.subject_id === params.subject_id);
             if(score) {
                 score.status = params.status;
                 didUpdate = true;
                 result = { success: true };
             }
         }
    }
    
    else if (action === 'bulk_approve') {
        const items = params.items || [];
        items.forEach(item => {
             const std = db.students.find(s => s.id === item.student_id);
             if(std && std.scores) {
                 const score = std.scores.find(sc => sc.subject_id === item.subject_id);
                 if(score) score.status = 'Approved';
             }
        });
        didUpdate = true;
        result = { success: true };
    }

    if (didUpdate) Storage.save(db);
    return result;
}


// --- Teacher Controller ---

async function fetchTeacherData(action, params = {}) {
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) return null;

    const db = Storage.get();
    const schoolId = user.school_id;
    let result = null;
    let didUpdate = false;

    // Helper: Get classes assigned to this teacher
    // Admin sees all
    const getMyClasses = () => {
        if(user.role === 'admin') return db.classes.filter(c => c.school_id === schoolId);
        
        // Refresh teacher object to get latest assignments
        const me = db.users.find(u => u.id === user.id);
        const myClassNames = me ? (me.assigned_classes || []) : [];
        // Match by Name (Legacy) or ID
        return db.classes.filter(c => c.school_id === schoolId && (myClassNames.includes(c.name) || myClassNames.includes(c.id)));
    };

    if (action === 'classes') {
        const classes = getMyClasses();
        // Enrich with subject objects, filtering Active ones
        result = classes.map(c => {
             const subjectObjs = db.subjects.filter(s => c.subjects && c.subjects.includes(s.id) && s.active !== false); // Active only
             return { ...c, subjects: subjectObjs };
        });
    }

    else if (action === 'stats') {
        const classes = getMyClasses();
        const subjectsCount = classes.reduce((acc, c) => acc + (c.subjects ? c.subjects.length : 0), 0);
        
        // Count unique students
        const classNames = classes.map(c => c.name);
        const myStudents = db.students.filter(s => s.school_id === schoolId && classNames.includes(s.class));
        
        let pending = 0;
        myStudents.forEach(s => {
            if(s.scores) s.scores.forEach(sc => { if(sc.status === 'Pending') pending++; });
        });

        result = {
            classes: classes.length,
            subjects: subjectsCount,
            students: myStudents.length,
            pending: pending
        };
    }

    else if (action === 'students') {
        // params: class_id, subject_id
        const cls = db.classes.find(c => c.id == params.class_id);
        if(cls) {
            const students = db.students.filter(s => s.school_id === schoolId && s.class === cls.name);
            result = students.map(s => {
                const score = (s.scores||[]).find(sc => sc.subject_id == params.subject_id) || {};
                return {
                    id: s.id,
                    name: s.name,
                    class_score: score.class_score || 0,
                    exam_score: score.exam_score || 0,
                    status: score.status
                };
            });
        } else {
            result = [];
        }
    }

    else if (action === 'save_grades') {
        const { class_id, subject_id, grades } = params;
        const subject = db.subjects.find(s => s.id == subject_id);
        if(subject) {
             grades.forEach(g => {
                 const std = db.students.find(s => s.id === g.student_id);
                 if(std) {
                     if(!std.scores) std.scores = [];
                     const existing = std.scores.find(sc => sc.subject_id == subject_id);
                     if(existing) {
                         existing.class_score = g.class_score;
                         existing.exam_score = g.exam_score;
                         existing.status = 'Pending'; // Revert to pending on edit
                     } else {
                         std.scores.push({
                             subject_id: subject_id,
                             subject: subject.name,
                             class_score: g.class_score,
                             exam_score: g.exam_score,
                             status: 'Pending'
                         });
                     }
                 }
             });
             didUpdate = true;
             result = { success: true };
        }
    }

    if (didUpdate) Storage.save(db);
    return result;
}

// --- Student Controller ---

async function fetchStudentReport(studentId) {
    const db = Storage.get();
    const student = db.students.find(s => s.id === studentId);
    
    if (student) {
        const school = db.schools.find(s => s.id === student.school_id);
        return {
            student: {
                ...student,
                term: school.settings.currentTerm,
                year: school.settings.academicYear,
                position: student.position || 'N/A', // Assuming position is calc somewhere or static
                total_students: db.students.filter(s => s.class === student.class && s.school_id === student.school_id).length
            },
            settings: school.settings
        };
    }
    return null;
}

// --- Initialization ---

// Register School (Public)
async function registerSchool(data) {
    const db = Storage.get();
    const schoolId = Storage.generateId('SCH');
    
    db.schools.push({
        id: schoolId,
        name: data.school_name,
        address: data.school_address,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        logo: data.school_logo, 
        settings: { currentTerm: '1st Term', academicYear: '2025/2026' }
    });

    db.users.push({
        id: Storage.generateId('ADM'),
        school_id: schoolId,
        name: data.admin_name,
        email: data.email,
        password: data.password,
        role: 'admin'
    });
    
    // Seed subjects based on levels
    if(data.levels && Array.isArray(data.levels)) {
        // Subjects
        const toAdd = GES_SUBJECTS.filter(s => data.levels.includes(s.level));
        toAdd.forEach(sub => {
            db.subjects.push({
                id: Storage.generateId('SUB'),
                school_id: schoolId,
                name: sub.name,
                code: sub.code,
                level: sub.level,
                active: true
            });
        });
        
        // Classes
        const toAddClasses = GES_CLASSES.filter(c => data.levels.includes(c.level));
        toAddClasses.forEach(c => {
             db.classes.push({
                 id: Storage.generateId('CLS'),
                 school_id: schoolId,
                 name: c.name,
                 level: c.level,
                 subjects: []
             });
        });
    }

    Storage.save(db);
    return { success: true, school_id: schoolId };
}

// Global Event Listener for Sync
window.addEventListener('db-updated', () => {
    // Refresh current view if needed
    if(window.location.href.includes('admin-dashboard') && typeof initDashboard === 'function') {
        initDashboard();
    }
});
