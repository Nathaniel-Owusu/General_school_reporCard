// Settings Management Logic

// Tab Switching
function switchSettingsTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.settings-tab').forEach(el => el.classList.add('hidden'));
    // Show selected
    const tabEl = document.getElementById(`set-${tabName}`);
    if(tabEl) tabEl.classList.remove('hidden');

    // Update buttons
    const buttons = ['general', 'grading', 'attendance', 'system', 'academic'];
    buttons.forEach(btn => {
        const el = document.getElementById(`tab-${btn}`);
        if(!el) return;
        
        if(btn === tabName) {
            el.classList.remove('bg-gray-100', 'text-gray-500');
            el.classList.add('bg-accent', 'text-white', 'shadow-md');
        } else {
            el.classList.add('text-gray-500');
            el.classList.remove('bg-accent', 'text-white', 'shadow-md');
            el.classList.add('bg-gray-100'); // Add hover state base
        }
    });

    if(tabName === 'academic') renderYears();
}

// Initial Load
function initSettingsView() {
    // Ensure data.settings exists
    if (!data.settings) data.settings = {};

    // Load data into forms
    // General
    const s = data.settings;
    if(document.getElementById('set-school-name')) document.getElementById('set-school-name').value = s.schoolName || '';
    if(document.getElementById('set-school-motto')) document.getElementById('set-school-motto').value = s.schoolMotto || '';
    if(document.getElementById('set-school-address')) document.getElementById('set-school-address').value = s.schoolAddress || '';
    if(document.getElementById('set-contact-phone')) document.getElementById('set-contact-phone').value = s.contactPhone || '';
    if(document.getElementById('set-contact-email')) document.getElementById('set-contact-email').value = s.contactEmail || '';
    
    if(s.schoolLogo && document.getElementById('logo-preview-area')) {
        document.getElementById('logo-preview-area').innerHTML = `<img src="${s.schoolLogo}" class="w-full h-full object-contain rounded-xl">`;
    }

    // Grading
    renderGradingTable();

    // Attendance
    if(document.getElementById('set-att-days')) document.getElementById('set-att-days').value = s.attendance?.totalDays || 60;
    if(document.getElementById('set-att-default')) document.getElementById('set-att-default').value = s.attendance?.defaultPresent || 0;

    // Toggles
    if(document.getElementById('toggle-teacher-edit')) document.getElementById('toggle-teacher-edit').checked = s.toggles?.teacherEdit !== false;
    if(document.getElementById('toggle-show-pos')) document.getElementById('toggle-show-pos').checked = s.toggles?.showPosition !== false;
    if(document.getElementById('toggle-show-att')) document.getElementById('toggle-show-att').checked = s.toggles?.showAttendance !== false;
    if(document.getElementById('toggle-show-watermark')) document.getElementById('toggle-show-watermark').checked = s.toggles?.showWatermark === true;

    // Academic
    renderYears();
    updateTermButtons();
    if(document.getElementById('term-lock-toggle')) document.getElementById('term-lock-toggle').checked = s.termLocked;
    
    // Default to general tab on first load if none active (or always)
    // Actually initSettingsView is called when tab is clicked in sidebar.
    // We should ensure the first tab is active.
    switchSettingsTab('general');
}

// --- GENERAL ---

