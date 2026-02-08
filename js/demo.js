
// Demo Data Generator & Manager

const DEMO_NAMES = {
    first: ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"],
    last: ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"]
};

const DEMO_SUBJECTS = [
    { id: "SUB_ENG", name: "English Language", code: "ENG" },
    { id: "SUB_MATH", name: "Mathematics", code: "MATH" },
    { id: "SUB_SCI", name: "Integrated Science", code: "SCI" },
    { id: "SUB_SOC", name: "Social Studies", code: "SOC" },
    { id: "SUB_ICT", name: "I.C.T.", code: "ICT" }
];

const DEMO_CLASSES = ["JHS 1", "JHS 2", "JHS 3"];

function generateRandomName() {
    const f = DEMO_NAMES.first[Math.floor(Math.random() * DEMO_NAMES.first.length)];
    const l = DEMO_NAMES.last[Math.floor(Math.random() * DEMO_NAMES.last.length)];
    return `${f} ${l}`;
}

function generateDemoData() {
    const data = {
        settings: {
            schoolName: "Demo International School",
            schoolMotto: "Excellence in Demonstration",
            schoolAddress: "123 Demo Lane, Tech City",
            contactPhone: "+123 456 7890",
            contactEmail: "demo@school.com",
            academicYears: [{ id: "AY_DEMO", name: "2025/2026", active: true }],
            currentTerm: "2nd Term",
            gradingSystem: [], // Use defaults
            toggles: { showPosition: true, showAttendance: true, showWatermark: false }
        },
        subjects: DEMO_SUBJECTS.map(s => ({...s, status: 'Active'})),
        classes: [],
        students: [],
        teachers: [],
        admins: [{ name: "Demo Admin", email: "admin@demo.com", password: "admin" }]
    };

    // Create Classes
    DEMO_CLASSES.forEach((name, i) => {
        data.classes.push({
            id: `C_00${i+1}`,
            name: name,
            subjects: data.subjects.map(s => s.id)
        });
    });

    // Create Teachers
    data.teachers.push({
        id: "T_DEMO_1",
        name: "Mr. Demo Teacher",
        email: "teacher@demo.com",
        password: "password",
        assigned_classes: data.classes.map(c => c.id)
    });

    // Create Students & Results
    let studentIdCounter = 1000;
    data.classes.forEach(cls => {
        // 10 students per class
        for(let i=0; i<10; i++) {
            const scores = [];
            // Generate scores for each subject
            data.subjects.forEach(sub => {
                const classScore = Math.floor(Math.random() * 20) + 10; // 10-30
                const examScore = Math.floor(Math.random() * 40) + 30; // 30-70
                scores.push({
                    subject: sub.name,
                    class: classScore,
                    exam: examScore,
                    status: Math.random() > 0.2 ? 'Approved' : 'Pending'
                });
            });

            data.students.push({
                id: `ST_${studentIdCounter++}`,
                name: generateRandomName(),
                class: cls.name,
                term: "2nd Term",
                year: "2025/2026",
                attendance: { present: Math.floor(Math.random() * 10) + 50, total: 60 },
                conduct: "Good",
                teacher_remark: "A diligent student.",
                head_remark: "Promoted",
                position: `${i+1}th`,
                total_students: 10,
                scores: scores
            });
        }
    });

    return data;
}

// Manager Functions
const DEMO_KEY = 'is_demo_mode';
const REAL_DATA_KEY = 'schoolData_real';

function isDemoMode() {
    return localStorage.getItem(DEMO_KEY) === 'true';
}

function enableDemoMode() {
    if(isDemoMode()) return; // Already on

    const realData = localStorage.getItem('schoolData');
    if(realData) {
        localStorage.setItem(REAL_DATA_KEY, realData);
    }

    const demoData = generateDemoData();
    localStorage.setItem('schoolData', JSON.stringify(demoData));
    localStorage.setItem(DEMO_KEY, 'true');
    
    // Switch Session User to Demo equivalent
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if(currentUser) {
        let demoUser = null;
        if(currentUser.type === 'admin') {
            demoUser = demoData.admins[0];
            demoUser.type = 'admin';
        } else if(currentUser.type === 'teacher') {
            demoUser = demoData.teachers[0];
            demoUser.type = 'teacher';
        } else if(currentUser.type === 'student') {
            demoUser = demoData.students[0];
            demoUser.type = 'student';
        }

        if(demoUser) {
            sessionStorage.setItem('currentUser', JSON.stringify(demoUser));
        }
    }

    location.reload();
}

function disableDemoMode() {
    if(!isDemoMode()) return;

    // Restore Real Data
    const realData = localStorage.getItem(REAL_DATA_KEY);
    if(realData) {
        localStorage.setItem('schoolData', realData);
    } else {
        localStorage.removeItem('schoolData'); // Reset to empty/mock defaults
    }
    
    // Restore Session if possible, or Logout
    sessionStorage.removeItem('currentUser');
    
    localStorage.removeItem(REAL_DATA_KEY);
    localStorage.removeItem(DEMO_KEY);
    
    window.location.href = 'login.html'; // Redirect to login to force re-auth with real data
}

function renderDemoBanner() {
    if(!isDemoMode()) return;

    // Remove existing if any
    const existing = document.getElementById('demo-banner');
    if(existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'demo-banner';
    banner.className = "bg-orange-600 text-white px-4 py-3 text-center text-sm font-bold shadow-2xl fixed bottom-6 right-6 z-50 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-white/20 animate-bounce-in max-w-xs";
    banner.innerHTML = `
        <div class="flex items-center gap-2 text-lg">
            <ion-icon name="flask"></ion-icon> DEMO MODE
        </div>
        <p class="text-xs font-normal opacity-90">You are viewing generated sample data. Real data is hidden.</p>
        <button onclick="disableDemoMode()" class="bg-white text-orange-600 px-4 py-2 mt-1 rounded-lg text-xs font-bold uppercase hover:bg-orange-50 transition w-full shadow-sm">
            Exit Demo Mode
        </button>
    `;
    document.body.appendChild(banner);
}

function updateDemoButtons() {
    const btnEnable = document.getElementById('btn-enable-demo');
    const btnDisable = document.getElementById('btn-disable-demo');
    
    if(btnEnable && btnDisable) {
        if(isDemoMode()) {
            btnEnable.classList.add('hidden');
            btnDisable.classList.remove('hidden');
        } else {
            btnEnable.classList.remove('hidden');
            btnDisable.classList.add('hidden');
        }
    }
}

function updateLoginHints() {
    if(!isDemoMode()) return;
    
    const hintContainer = document.querySelector('.text-xs.text-center.text-gray-300');
    if(hintContainer) {
        hintContainer.innerHTML = `
            <span class="text-orange-400 font-bold block mb-1">DEMO MODE ACTIVE</span>
            Student (ST_1000) • Teacher (teacher@demo.com / password) • Admin (admin@demo.com / admin)
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Check if we are in demo mode
    if(isDemoMode()) {
        console.log("Demo Mode Active");
    }
    renderDemoBanner();
    updateDemoButtons();
    updateLoginHints();
});
