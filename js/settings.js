// Settings Management Logic

let currentSettings = {};

// Tab Switching
function switchSettingsTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.settings-tab').forEach(el => el.classList.add('hidden'));
    // Show selected
    const tabEl = document.getElementById(`set-${tabName}`);
    if(tabEl) tabEl.classList.remove('hidden');

    // Update buttons
    const buttons = ['general', 'grading', 'attendance', 'system', 'academic', 'data'];
    buttons.forEach(btn => {
        const el = document.getElementById(`tab-${btn}`);
        if(!el) return;
        
        if(btn === tabName) {
            el.classList.remove('bg-gray-100', 'text-gray-500');
            el.classList.add('bg-accent', 'text-white', 'shadow-md');
        } else {
            el.classList.add('text-gray-500');
            el.classList.remove('bg-accent', 'text-white', 'shadow-md');
            el.classList.add('bg-gray-100'); 
        }
    });
}

// Initial Load
async function initSettingsView() {
    // Fetch Settings
    currentSettings = await fetchAdminData('get_settings') || {};

    // Load data into forms
    // General
    const s = currentSettings;
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
    const att = typeof s.attendance === 'string' ? JSON.parse(s.attendance) : (s.attendance || {});
    if(document.getElementById('set-att-days')) document.getElementById('set-att-days').value = att.totalDays || 60;
    if(document.getElementById('set-att-default')) document.getElementById('set-att-default').value = att.defaultPresent || 0;

    // Toggles
    const toggles = typeof s.toggles === 'string' ? JSON.parse(s.toggles) : (s.toggles || {});
    if(document.getElementById('toggle-teacher-edit')) document.getElementById('toggle-teacher-edit').checked = toggles.teacherEdit !== false;
    if(document.getElementById('toggle-show-pos')) document.getElementById('toggle-show-pos').checked = toggles.showPosition !== false;
    if(document.getElementById('toggle-show-att')) document.getElementById('toggle-show-att').checked = toggles.showAttendance !== false;
    if(document.getElementById('toggle-show-watermark')) document.getElementById('toggle-show-watermark').checked = toggles.showWatermark === true;

    // Term/Year
    updateTermButtons();
    if(document.getElementById('term-lock-toggle')) document.getElementById('term-lock-toggle').checked = s.termLocked === 'true' || s.termLocked === true;
    
    switchSettingsTab('general');
}

// --- GENERAL ---

