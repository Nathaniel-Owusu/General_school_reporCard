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
    
    // Not logged in
    if (!user) {
        console.warn('⚠️ No user session found. Redirecting to login.');
        window.location.href = 'login.html';
        return null;
    }
    
    // Check role permissions
    if (allowedRoles && allowedRoles.length > 0) {
        const userRole = user.role || (user.index_number ? 'student' : 'unknown');
        
        // Log authentication attempt
        console.log(`🔐 Auth Check: User role="${userRole}", Allowed roles=[${allowedRoles.join(', ')}]`);
        
        if (!allowedRoles.includes(userRole)) {
            // Special case for students (they have index_number instead of role)
            if(user.index_number && allowedRoles.includes('student')) {
                console.log('✅ Student authenticated');
                return user;
            }
            
            console.error(`❌ Unauthorized: "${userRole}" tried to access page requiring [${allowedRoles.join(', ')}]`);
            alert(`Unauthorized Access\n\nYou do not have permission to view this page.\nRequired role: ${allowedRoles.join(' or ')}\nYour role: ${userRole}`);
            window.location.href = 'login.html';
            return null;
        }
        
        console.log(`✅ Authorized: "${userRole}" has access`);
    }
    
    return user;
}

async function login(type, credentials) {
    // Build absolute API URL (works on localhost + Hostinger/mobile)
    const base = (function() {
        const path = window.location.pathname.replace(/\/[^\/]*$/, '');
        return window.location.origin + path;
    })();

    // 1. Online Login (Secure) attempt — 3 second timeout for fast mobile fallback
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

        const response = await fetch(base + '/api/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({...credentials, type}),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                const user = data.user;
                if(!user.role && type === 'student') user.role = 'student';
                
                sessionStorage.setItem('currentUser', JSON.stringify(user));
                
                let redirect = 'index.html';
                if (user.role === 'super_admin') redirect = 'super-admin.html';
                else if (user.role === 'admin') redirect = 'admin-dashboard.html';
                else if (user.role === 'teacher') redirect = 'teacher-portal.html';
                else if (user.role === 'student') redirect = 'student-dashboard.html';
                
                return { success: true, redirect };
            } else {
                // API responded but login failed (wrong credentials etc)
                return { success: false, message: data.message || 'Login failed' };
            }
        } else {
            console.warn('⚠️ Server returned error:', response.status);
        }
    } catch (e) {
        console.warn('⚠️ Server Unreachable. Using Offline Login.', e);
    }
    
    // 2. Fallback: Direct Database Login (if API unavailable)
    console.log("⚠️ API unavailable. Attempting direct database login...");
    try {
        const db = await Storage.get();
        if (!db) return { success: false, message: 'Database error.' };

        if (type === 'student') {
            const student = db.students ? db.students.find(s => s.id == credentials.id) : null;
            if (student) {
                const user = { ...student, role: 'student' };
                sessionStorage.setItem('currentUser', JSON.stringify(user));
                return { success: true, redirect: 'student-dashboard.html' };
            }
            return { success: false, message: 'Student ID not found' };
        } else {
            const user = db.users ? db.users.find(u => u.email === credentials.email) : null;
            
            // Very basic auth
            if (user && user.password === credentials.password) {
                if (user.active === false) return { success: false, message: 'Account Inactive' };
                
                sessionStorage.setItem('currentUser', JSON.stringify(user));
                let redirect = 'teacher-portal.html';
                if (user.role === 'super_admin') redirect = 'super-admin.html';
                else if (user.role === 'admin') redirect = 'admin-dashboard.html';
                
                return { success: true, redirect };
            }
        }
        return { success: false, message: 'Invalid Credentials' };
    } catch (dbError) {
        console.error('❌ Database login failed:', dbError);
        return { success: false, message: 'Cannot connect to database. Please try again later.' };
    }
}

function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// --- Admin Controller ---

