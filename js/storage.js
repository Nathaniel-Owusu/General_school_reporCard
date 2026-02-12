/**
 * Centralized Data Storage Module
 * Bridges localStorage (offline first) with Remote MySQL Database
 */

const DB_KEY = 'school_report_card_db';
const API_URL = 'api/db_handler.php';

const Storage = {
    // --- Core Operations ---

    /**
     * Initialize the database.
     * MODIFIED: Server sync disabled on load to preserve local changes
     * Tries to fetch latest from server first, falls back to local.
     */
    init: async () => {
        // TEMPORARY FIX: Disable server fetch to prevent localStorage overwrite
        // This ensures your local changes persist across refreshes
        // Server sync still happens when you SAVE (one-way push)
        
        console.log("📦 Storage: Using localStorage (server fetch disabled)");
        
        // Just use localStorage - don't fetch from server
        if (!localStorage.getItem(DB_KEY)) {
            console.log("🌱 Storage: No local data. Seeding database...");
            Storage.seed();
        } else {
            console.log("✅ Storage: Local data found. Using existing data.");
        }
        
        // Enable Server Sync for Live Environment
        try {
            console.log("📡 Storage: Syncing with server...");
            const response = await fetch(API_URL);
            if (response.ok) {
                const serverData = await response.json();
                
                if (serverData && serverData.schools && serverData.schools.length > 0) {
                    console.log("✅ Storage: Server data received. Updating local cache.");
                    localStorage.setItem(DB_KEY, JSON.stringify(serverData));
                } else {
                     console.log("⚠️ Storage: Server empty. Using local data.");
                     if (!localStorage.getItem(DB_KEY)) Storage.seed();
                }
            } else {
                console.warn("❌ Storage: Server error", response.status);
                if (!localStorage.getItem(DB_KEY)) Storage.seed();
            }
        } catch (e) {
            console.warn("⚠️ Storage: Offline / Network Error. Using Local Data.", e);
            if (!localStorage.getItem(DB_KEY)) Storage.seed();
        }
    },

    /**
     * Get the entire database object.
     * @returns {Object} The database object.
     */
    get: () => {
        try {
            const data = localStorage.getItem(DB_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error("Database corruption detected!", e);
            return null;
        }
    },

    /**
     * Save the entire database object to LocalStorage and Sync to Server.
     * @param {Object} data 
     */
    save: (data) => {
        data.last_updated = Date.now();
        localStorage.setItem(DB_KEY, JSON.stringify(data));
        
        // Notify other tabs/components
        window.dispatchEvent(new Event('db-updated'));
        
        // Trigger Background Sync
        Storage.sync(data);
    },

    /**
     * Sync data to the server.
     * @param {Object} data (Optional)
     */
    sync: async (data = null) => {
        if (!data) data = Storage.get();
        if (!data) return;

        try {
            console.log("🔄 Storage: Syncing to server...", {
                schools: (data.schools || []).length,
                classes: (data.classes || []).length,
                subjects: (data.subjects || []).length
            });
            
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if(!result.success) {
                console.error("❌ Storage: Sync Failed", result.message);
            } else {
                console.log("✅ Storage: Sync Complete");
            }
        } catch (e) {
            console.error("⚠️ Storage: Sync Network Error", e);
        }
    },

    /**
     * Reset the database to factory settings (Seeded data).
     */
    reset: () => {
        if(confirm("Factory Reset? This clears EVERYTHING.")) {
            localStorage.removeItem(DB_KEY);
            Storage.seed(); // Generate fresh seed
            Storage.sync(); // Force push fresh seed to wipe server
            location.reload();
        }
    },

    // --- Seeding ---

    seed: () => {
        const initialData = {
            schools: [{
                id: 'SCH_DEFAULT',
                name: 'General School',
                address: '123 Education Lane, Academic City',
                logo: '', 
                contact_email: 'admin@generalschool.com',
                contact_phone: '+1 234 567 890',
                active: true,
                settings: {
                    currentTerm: '1st Term',
                    academicYear: '2024/2025',
                    gradingSystem: [
                        { min: 80, max: 100, grade: 'A', remark: 'Excellent', color: 'text-green-700', bg: 'bg-green-100' },
                        { min: 70, max: 79, grade: 'B', remark: 'Very Good', color: 'text-blue-700', bg: 'bg-blue-100' },
                        { min: 60, max: 69, grade: 'C', remark: 'Good', color: 'text-yellow-700', bg: 'bg-yellow-100' },
                        { min: 50, max: 59, grade: 'D', remark: 'Credit', color: 'text-orange-700', bg: 'bg-orange-100' },
                        { min: 45, max: 49, grade: 'E', remark: 'Pass', color: 'text-gray-700', bg: 'bg-gray-100' },
                        { min: 0, max: 44, grade: 'F', remark: 'Fail', color: 'text-red-700', bg: 'bg-red-100' }
                    ],
                    toggles: {
                        showPosition: true,
                        showAttendance: true,
                        teacherEdit: true
                    }
                }
            }],
            users: [
                { 
                    id: 'SUPERADM_001', 
                    school_id: null,
                    name: 'Super Administrator', 
                    email: 'superadmin@system.com', 
                    password: 'superadmin123', 
                    role: 'super_admin' 
                },
                { 
                    id: 'ADM_001', 
                    school_id: 'SCH_DEFAULT', 
                    name: 'System Admin', 
                    email: 'admin@school.com', 
                    password: 'password123', 
                    role: 'admin' 
                },
                { 
                    id: 'TCH_001', 
                    school_id: 'SCH_DEFAULT', 
                    name: 'Sarah Teacher', 
                    email: 'teacher@school.com', 
                    password: 'password123', 
                    role: 'teacher', 
                    assigned_classes: ['JHS 1 A'] 
                }
            ],
            classes: [
                { id: 'CLS_001', school_id: 'SCH_DEFAULT', name: 'JHS 1 A', level: 'JHS', active: true, subjects: ['SUB_MATH', 'SUB_ENG', 'SUB_SCI'] },
                { id: 'CLS_002', school_id: 'SCH_DEFAULT', name: 'JHS 1 B', level: 'JHS', active: true, subjects: ['SUB_MATH', 'SUB_ENG'] }
            ],
            subjects: [
                // KG Subjects
                { id: 'SUB_KG_LIT', school_id: 'SCH_DEFAULT', name: 'Language & Literacy', code: 'LIT', level: 'KG', active: true },
                { id: 'SUB_KG_NUM', school_id: 'SCH_DEFAULT', name: 'Numeracy', code: 'NUM', level: 'KG', active: true },
                { id: 'SUB_KG_ENV', school_id: 'SCH_DEFAULT', name: 'Environmental Studies', code: 'ENV', level: 'KG', active: true },
                { id: 'SUB_KG_ART', school_id: 'SCH_DEFAULT', name: 'Creative Arts', code: 'ART', level: 'KG', active: true },
                { id: 'SUB_KG_OWOP', school_id: 'SCH_DEFAULT', name: 'Our World Our People', code: 'OWOP', level: 'KG', active: true },
                { id: 'SUB_KG_PHY', school_id: 'SCH_DEFAULT', name: 'Physical Development', code: 'PHY', level: 'KG', active: true },
                { id: 'SUB_KG_RME', school_id: 'SCH_DEFAULT', name: 'Religious & Moral Education', code: 'RME', level: 'KG', active: true },

                // Primary Subjects
                { id: 'SUB_PRI_ENG', school_id: 'SCH_DEFAULT', name: 'English Language', code: 'ENG', level: 'Primary', active: true },
                { id: 'SUB_PRI_MATH', school_id: 'SCH_DEFAULT', name: 'Mathematics', code: 'MATH', level: 'Primary', active: true },
                { id: 'SUB_PRI_SCI', school_id: 'SCH_DEFAULT', name: 'Science', code: 'SCI', level: 'Primary', active: true },
                { id: 'SUB_PRI_OWOP', school_id: 'SCH_DEFAULT', name: 'Our World Our People', code: 'OWOP', level: 'Primary', active: true },
                { id: 'SUB_PRI_ART', school_id: 'SCH_DEFAULT', name: 'Creative Arts', code: 'ART', level: 'Primary', active: true },
                { id: 'SUB_PRI_RME', school_id: 'SCH_DEFAULT', name: 'Religious & Moral Education', code: 'RME', level: 'Primary', active: true },
                { id: 'SUB_PRI_PE', school_id: 'SCH_DEFAULT', name: 'Physical Education', code: 'PE', level: 'Primary', active: true },
                { id: 'SUB_PRI_GHA', school_id: 'SCH_DEFAULT', name: 'Ghanaian Language', code: 'GHA', level: 'Primary', active: true },
                { id: 'SUB_PRI_ICT', school_id: 'SCH_DEFAULT', name: 'Computing / ICT', code: 'ICT', level: 'Primary', active: true },

                // JHS Subjects
                { id: 'SUB_JHS_ENG', school_id: 'SCH_DEFAULT', name: 'English Language', code: 'ENG', level: 'JHS', active: true },
                { id: 'SUB_JHS_MATH', school_id: 'SCH_DEFAULT', name: 'Mathematics', code: 'MATH', level: 'JHS', active: true },
                { id: 'SUB_JHS_SCI', school_id: 'SCH_DEFAULT', name: 'Integrated Science', code: 'SCI', level: 'JHS', active: true },
                { id: 'SUB_JHS_SOC', school_id: 'SCH_DEFAULT', name: 'Social Studies', code: 'SOC', level: 'JHS', active: true },
                { id: 'SUB_JHS_RME', school_id: 'SCH_DEFAULT', name: 'Religious & Moral Education', code: 'RME', level: 'JHS', active: true },
                { id: 'SUB_JHS_COM', school_id: 'SCH_DEFAULT', name: 'Computing', code: 'COM', level: 'JHS', active: true },
                { id: 'SUB_JHS_CAT', school_id: 'SCH_DEFAULT', name: 'Career Technology', code: 'CAT', level: 'JHS', active: true },
                { id: 'SUB_JHS_CAD', school_id: 'SCH_DEFAULT', name: 'Creative Arts & Design', code: 'CAD', level: 'JHS', active: true },
                { id: 'SUB_JHS_GHA', school_id: 'SCH_DEFAULT', name: 'Ghanaian Language', code: 'GHA', level: 'JHS', active: true },
                { id: 'SUB_JHS_FRE', school_id: 'SCH_DEFAULT', name: 'French', code: 'FRE', level: 'JHS', active: false }
            ],
            students: [
                { 
                    id: 'ST_001', 
                    school_id: 'SCH_DEFAULT', 
                    name: 'Kwame Mensah', 
                    class: 'JHS 1 A', 
                    gender: 'Male', 
                    active: true,
                    scores: [
                        { subject_id: 'SUB_JHS_MATH', subject: 'Mathematics', class_score: 25, exam_score: 60, status: 'Pending' },
                        { subject_id: 'SUB_JHS_ENG', subject: 'English Language', class_score: 20, exam_score: 55, status: 'Pending' },
                        { subject_id: 'SUB_JHS_SCI', subject: 'Integrated Science', class_score: 22, exam_score: 58, status: 'Pending' }
                    ],
                    attendance: { present: 45, total: 60 },
                    conduct: 'Good'
                },
                { 
                    id: 'ST_002', 
                    school_id: 'SCH_DEFAULT', 
                    name: 'Ama Serwaa', 
                    class: 'JHS 1 A', 
                    gender: 'Female', 
                    active: true,
                    scores: [
                        { subject_id: 'SUB_JHS_MATH', subject: 'Mathematics', class_score: 28, exam_score: 65, status: 'Pending' },
                        { subject_id: 'SUB_JHS_ENG', subject: 'English Language', class_score: 26, exam_score: 62, status: 'Pending' }
                    ],
                    attendance: { present: 58, total: 60 },
                    conduct: 'Excellent'
                }
            ]
        };
        localStorage.setItem(DB_KEY, JSON.stringify(initialData));
        console.log("Database seeded.");
    },

    // --- Helpers ---
    generateId: (prefix = 'ID') => {
        return prefix + '_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
};

// Initialize on load
Storage.init();