function handleLogoUpload(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        if(file.size > 1024 * 1024 * 2) { 
            alert("File too large. Please upload an image under 2MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const MAX_SIZE = 400; 
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
                
                currentSettings.schoolLogo = base64; 
            }
            img.src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
}

async function saveGeneralSettings() {
    const data = {
        schoolName: document.getElementById('set-school-name').value,
        schoolMotto: document.getElementById('set-school-motto').value,
        schoolAddress: document.getElementById('set-school-address').value,
        contactPhone: document.getElementById('set-contact-phone').value,
        contactEmail: document.getElementById('set-contact-email').value,
        schoolLogo: currentSettings.schoolLogo 
    };
    
    const result = await fetchAdminData('save_settings', data, 'POST');
    if(result && result.success) {
        alert('School identity updated successfully!');
    } else {
        alert('Failed to save settings.');
    }
}

// --- GRADING ---

function renderGradingTable() {
    const tbody = document.getElementById('grading-table-body');
    if(!tbody) return;
    
    let system = currentSettings.gradingSystem;
    if (typeof system === 'string') system = JSON.parse(system);
    if (!Array.isArray(system)) system = [];
    
    currentSettings.gradingSystem = system; // Ensure array in memory
    
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
    if(!currentSettings.gradingSystem) currentSettings.gradingSystem = [];
    currentSettings.gradingSystem.push({ min: 0, max: 0, grade: '-', remark: 'New' });
    renderGradingTable();
}

function removeGradingRow(index) {
    if(confirm('Delete this grade range?')) {
        currentSettings.gradingSystem.splice(index, 1);
        renderGradingTable();
    }
}

function updateGradingRow(index, field, value) {
    currentSettings.gradingSystem[index][field] = value; // Type conversion handled by JSON stringify/parse loose typing usually, but good to be safe
    if(field === 'min' || field === 'max') currentSettings.gradingSystem[index][field] = parseInt(value) || 0;
}

async function saveGradingSettings() {
    const system = currentSettings.gradingSystem;
    // Simple overlap check
    // system.sort((a,b) => b.min - a.min); // Optional sort before save

    const result = await fetchAdminData('save_settings', { gradingSystem: system }, 'POST');
    if(result && result.success) {
        alert('Grading rules saved!');
    } else {
        alert('Failed to save grading rules.');
    }
}

// --- ATTENDANCE ---

async function saveAttendanceSettings() {
    const att = {
        totalDays: parseInt(document.getElementById('set-att-days').value) || 60,
        defaultPresent: parseInt(document.getElementById('set-att-default').value) || 0
    };
    
    const result = await fetchAdminData('save_settings', { attendance: att }, 'POST');
    if(result && result.success) {
        alert('Attendance settings saved!');
    }
}

// --- SYSTEM ---

async function saveSystemSettings() {
    const toggles = {
        teacherEdit: document.getElementById('toggle-teacher-edit').checked,
        showPosition: document.getElementById('toggle-show-pos').checked,
        showAttendance: document.getElementById('toggle-show-att').checked,
        showWatermark: document.getElementById('toggle-show-watermark').checked
    };
    
    const result = await fetchAdminData('save_settings', { toggles: toggles }, 'POST');
    if(result && result.success) {
         alert('System behavior updated!');
    }
}

// --- ACADEMIC YEAR & TERM LOGIC ---

// Note: Years logic removed from this pass as it requires complex complex object management, 
// using simple Setting keys for active year name/id is better or a dedicated table. 
// For now, let's just handle current Term.

function updateTermButtons() {
    ['1st Term', '2nd Term', '3rd Term'].forEach((term, i) => {
        const btn = document.getElementById(`btn-term-${i+1}`);
        if(!btn) return;
        
        let current = currentSettings.currentTerm;
        
        if (current === term) {
            btn.className = "term-btn px-2 py-2 rounded-lg text-sm font-bold border transition bg-secondary text-white border-secondary ring-2 ring-orange-200";
        } else {
            btn.className = "term-btn px-2 py-2 rounded-lg text-sm font-bold border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 bg-white";
        }
    });
}

async function setActiveTerm(term) {
    if(confirm(`Change active term to ${term}?`)) {
        currentSettings.currentTerm = term;
        const result = await fetchAdminData('save_settings', { currentTerm: term }, 'POST');
        if(result) updateTermButtons();
    }
}

async function toggleTermLock() {
    const toggle = document.getElementById('term-lock-toggle');
    if(toggle) {
        const val = toggle.checked;
        await fetchAdminData('save_settings', { termLocked: val }, 'POST');
    }
}

// Placeholder for Year Management if needed
function renderYears() {
     const container = document.getElementById('years-list');
     if(container) container.innerHTML = '<p class="text-gray-400 text-sm p-4">Academic Year Management: Coming Soon</p>';
}
function openAddYearModal() { alert('Coming Soon'); }


// --- DATA MANAGEMENT ---

async function exportData() {
    const data = await fetchAdminData('backup');
    if(!data) { alert('Backup failed'); return; }
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `school_backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

async function handleRestore(input) {
    if(!input.files || !input.files[0]) return;
    
    const file = input.files[0];
    const reader = new FileReader();
    
    reader.onload = async function(e) {
        try {
            const json = JSON.parse(e.target.result);
            // Basic validation: check for key properties
            if(!json.schools && !json.students) throw new Error("Invalid format");
            
            if(confirm('Warning: This will OVERWRITE all current data. Proceed?')) {
                const result = await fetchAdminData('restore', { data: json }, 'POST');
                if(result && result.success) {
                    alert('Restore successful! Reloading...');
                    location.reload();
                } else {
                    alert('Restore failed: ' + (result?.message || 'Unknown error'));
                }
            }
        } catch(err) {
            alert('Error parsing backup file: ' + err.message);
        }
        input.value = ''; // Reset input
    };
    reader.readAsText(file);
}