async function fetchAdminData(action, params = {}) {
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!user || user.role !== 'admin') return null;
    
    const db = await Storage.get();
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
         const school = db.schools.find(s => s.id == schoolId);
         result = school ? { 
             ...school.settings, 
             schoolName: school.name || (school.settings ? school.settings.schoolName : ''), 
             schoolLogo: school.logo || (school.settings ? school.settings.schoolLogo : ''), 
             schoolAddress: school.address || (school.settings ? school.settings.schoolAddress : ''), 
             contactPhone: school.contact_phone || (school.settings ? school.settings.contactPhone : ''), 
             contactEmail: school.contact_email || (school.settings ? school.settings.contactEmail : '') 
         } : {};
    }

    else if (action === 'save_settings') {
        const school = db.schools.find(s => s.id == schoolId);
        if (school) {
            // Update Core Info
            if(params.schoolName) school.name = params.schoolName;
            if(params.schoolAddress) school.address = params.schoolAddress;
            if(params.contactPhone) school.contact_phone = params.contactPhone;
            if(params.contactEmail) school.contact_email = params.contactEmail;
            if(params.schoolLogo) {
                school.logo = params.schoolLogo;
                if(!school.settings) school.settings = {};
                school.settings.schoolLogo = params.schoolLogo; // Dual save for compatibility
            }
            
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
             await Storage.save(params.data); // Full replace
             return { success: true };
        }
        return { success: false, message: 'No data provided' };
    }

    // WRITE Operations
    if (action === 'add_student') {
        const index = db.students.findIndex(s => s.id == params.id);
        
        // --- Duplicate Name Check ---
        const duplicate = db.students.find(s => 
            s.school_id === schoolId && 
            s.name.trim().toLowerCase() === params.name.trim().toLowerCase() &&
            s.id != params.id // Exclude self if editing
        );
        
        if (duplicate) {
            return { 
                success: false, 
                message: `Duplicate Name: A student named "${params.name}" already exists in ${duplicate.class}.`
            };
        }

        if (index >= 0) {
            db.students[index] = { ...db.students[index], ...params };
        } else {
            let newId = params.id;
            
            if (!newId) {
                // Auto-generate SIMPLE ID: ST001, ST002, etc.
                const prefix = 'ST';
                let maxNum = 0;
                
                // Find the highest existing ST number
                db.students.forEach(s => {
                    if(s.school_id === schoolId && s.id && s.id.startsWith(prefix)) {
                        const num = parseInt(s.id.replace(prefix, ''), 10);
                        if(!isNaN(num) && num > maxNum) maxNum = num;
                    }
                });
                
                let counter = maxNum + 1;
                newId = `${prefix}${counter.toString().padStart(3, '0')}`;
                
                // Ensure uniqueness (loop if collision)
                while(db.students.find(s => s.id == newId)) {
                    counter++;
                    newId = `${prefix}${counter.toString().padStart(3, '0')}`;
                }
            }

            db.students.push({
                id: newId,
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
         const index = db.classes.findIndex(c => c.id == params.id);
         if (index >= 0) {
             // Preserve existing properties (especially subjects array) when updating
             db.classes[index] = {
                 ...db.classes[index],
                 name: params.name,
                 level: params.level,
                 class_teacher_id: params.class_teacher_id,
                 active: params.active !== 'false' && params.active !== false
             };
         } else {
             // Automatically assign existing subjects based on the class level
             const levelSubjects = db.subjects
                 .filter(s => s.school_id === schoolId && s.level === params.level && s.active !== false)
                 .map(s => s.id);
                 
             db.classes.push({
                 id: params.id || Storage.generateId('CLS'),
                 school_id: schoolId,
                 name: params.name,
                 level: params.level,
                 class_teacher_id: params.class_teacher_id,
                 active: params.active !== 'false' && params.active !== false,
                 subjects: levelSubjects
             });
         }
         didUpdate = true;
         result = { success: true };
    }

    else if (action === 'delete_class') {
        const cls = db.classes.find(c => c.id == params.id);
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
        const index = db.users.findIndex(u => u.id == params.id);
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

    else if (action === 'assign_teacher_classes') {
        const uid = params.teacher_id || params.id;
        const user = db.users.find(u => u.id == uid);
        
        if (!user) {
            result = { success: false, message: 'Teacher not found (ID: ' + uid + ')' };
        } else {
            // Assign classes/subjects (Allow teachers and admins)
            if(user.role === 'teacher' || user.role === 'admin' || user.role === 'super_admin') {
                user.assigned_classes = params.class_names || [];
                
                // Ensure assigned_subjects is stored correctly
                const rawSubjects = params.assigned_subjects || [];
                user.assigned_subjects = rawSubjects.filter(as => as.subject_ids && as.subject_ids.length > 0);
                
                didUpdate = true;
                result = { success: true, message: 'Assignments saved successfully' };
            } else {
                 result = { success: false, message: 'User is not authorized to teach (' + user.role + ')' };
            }
        }
    }

    else if (action === 'add_subject') {
         const index = db.subjects.findIndex(s => s.id == params.id);
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
        const cls = db.classes.find(c => c.id == params.class_id);
        if (cls) {
            cls.subjects = params.subjects;
            didUpdate = true;
            result = { success: true };
        }
    }

    else if (action === 'generate_student_indexes') {
        const prefix = (params.prefix || 'ST').toUpperCase();
        const allStudents = db.students.filter(s => s.school_id === schoolId);
        
        // Sort by Class then Name
        allStudents.sort((a, b) => {
            const clsA = a.class || '';
            const clsB = b.class || '';
            if (clsA < clsB) return -1;
            if (clsA > clsB) return 1;
            return a.name.localeCompare(b.name);
        });
        
        // Assign sequential IDs
        let count = 1;
        allStudents.forEach(s => {
            const num = String(count).padStart(3, '0');
            s.id = `${prefix}${num}`;
            count++;
        });
        
        didUpdate = true;
        result = { success: true, count: allStudents.length };
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
         const std = db.students.find(s => s.id == params.student_id);
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
             const std = db.students.find(s => s.id == item.student_id);
             if(std && std.scores) {
                 const score = std.scores.find(sc => sc.subject_id === item.subject_id);
                 if(score) score.status = 'Approved';
             }
        });
        didUpdate = true;
        result = { success: true };
    }

    if (didUpdate) await Storage.save(db);
    return result;
}


// --- Teacher Controller ---

async function fetchTeacherData(action, params = {}) {
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) return null;

    const db = await Storage.get();
    const schoolId = user.school_id;
    let result = null;
    let didUpdate = false;

    // Helper: Get classes assigned to this teacher
    // Admin sees all
    const getMyClasses = () => {
        if(user.role === 'admin') return db.classes.filter(c => c.school_id === schoolId);
        
        // Refresh teacher object to get latest assignments
        const me = db.users.find(u => u.id == user.id);
        const myClassNames = me ? (me.assigned_classes || []) : [];
        const mySubjectAssignments = me ? (me.assigned_subjects || []) : [];
        
        // Match by Class Teacher ID, Name/ID assignment, OR Subject Assignment
        return db.classes.filter(c => 
            c.school_id === schoolId && (
                c.class_teacher_id == user.id ||
                myClassNames.includes(c.name) || 
                myClassNames.includes(c.id) ||
                mySubjectAssignments.some(as => as.class_id === c.id)
            )
        );
    };

    if (action === 'classes') {
        const classes = getMyClasses();
        const me = db.users.find(u => u.id == user.id);
        
        // Enrich with subject objects, filtering Active ones AND assigned ones
        result = classes.map(c => {
             let allowedSubjects = [];
             
             // Check roles
             const isDirectClassTeacher = c.class_teacher_id == user.id;
             const isLegacyClassTeacher = (me.assigned_classes || []).includes(c.name) || (me.assigned_classes || []).includes(c.id);
             const isAdmin = user.role === 'admin';
             const isGeneralAccess = isAdmin || isDirectClassTeacher || isLegacyClassTeacher;
             
             // Check specific assignment
             const assignment = (me.assigned_subjects || []).find(as => as.class_id === c.id);
             const specificSubjectIds = (assignment && assignment.subject_ids) ? assignment.subject_ids : [];
             
             if (!isGeneralAccess && specificSubjectIds.length > 0) {
                 // STRICT MODE: Only assigned subjects
                 allowedSubjects = db.subjects.filter(s => 
                     s.school_id === schoolId &&
                     s.active !== false &&
                     specificSubjectIds.includes(s.id)
                 );
             } else {
                 // GENERAL MODE: Show Class Curriculum
                 // 1. Try Configured Subjects
                 if (c.subjects && c.subjects.length > 0) {
                     allowedSubjects = db.subjects.filter(s => s.school_id === schoolId && c.subjects.includes(s.id) && s.active !== false);
                 }
                 
                     // 2. Fallback: All Subjects of Level OR Uncategorized (if config missing)
                 if (allowedSubjects.length === 0) {
                     allowedSubjects = db.subjects.filter(s => s.school_id === schoolId && (s.level === c.level || !s.level) && s.active !== false);
                 }
             }
             
             return { ...c, subjects: allowedSubjects };
        });
    }

    else if (action === 'stats') {
        // Reuse the logic from 'classes' action to ensure consistency
        // getMyClasses returns raw classes, we need to enrich them to count visible subjects
        const rawClasses = getMyClasses();
        const me = db.users.find(u => u.id == user.id);
        
        const enrichedClasses = rawClasses.map(c => {
             let allowedSubjects = [];
             const isDirectClassTeacher = c.class_teacher_id == user.id;
             const isLegacyClassTeacher = (me.assigned_classes || []).includes(c.name) || (me.assigned_classes || []).includes(c.id);
             const isAdmin = user.role === 'admin';
             const isGeneralAccess = isAdmin || isDirectClassTeacher || isLegacyClassTeacher;
             
             const assignment = (me.assigned_subjects || []).find(as => as.class_id === c.id);
             const specificSubjectIds = (assignment && assignment.subject_ids) ? assignment.subject_ids : [];
             
             if (!isGeneralAccess && specificSubjectIds.length > 0) {
                 allowedSubjects = db.subjects.filter(s => s.school_id === schoolId && s.active !== false && specificSubjectIds.includes(s.id));
             } else {
                 if (c.subjects && c.subjects.length > 0) {
                     allowedSubjects = db.subjects.filter(s => s.school_id === schoolId && c.subjects.includes(s.id) && s.active !== false);
                 }
                 if (allowedSubjects.length === 0) {
                     allowedSubjects = db.subjects.filter(s => s.school_id === schoolId && (s.level === c.level || !s.level) && s.active !== false);
                 }
             }
             return { ...c, subjects: allowedSubjects };
        });

        const uniqueSubjects = new Set();
        enrichedClasses.forEach(c => {
            if (c.subjects) {
                c.subjects.forEach(s => uniqueSubjects.add(s.id));
            }
        });
        const subjectsCount = uniqueSubjects.size;
        
        // Count unique students (Optimized with Set)
        const classNameSet = new Set(enrichedClasses.map(c => c.name));
        const myStudents = db.students.filter(s => s.school_id === schoolId && classNameSet.has(s.class));
        
        let pending = 0;
        myStudents.forEach(s => {
            if(s.scores) s.scores.forEach(sc => { if(sc.status === 'Pending') pending++; });
        });

        result = {
            classes: enrichedClasses.length,
            subjects: subjectsCount,
            students: myStudents.length,
            pending: pending
        };
    }

    else if (action === 'students') {
        // params: class_id, subject_id
        const cls = db.classes.find(c => c.id == params.class_id);
        if(cls) {
            // Robust class matching: check by ID or Name
            const students = db.students.filter(s => 
                (s.school_id == schoolId) && 
                (s.class == cls.name || s.class_id == cls.id || s.class == cls.id)
            );

            result = students.map(s => {
                const scoresArr = Array.isArray(s.scores) ? s.scores : [];
                const score = scoresArr.find(sc => sc.subject_id == params.subject_id) || {};
                const studentName = (s.name || s.student_name || s.full_name || s.fullName || '').trim() || `Student (${s.id})`;
                return {
                    id: s.id,
                    name: studentName,
                    index_number: s.index_number || s.id, // Fallback to id if index_number missing
                    student_name: studentName,
                    project_score: score.project_score || 0,
                    individual_score: score.individual_score || 0,
                    class_test: score.class_test || 0,
                    homework_score: score.homework_score || 0,
                    class_score: score.class_score || 0,
                    exam_score: score.exam_score || 0,
                    remark: score.remark || '',
                    status: score.status,
                    attendance: s.attendance || { present: 0, total: 0 },
                    conduct: s.conduct || '',
                    teacher_remark: s.teacher_remark || ''
                };
            });
        } else {
            result = [];
        }
    }

    else if (action === 'save_records') {
        const { records } = params;
        // records is array of { student_id, attendance, conduct, teacher_remark }
        if(records && Array.isArray(records)) {
             records.forEach(r => {
                 const std = db.students.find(s => s.id == r.student_id);
                 if(std) {
                     // Check and update fields if provided
                     if(r.attendance) std.attendance = r.attendance; 
                     if(r.conduct) std.conduct = r.conduct;
                     if(r.teacher_remark) std.teacher_remark = r.teacher_remark;
                 }
             });
             didUpdate = true;
             result = { success: true };
        } else {
             result = { success: false, message: 'Invalid records format' };
        }
    }

    else if (action === 'save_grades') {
        const { class_id, subject_id, grades } = params;
        const subject = db.subjects.find(s => s.id == subject_id);
        if(subject) {
             grades.forEach(g => {
                 const std = db.students.find(s => s.id == g.student_id);
                 if(std) {
                     if(!std.scores) std.scores = [];
                     const existing = std.scores.find(sc => sc.subject_id == subject_id);
                     if(existing) {
                         existing.project_score = g.project_score || 0;
                         existing.individual_score = g.individual_score || 0;
                         existing.class_test = g.class_test || 0;
                         existing.homework_score = g.homework_score || 0;
                         existing.class_score = g.class_score;
                         existing.exam_score = g.exam_score;
                         existing.remark = g.remark || '';
                         existing.status = 'Pending'; // Revert to pending on edit
                     } else {
                         std.scores.push({
                             subject_id: subject_id,
                             subject: subject.name,
                             project_score: g.project_score || 0,
                             individual_score: g.individual_score || 0,
                             class_test: g.class_test || 0,
                             homework_score: g.homework_score || 0,
                             class_score: g.class_score,
                             exam_score: g.exam_score,
                             remark: g.remark || '',
                             status: 'Pending'
                         });
                     }
                 }
             });
             didUpdate = true;
             result = { success: true };
        }
    }

    if (didUpdate) await Storage.save(db);
    return result;
}

