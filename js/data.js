// Mock Data for the School Report System

const MOCK_DATA = {
    students: [
        {
            id: "ST001",
            name: "Emmanuel Mensah",
            class: "JHS 2 A",
            term: "1st Term",
            year: "2024/2025",
            attendance: { present: 58, total: 60 },
            conduct: "Exemplary",
            teacher_remark: "Emmanuel is a disciplined hard worker.",
            head_remark: "Promoted to next class.",
            position: "4th",
            total_students: 45,
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
            scores: [
                { subject: "English Language", class: 24, exam: 58, status: "Pending" },
                { subject: "Mathematics", class: 26, exam: 62, status: "Approved" },
                { subject: "Integrated Science", class: 22, exam: 53, status: "Rejected" },
                { subject: "Social Studies", class: 25, exam: 60, status: "Pending" },
                { subject: "I.C.T.", class: 28, exam: 65, status: "Pending" },
                { subject: "R.M.E.", class: 27, exam: 55, status: "Pending" },
                { subject: "B.D.T.", class: 23, exam: 50, status: "Pending" },
                { subject: "French", class: 20, exam: 45, status: "Pending" },
                { subject: "Ghanaian Language", class: 25, exam: 58, status: "Pending" }
            ]
        },
        {
            id: "ST002",
            name: "Sarah Jones",
            class: "JHS 2 A",
            term: "1st Term",
            year: "2024/2025",
            attendance: { present: 55, total: 60 },
            conduct: "Good",
            teacher_remark: "Sarah needs to participate more in class.",
            head_remark: "Promoted.",
            position: "12th",
            total_students: 45,
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
            scores: [
                { subject: "English Language", class: 25, exam: 65, status: "Pending" },
                { subject: "Mathematics", class: 20, exam: 50, status: "Pending" },
                { subject: "Integrated Science", class: 18, exam: 45, status: "Pending" },
                { subject: "Social Studies", class: 22, exam: 55, status: "Pending" },
                { subject: "I.C.T.", class: 24, exam: 60, status: "Pending" },
                { subject: "R.M.E.", class: 26, exam: 52, status: "Pending" },
                { subject: "B.D.T.", class: 21, exam: 48, status: "Pending" },
                { subject: "French", class: 22, exam: 50, status: "Pending" },
                { subject: "Ghanaian Language", class: 24, exam: 55, status: "Pending" }
            ]
        }
    ],
    teachers: [
        { id: "T001", email: "teacher@school.com", password: "password", name: "Mr. John Doe", assigned_classes: ["C001", "C002"] }
    ],
    admins: [
        { email: "admin@school.com", password: "admin", name: "Admin" }
    ],
    subjects: [
        { id: "SUB_ENG", name: "English Language", code: "ENG", status: "Active" },
        { id: "SUB_MATH", name: "Mathematics", code: "MATH", status: "Active" },
        { id: "SUB_SCI", name: "Integrated Science", code: "SCI", status: "Active" },
        { id: "SUB_SOC", name: "Social Studies", code: "SOC", status: "Active" },
        { id: "SUB_ICT", name: "I.C.T.", code: "ICT", status: "Active" },
        { id: "SUB_RME", name: "R.M.E.", code: "RME", status: "Active" },
        { id: "SUB_BDT", name: "B.D.T.", code: "BDT", status: "Active" },
        { id: "SUB_FRE", name: "French", code: "FRE", status: "Active" },
        { id: "SUB_GHL", name: "Ghanaian Language", code: "GHL", status: "Active" },
        { id: "SUB_OWOP", name: "Our World Our People", code: "OWOP", status: "Active" },
        { id: "SUB_HIS", name: "History", code: "HIS", status: "Active" },
        { id: "SUB_CA", name: "Creative Arts", code: "CA", status: "Active" }
    ],
    classes: [
        { id: "C_KG1A", name: "KG 1 A" }, { id: "C_KG1B", name: "KG 1 B" },
        { id: "C_KG2A", name: "KG 2 A" }, { id: "C_KG2B", name: "KG 2 B" },
        { id: "C_BS1A", name: "Basic 1 A" }, { id: "C_BS1B", name: "Basic 1 B" },
        { id: "C_BS2A", name: "Basic 2 A" }, { id: "C_BS2B", name: "Basic 2 B" },
        { id: "C_BS3A", name: "Basic 3 A" }, { id: "C_BS3B", name: "Basic 3 B" },
        { id: "C_BS4A", name: "Basic 4 A" }, { id: "C_BS4B", name: "Basic 4 B" },
        { id: "C_BS5A", name: "Basic 5 A" }, { id: "C_BS5B", name: "Basic 5 B" },
        { id: "C_BS6A", name: "Basic 6 A" }, { id: "C_BS6B", name: "Basic 6 B" },
        { id: "C_JHS1A", name: "JHS 1 A" }, { id: "C_JHS1B", name: "JHS 1 B" },
        { id: "C_JHS2A", name: "JHS 2 A" }, { id: "C_JHS2B", name: "JHS 2 B" },
        { id: "C_JHS3A", name: "JHS 3 A" }, { id: "C_JHS3B", name: "JHS 3 B" }
    ],
    settings: {
        academicYears: [
            { id: "AY_23_24", name: "2023/2024", active: false },
            { id: "AY_24_25", name: "2024/2025", active: true }
        ],
        currentTerm: "1st Term", // 1st Term, 2nd Term, 3rd Term
        termLocked: false,
        schoolName: "General School",
        schoolMotto: "Knowledge is Power",
        schoolAddress: "123 School Lane, Accra, Ghana",
        contactPhone: "+233 55 123 4567",
        contactEmail: "info@generalschool.edu.gh",
        schoolLogo: "", // Base64 string placeholder
        gradingSystem: [
            { min: 80, max: 100, grade: '1', remark: 'HIGHEST' },
            { min: 70, max: 79, grade: '2', remark: 'HIGHER' },
            { min: 65, max: 69, grade: '3', remark: 'HIGH' },
            { min: 60, max: 64, grade: '4', remark: 'HIGH AVERAGE' },
            { min: 55, max: 59, grade: '5', remark: 'AVERAGE' },
            { min: 50, max: 54, grade: '6', remark: 'LOW AVERAGE' },
            { min: 45, max: 49, grade: '7', remark: 'LOW' },
            { min: 40, max: 44, grade: '8', remark: 'LOWER' },
            { min: 0, max: 39, grade: '9', remark: 'LOWEST' }
        ],
        attendance: {
            totalDays: 60,
            defaultPresent: 0
        },
        toggles: {
            teacherEdit: true,
            showPosition: true,
            showAttendance: true,
            showWatermark: false
        }
    }
};

// Initialize LocalStorage if empty
if (!localStorage.getItem('schoolData')) {
    localStorage.setItem('schoolData', JSON.stringify(MOCK_DATA));
}
