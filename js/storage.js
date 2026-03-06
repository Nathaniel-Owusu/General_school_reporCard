/**
 * Remote Database Storage Module
 * All operations go directly to MySQL via API
 * NO localStorage dependency
 */

// Auto-detect base URL so this works on localhost AND Hostinger/mobile
const _base = (function() {
    // Use the current page's origin + path up to the app root
    const path = window.location.pathname.replace(/\/[^\/]*$/, ''); // strip filename
    return window.location.origin + path;
})();
const API_URL = _base + '/api/db_handler.php';

// In-memory cache + sessionStorage persistence (survives page navigation)
const SESSION_CACHE_KEY = 'grc_db_cache';
const SESSION_TS_KEY    = 'grc_db_ts';
let _dbCache        = null;
let _cacheTimestamp = null;
let _saveTimer      = null;
let _initialized    = false;

// Restore cache from sessionStorage on script load (instant — no network)
(function _restoreCache() {
    try {
        const raw = sessionStorage.getItem(SESSION_CACHE_KEY);
        const ts  = parseInt(sessionStorage.getItem(SESSION_TS_KEY) || '0', 10);
        if (raw && ts) {
            _dbCache        = JSON.parse(raw);
            _cacheTimestamp = ts;
            console.log('⚡ Storage: Restored DB from sessionStorage (instant load)');
        }
    } catch(e) {
        // Corrupted cache — ignore, will refetch
        sessionStorage.removeItem(SESSION_CACHE_KEY);
        sessionStorage.removeItem(SESSION_TS_KEY);
    }
})();