function handleLogoUpload(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        if(file.size > 1024 * 1024 * 2) { // 2MB
            alert("File too large. Please upload an image under 2MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const MAX_SIZE = 400; // slightly larger
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                const base64 = canvas.toDataURL('image/png');
                
                document.getElementById('logo-preview-area').innerHTML = `<img src="${base64}" class="w-full h-full object-contain rounded-xl">`;
                
                // Store temporarily? Or directly save? The user might not click Save.
                // But logo upload is usually immediate. Let's store in a temp variable or verify save flow.
                // For simplicity, we assign it to data but don't persist until Save is clicked.
                if(!data.settings) data.settings = {};
                data.settings.schoolLogo = base64; 
            }
            img.src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
}

function saveGeneralSettings() {
    if(!data.settings) data.settings = {};
    
    data.settings.schoolName = document.getElementById('set-school-name').value;
    data.settings.schoolMotto = document.getElementById('set-school-motto').value;
    data.settings.schoolAddress = document.getElementById('set-school-address').value;
    data.settings.contactPhone = document.getElementById('set-contact-phone').value;
    data.settings.contactEmail = document.getElementById('set-contact-email').value;
    // Logo is already in data.settings.schoolLogo if uploaded
    
    saveSchoolData(data);
    alert('School identity updated successfully!');
}

// --- GRADING ---

function renderGradingTable() {
    const tbody = document.getElementById('grading-table-body');
    if(!tbody) return;
    
    const system = data.settings.gradingSystem || [];
    
    if(system.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-gray-400 italic">No grading rules defined. Add one to start.</td></tr>`;
        return;
    }

    tbody.innerHTML = system.map((rule, index) => `
        <tr class="bg-white border-b hover:bg-gray-50">
            <td class="px-4 py-2"><input type="number" onchange="updateGradingRow(${index}, 'min', this.value)" value="${rule.min}" class="w-16 px-2 py-1 border border-gray-200 rounded outline-none focus:border-accent bg-white"></td>
            <td class="px-4 py-2"><input type="number" onchange="updateGradingRow(${index}, 'max', this.value)" value="${rule.max}" class="w-16 px-2 py-1 border border-gray-200 rounded outline-none focus:border-accent bg-white"></td>
            <td class="px-4 py-2"><input type="text" onchange="updateGradingRow(${index}, 'grade', this.value)" value="${rule.grade}" class="w-16 px-2 py-1 border border-gray-200 rounded outline-none focus:border-accent font-bold text-center bg-white"></td>
            <td class="px-4 py-2"><input type="text" onchange="updateGradingRow(${index}, 'remark', this.value)" value="${rule.remark}" class="w-full px-2 py-1 border border-gray-200 rounded outline-none focus:border-accent bg-white"></td>
            <td class="px-4 py-2 text-right">
                <button onclick="removeGradingRow(${index})" class="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition"><ion-icon name="trash"></ion-icon></button>
            </td>
        </tr>
    `).join('');
}

function addGradingRow() {
    if(!data.settings.gradingSystem) data.settings.gradingSystem = [];
    data.settings.gradingSystem.push({ min: 0, max: 0, grade: '-', remark: 'New' });
    renderGradingTable();
}

function removeGradingRow(index) {
    if(confirm('Delete this grade range?')) {
        data.settings.gradingSystem.splice(index, 1);
        renderGradingTable();
    }
}

function updateGradingRow(index, field, value) {
    if(field === 'min' || field === 'max') value = parseInt(value) || 0;
    data.settings.gradingSystem[index][field] = value;
}

function saveGradingSettings() {
    const system = data.settings.gradingSystem;
    // Check overlaps
    // Sort by min descending to be safe?
    system.sort((a,b) => b.min - a.min);

    // Simple overlap check?
    for(let i=0; i<system.length-1; i++) {
        if(system[i].min <= system[i+1].max) {
             alert(`Range Overlap Detected between:\n${system[i].min}-${system[i].max} and ${system[i+1].min}-${system[i+1].max}\nPlease fix overlaps before saving.`);
             return; 
        }
    }
    
    saveSchoolData(data);
    alert('Grading rules saved!');
    renderGradingTable(); // Re-render sorted
}

// --- ATTENDANCE ---

function saveAttendanceSettings() {
    if(!data.settings.attendance) data.settings.attendance = {};
    data.settings.attendance.totalDays = parseInt(document.getElementById('set-att-days').value) || 60;
    data.settings.attendance.defaultPresent = parseInt(document.getElementById('set-att-default').value) || 0;
    
    saveSchoolData(data);
    alert('Attendance settings saved!');
}

// --- SYSTEM ---

function saveSystemSettings() {
    if(!data.settings.toggles) data.settings.toggles = {};
    
    data.settings.toggles.teacherEdit = document.getElementById('toggle-teacher-edit').checked;
    data.settings.toggles.showPosition = document.getElementById('toggle-show-pos').checked;
    data.settings.toggles.showAttendance = document.getElementById('toggle-show-att').checked;
    data.settings.toggles.showWatermark = document.getElementById('toggle-show-watermark').checked;
    
    saveSchoolData(data);
    alert('System behavior updated!');
}

// --- ACADEMIC YEAR & TERM LOGIC ---

function renderYears() {
    const yearsContainer = document.getElementById('years-list');
    if(!yearsContainer) return;
    
    if(!data.settings.academicYears) data.settings.academicYears = [];

    yearsContainer.innerHTML = data.settings.academicYears.map(y => `
        <div class="flex items-center justify-between p-4 rounded-xl border ${y.active ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-gray-100'} transition">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full ${y.active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'} flex items-center justify-center font-bold text-sm">
                    <ion-icon name="${y.active ? 'checkmark' : 'calendar'}"></ion-icon>
                </div>
                <span class="font-bold ${y.active ? 'text-blue-900' : 'text-gray-600'}">${escapeHtml(y.name)}</span>
                ${y.active ? '<span class="text-[10px] font-bold bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full uppercase">Active</span>' : ''}
            </div>
            ${!y.active ? `<button onclick="activateYear('${y.id}')" class="text-xs font-bold text-accent hover:underline">Set Active</button>` : ''}
        </div>
    `).join('');
}

function updateTermButtons() {
    ['1st Term', '2nd Term', '3rd Term'].forEach((term, i) => {
        const btn = document.getElementById(`btn-term-${i+1}`);
        if(!btn) return;
        
        if (data.settings.currentTerm === term) {
            btn.className = "term-btn px-2 py-2 rounded-lg text-sm font-bold border transition bg-secondary text-white border-secondary ring-2 ring-orange-200";
        } else {
            btn.className = "term-btn px-2 py-2 rounded-lg text-sm font-bold border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 bg-white";
        }
    });
}

function setActiveTerm(term) {
    if(confirm(`Change active term to ${term}?`)) {
        data.settings.currentTerm = term;
        saveSchoolData(data);
        updateTermButtons();
    }
}

function toggleTermLock() {
    const toggle = document.getElementById('term-lock-toggle');
    if(toggle) {
        data.settings.termLocked = toggle.checked;
        saveSchoolData(data);
    }
}

function activateYear(id) {
    if(confirm('Change the Active Academic Year? This will affect all new reports.')) {
        data.settings.academicYears.forEach(y => y.active = (y.id === id));
        saveSchoolData(data);
        renderYears();
    }
}

function openAddYearModal() {
    const yearName = prompt("Enter New Academic Year (e.g. 2025/2026):");
    if(yearName) {
        const id = "AY_" + Date.now();
        if(!data.settings.academicYears) data.settings.academicYears = [];
        data.settings.academicYears.push({ id, name: yearName, active: false });
        saveSchoolData(data);
        renderYears();
    }
}