// --- Student Controller ---

async function fetchStudentReport(studentId) {
    const db = await Storage.get();
    const student = db.students.find(s => s.id == studentId);
    
    if (student) {
        const school = db.schools.find(s => s.id == student.school_id);

        // ── Compute live class position from total scores ──
        const classmates = db.students.filter(s => s.class === student.class && s.school_id === student.school_id && s.status !== 'Inactive');
        
        const getTotal = (st) => (st.scores || []).reduce((sum, sc) => {
            const cs = Number(sc.class_score) || 0;
            const es = Number(sc.exam_score)  || 0;
            return sum + cs + es;
        }, 0);

        const myTotal = getTotal(student);

        // Sort descending by total score
        const sorted = [...classmates].sort((a, b) => getTotal(b) - getTotal(a));
        const computedPosition = sorted.findIndex(s => s.id == student.id) + 1;

        // ── Look up class teacher name ──
        const cls = db.classes.find(c => c.name === student.class && c.school_id === student.school_id);
        let classTeacherName = '';
        if (cls && cls.class_teacher_id) {
            const teacher = db.users.find(u => u.id == cls.class_teacher_id);
            if (teacher) classTeacherName = teacher.name;
        }

        return {
            student: {
                ...student,
                term: school?.settings?.currentTerm || '',
                year: school?.settings?.academicYear || '',
                position: computedPosition || student.position || '',
                total_students: classmates.length,
                class_teacher: classTeacherName || student.class_teacher || '',
                reopening_date: school?.settings?.reopeningDate || ''
            },
            settings: {
                ...school.settings,
                schoolName: school.name || (school.settings ? school.settings.schoolName : ''),
                schoolLogo: school.logo || (school.settings ? school.settings.schoolLogo : ''),
                schoolAddress: school.address || (school.settings ? school.settings.schoolAddress : ''),
                contactPhone: school.contact_phone || (school.settings ? school.settings.contactPhone : ''),
                contactEmail: school.contact_email || (school.settings ? school.settings.contactEmail : ''),
                reopeningDate: school?.settings?.reopeningDate || ''
            }
        };
    }
    return null;
}


