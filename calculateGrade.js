// --- Global Grading Utility ---
window.calculateGrade = function(score) {
    let system = [];
    try {
        if (window.currentSettings && window.currentSettings.gradingSystem) {
            system = typeof window.currentSettings.gradingSystem === 'string' ? JSON.parse(window.currentSettings.gradingSystem) : window.currentSettings.gradingSystem;
        } else {
            const ls = sessionStorage.getItem('db_cache');
            if (ls) {
                const db = JSON.parse(ls);
                const s = db.schools && db.schools[0] ? db.schools[0].settings : null;
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