const Storage = {
    /**
     * Initialize the database connection.
     * Fetches initial data from server and seeds if empty.
     */
    init: async () => {
        if (_initialized) return; // Prevent double-init
        _initialized = true;
        console.log("🌐 Storage: Initializing remote database connection...");
        
        try {
            const response = await fetch(API_URL);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const serverData = await response.json();
            
            // Check if database has data
            if (serverData && serverData.schools && serverData.schools.length > 0) {
                console.log("✅ Storage: Connected to remote database");
                _dbCache = serverData;
            } else {
                console.log("🌱 Storage: Database is empty. Seeding initial data...");
                await Storage.seed();
            }
            
            // Auto-fix schema for large JSON fields (silently)
            try { fetch(_base + '/api/fix_schema.php'); } catch(e) {}
        } catch (e) {
            _initialized = false; // Allow retry
            console.error("❌ Storage: Failed to connect to database", e);
            // Don't alert/throw here — let the login page handle errors gracefully
        }
    },

    /**
     * Get the entire database.
     * CACHE-FIRST: Returns instantly from memory/sessionStorage if fresh (< 5 min).
     * Only hits the network on first load or after cache expires / is invalidated.
     */
    get: async () => {
        const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
        const now = Date.now();

        // ✅ CACHE HIT — memory is always fastest
        if (_dbCache && _cacheTimestamp && (now - _cacheTimestamp) < CACHE_TTL) {
            return _dbCache;
        }

        // 🌐 CACHE MISS — fetch from server
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            _dbCache        = data;
            _cacheTimestamp = Date.now();

            // Persist to sessionStorage so next page load is instant
            try {
                sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(data));
                sessionStorage.setItem(SESSION_TS_KEY, String(_cacheTimestamp));
            } catch(e) { /* sessionStorage full — ignore */ }

            return data;
        } catch (e) {
            console.error("❌ Storage.get() failed:", e);
            if (_dbCache) {
                console.warn("⚠️ Using stale cache due to network error");
                return _dbCache;
            }
            throw new Error("Database unavailable and no cache available");
        }
    },

    /**
     * Force a fresh fetch, bypassing cache.
     * Use after major operations that change data on the server.
     */
    refresh: async () => {
        _cacheTimestamp = null;
        return await Storage.get();
    },

    /**
     * Save to server — DEBOUNCED.
     * Rapid saves within 800ms are batched into ONE network call.
     * UI updates instantly from cache; server write happens after the delay.
     */
    save: async (data) => {
        data.last_updated = Date.now();

        // Update memory cache immediately so the UI reflects changes right away
        _dbCache        = data;
        _cacheTimestamp = Date.now();

        // Invalidate sessionStorage so the next page load fetches fresh data
        sessionStorage.removeItem(SESSION_CACHE_KEY);
        sessionStorage.removeItem(SESSION_TS_KEY);

        // Cancel any pending save and schedule a fresh one
        if (_saveTimer) clearTimeout(_saveTimer);

        return new Promise((resolve, reject) => {
            _saveTimer = setTimeout(async () => {
                try {
                    console.log("💾 Storage: Saving to remote database...");
                    const response = await fetch(API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(_dbCache) // Always use latest cache
                    });

                    const result = await response.json();
                    if (!result.success) throw new Error(result.message || "Save failed");

                    console.log("✅ Storage: Saved successfully");

                    // Re-persist the now-confirmed data to sessionStorage
                    try {
                        sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(_dbCache));
                        sessionStorage.setItem(SESSION_TS_KEY, String(_cacheTimestamp));
                    } catch(e) { /* sessionStorage full — ignore */ }

                    window.dispatchEvent(new Event('db-updated'));
                    resolve(result);
                } catch (e) {
                    console.error("❌ Storage.save() failed:", e);
                    reject(e);
                }
            }, 800); // Batch saves within 800ms window
        });
    },


    /**
     * Sync is now same as save (kept for compatibility)
     */
    sync: async (data = null) => {
        if (!data) {
            data = await Storage.get();
        }
        return await Storage.save(data);
    },

    /**
     * Reset the database to factory settings.
     */
    reset: async () => {
        if (!confirm("⚠️ Factory Reset Warning\n\nThis will DELETE ALL DATA and reset to default.\n\nAre you sure?")) {
            return;
        }
        
        console.log("🔄 Storage: Performing factory reset...");
        await Storage.seed();
        alert("✅ Database has been reset to factory defaults.");
        location.reload();
    },

    /**
     * Seed the database with initial data.
     */
    seed: async () => {
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
                { id: 'CLS_001', school_id: 'SCH_DEFAULT', name: 'JHS 1 A', level: 'JHS', active: true, subjects: ['SUB_JHS_MATH', 'SUB_JHS_ENG', 'SUB_JHS_SCI'] },
                { id: 'CLS_002', school_id: 'SCH_DEFAULT', name: 'JHS 1 B', level: 'JHS', active: true, subjects: ['SUB_JHS_MATH', 'SUB_JHS_ENG'] }
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
                    status: 'Active',
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
                    status: 'Active',
                    scores: [
                        { subject_id: 'SUB_JHS_MATH', subject: 'Mathematics', class_score: 28, exam_score: 65, status: 'Pending' },
                        { subject_id: 'SUB_JHS_ENG', subject: 'English Language', class_score: 26, exam_score: 62, status: 'Pending' }
                    ],
                    attendance: { present: 58, total: 60 },
                    conduct: 'Excellent'
                }
            ],
            last_updated: Date.now()
        };
        
        try {
            await Storage.save(initialData);
            console.log("✅ Database seeded successfully");
            _dbCache = initialData;
        } catch (e) {
            console.error("❌ Failed to seed database:", e);
            throw e;
        }
    },

    /**
     * Generate a unique ID with prefix.
     */
    generateId: (prefix = 'ID') => {
        return prefix + '_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
};

// NOTE: Storage.init() is NOT called automatically here.
// Pages that need the database (dashboard, teacher-portal, etc.) call Storage.init() explicitly.
// The login page does NOT need Storage.init() — it uses api/login.php directly.

// Auto-init only on pages that actually need the full database
// login.html and public pages are skipped for fast load on mobile
(function() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    const skipPages = ['login.html', 'index.html', 'contact.html', 'admissions.html'];
    if (!skipPages.includes(page)) {
        Storage.init();
    }
})();