// --- Super Admin Controller ---

async function fetchSuperAdminData(action, params = {}) {
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!user || user.role !== 'super_admin') return null;
    
    const db = await Storage.get();
    let result = null;
    let didUpdate = false;

    if (action === 'stats') {
        const activeSchools = db.schools.filter(s => s.active !== false && !s.deleted);
        const totalSchools = db.schools.filter(s => !s.deleted).length;
        const totalStudents = db.students.length;
        const totalTeachers = db.users.filter(u => u.role === 'teacher').length;
        
        result = {
            schools: totalSchools,
            active_schools: activeSchools.length,
            students: totalStudents,
            teachers: totalTeachers
        };
    }
    
    else if (action === 'schools') {
        result = db.schools.map(school => ({
            ...school,
            student_count: db.students.filter(s => s.school_id === school.id).length,
            teacher_count: db.users.filter(u => u.school_id === school.id && u.role === 'teacher').length,
            admin_count: db.users.filter(u => u.school_id === school.id && u.role === 'admin').length
        }));
    }
    
    else if (action === 'toggle_school') {
        const school = db.schools.find(s => s.id == params.school_id);
        if (school) {
            school.active = params.active;
            didUpdate = true;
            result = { success: true };
        } else {
            result = { success: false, message: 'School not found' };
        }
    }
    
    else if (action === 'edit_school') {
        const school = db.schools.find(s => s.id == params.school_id);
        if (school) {
            // Update school details
            if (params.school_name) school.name = params.school_name;
            if (params.school_address !== undefined) school.address = params.school_address;
            if (params.contact_email) school.contact_email = params.contact_email;
            if (params.contact_phone !== undefined) school.contact_phone = params.contact_phone;
            if (params.active !== undefined) school.active = params.active;
            
            didUpdate = true;
            result = { success: true };
        } else {
            result = { success: false, message: 'School not found' };
        }
    }
    
    else if (action === 'delete_school') {
        const schoolIndex = db.schools.findIndex(s => s.id == params.school_id);
        if (schoolIndex !== -1) {
            // Hard delete: Remove from database entirely
            db.schools.splice(schoolIndex, 1);
            
            // Also cascade delete all related data to prevent orphans
            db.users = db.users.filter(u => u.school_id !== params.school_id);
            db.students = db.students.filter(s => s.school_id !== params.school_id);
            db.classes = db.classes.filter(c => c.school_id !== params.school_id);
            db.subjects = db.subjects.filter(s => s.school_id !== params.school_id);
            
            didUpdate = true;
            result = { success: true };
        } else {
            result = { success: false, message: 'School not found' };
        }
    }
    
    else if (action === 'create_admin') {
        // Check if admin email already exists
        const existingUser = db.users.find(u => u.email === params.email);
        if (existingUser) {
            return { success: false, message: 'Email already exists' };
        }
        
        // Check if school exists and is active
        const school = db.schools.find(s => s.id == params.school_id);
        if (!school) {
            return { success: false, message: 'School not found' };
        }
        if (school.deleted || school.active === false) {
            return { success: false, message: 'Cannot assign admin to inactive or deleted school' };
        }
        
        // Create new admin
        const newAdmin = {
            id: Storage.generateId('ADM'),
            school_id: params.school_id,
            name: params.name,
            email: params.email,
            password: params.password,
            role: 'admin',
            active: true,
            created_at: Date.now()
        };
        
        db.users.push(newAdmin);
        didUpdate = true;
        result = { success: true, admin_id: newAdmin.id };
    }
    
    else if (action === 'edit_admin') {
        const admin = db.users.find(u => u.id == params.admin_id && u.role === 'admin');
        if (admin) {
            // Check if email is being changed and if new email already exists
            if (params.email && params.email !== admin.email) {
                const emailExists = db.users.find(u => u.email === params.email && u.id !== admin.id);
                if (emailExists) {
                    return { success: false, message: 'Email already exists' };
                }
                admin.email = params.email;
            }
            
            // Update other fields
            if (params.name) admin.name = params.name;
            if (params.school_id) {
                const school = db.schools.find(s => s.id == params.school_id);
                if (!school || school.deleted || school.active === false) {
                    return { success: false, message: 'Cannot assign to this school' };
                }
                admin.school_id = params.school_id;
            }
            if (params.active !== undefined) admin.active = params.active;
            
            admin.updated_at = Date.now();
            didUpdate = true;
            result = { success: true };
        } else {
            result = { success: false, message: 'Admin not found' };
        }
    }
    
    else if (action === 'toggle_admin') {
        const admin = db.users.find(u => u.id == params.admin_id && u.role === 'admin');
        if (admin) {
            admin.active = params.active;
            admin.updated_at = Date.now();
            didUpdate = true;
            result = { success: true };
        } else {
            result = { success: false, message: 'Admin not found' };
        }
    }
    
    else if (action === 'reset_admin_password') {
        const admin = db.users.find(u => u.id == params.admin_id && u.role === 'admin');
        if (admin) {
            admin.password = params.new_password;
            admin.password_reset_at = Date.now();
            didUpdate = true;
            result = { success: true };
        } else {
            result = { success: false, message: 'Admin not found' };
        }
    }

    if (didUpdate) await Storage.save(db);
    return result;
}


// --- Initialization ---

// Register School (Public)
async function registerSchool(data) {
    const db = await Storage.get();
    const schoolId = Storage.generateId('SCH');
    
    db.schools.push({
        id: schoolId,
        name: data.school_name,
        address: data.school_address,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        logo: data.school_logo,
        active: true,
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
    
    // Seed subjects and classes based on levels
    if(data.levels && Array.isArray(data.levels)) {
        const createdSubjects = [];
        
        // Subjects
        const toAdd = GES_SUBJECTS.filter(s => data.levels.includes(s.level));
        toAdd.forEach(sub => {
            const subId = Storage.generateId('SUB');
            const newSubject = {
                id: subId,
                school_id: schoolId,
                name: sub.name,
                code: sub.code,
                level: sub.level,
                active: true
            };
            db.subjects.push(newSubject);
            createdSubjects.push(newSubject);
        });
        
        // Classes - auto assign created subjects by level
        const toAddClasses = GES_CLASSES.filter(c => data.levels.includes(c.level));
        toAddClasses.forEach(c => {
             const classSubjectIds = createdSubjects
                 .filter(sub => sub.level === c.level)
                 .map(sub => sub.id);
                 
             db.classes.push({
                 id: Storage.generateId('CLS'),
                 school_id: schoolId,
                 name: c.name,
                 level: c.level,
                 subjects: classSubjectIds
             });
        });
    }

    await Storage.save(db);
    return { success: true, school_id: schoolId };
}

// Global Event Listener for Sync
window.addEventListener('db-updated', () => {
    // Refresh current view if needed
    if(window.location.href.includes('admin-dashboard') && typeof initDashboard === 'function') {
        initDashboard();
    }
});
// --- Global Grading Utility ---
window.calculateGrade = function(score) {
    let system = [];
    try {
        if (window.currentSettings && window.currentSettings.gradingSystem) {
            system = typeof window.currentSettings.gradingSystem === 'string' ? JSON.parse(window.currentSettings.gradingSystem) : window.currentSettings.gradingSystem;
        } else {
            const ls = sessionStorage.getItem('grc_db_cache');
            if (ls) {
                const db = JSON.parse(ls);
                const s = (db && db.schools && db.schools[0]) ? db.schools[0].settings : null;
                if (s && s.gradingSystem) {
                    system = typeof s.gradingSystem === 'string' ? JSON.parse(s.gradingSystem) : s.gradingSystem;
                }
            }
        }
    } catch(e) { console.error('Error parsing grading system', e); }

    if (system && Array.isArray(system) && system.length > 0) {
        for(let i=0; i<system.length; i++) {
            let rule = system[i];
            if (score >= rule.min && score <= rule.max) {
                 let bg = 'bg-gray-100', color = 'text-gray-700';
                 if (rule.grade.includes('A')) { bg = 'bg-green-100'; color = 'text-green-700'; }
                 else if (rule.grade.includes('B')) { bg = 'bg-blue-100'; color = 'text-blue-700'; }
                 else if (rule.grade.includes('C')) { bg = 'bg-yellow-100'; color = 'text-yellow-700'; }
                 else if (rule.grade.includes('D')) { bg = 'bg-orange-100'; color = 'text-orange-700'; }
                 else if (rule.grade.includes('F')) { bg = 'bg-red-100'; color = 'text-red-700'; }
                 return { grade: rule.grade, remark: rule.remark, bg, color };
            }
        }
    }
    
    // Default GES Fallback
    if (score >= 80) return { grade: 'A', remark: 'Excellent', bg: 'bg-green-100', color: 'text-green-700' };
    if (score >= 70) return { grade: 'B', remark: 'Very Good', bg: 'bg-blue-100', color: 'text-blue-700' };
    if (score >= 60) return { grade: 'C', remark: 'Good', bg: 'bg-yellow-100', color: 'text-yellow-700' };
    if (score >= 50) return { grade: 'D', remark: 'Credit', bg: 'bg-orange-100', color: 'text-orange-700' };
    if (score >= 45) return { grade: 'E', remark: 'Pass', bg: 'bg-gray-100', color: 'text-gray-700' };
    return { grade: 'F', remark: 'Fail', bg: 'bg-red-100', color: 'text-red-700' };
};

/**
 * AI-Inspired Smart Remark Generator
 * Generates a professional, encouraging academic remark based on score.
 */
window.generateSmartRemark = function(score, subjectName = "") {
    const s = subjectName ? ` in ${subjectName}` : "";
    if (score >= 90) return `Outstanding achievement! You have shown complete mastery of the core concepts${s}.`;
    if (score >= 80) return `Excellent performance! Keep up the exceptionally high standard${s}.`;
    if (score >= 70) return `Very good work. You have a solid and consistent understanding of the topics${s}.`;
    if (score >= 60) return `Good effort. With more consistent practice, you will achieve even better results${s}.`;
    if (score >= 50) return `A fair performance. There is room for improvement; focus more on challenging areas${s}.`;
    if (score >= 45) return `Pass. You need to double your efforts and seek help where necessary to improve${s}.`;
    return `Below expectations. Please see your teacher for extra guidance and dedicate more time to studies${s}.`;
};
