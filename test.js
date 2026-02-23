
        // Check Super Admin Auth
        const user = checkAuth(['super_admin']);
        if(user) {
            document.getElementById('super-admin-name').textContent = user.name || 'Super Admin';
        }

        // Initialize Dashboard
        async function initSuperAdmin() {
            const stats = await fetchSuperAdminData('stats');
            if(stats) {
                document.getElementById('total-schools').textContent = stats.schools;
                document.getElementById('total-students').textContent = stats.students;
                document.getElementById('total-teachers').textContent = stats.teachers;
                document.getElementById('active-schools').textContent = stats.active_schools;
            }
            renderSchools();
        }

        async function renderSchools() {
            const db = await Storage.get();
            const schools = db.schools.filter(s => !s.deleted) || [];
            const searchTerm = document.getElementById('search-school').value.toLowerCase();
            const statusFilter = document.getElementById('filter-status').value;

            let filtered = schools.filter(school => {
                const matchesSearch = school.name.toLowerCase().includes(searchTerm);
                const matchesStatus = !statusFilter || 
                    (statusFilter === 'active' && school.active !== false) ||
                    (statusFilter === 'blocked' && school.active === false);
                return matchesSearch && matchesStatus;
            });

            const grid = document.getElementById('schools-grid');
            
            if(filtered.length === 0) {
                grid.innerHTML = `
                    <div class="col-span-full text-center py-12 text-gray-400">
                        <ion-icon name="school-outline" class="text-6xl mb-4"></ion-icon>
                        <p class="text-lg font-medium">No schools found</p>
                    </div>
                `;
                return;
            }

            grid.innerHTML = filtered.map(school => {
                const students = db.students.filter(s => s.school_id === school.id).length;
                const teachers = db.users.filter(u => u.school_id === school.id && u.role === 'teacher').length;
                const admins = db.users.filter(u => u.school_id === school.id && u.role === 'admin').length;
                const isBlocked = school.active === false;

                return `
                    <div class="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition ${isBlocked ? 'opacity-60' : ''}">
                        <div class="flex items-start justify-between mb-4">
                            <div class="flex-1">
                                <h3 class="font-bold text-lg text-gray-900 mb-1">${school.name}</h3>
                                <p class="text-xs text-gray-500">${school.address || 'No address'}</p>
                            </div>
                            ${isBlocked ? 
                                '<span class="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Blocked</span>' :
                                '<span class="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Active</span>'
                            }
                        </div>
                        
                        <div class="grid grid-cols-3 gap-3 mb-4">
                            <div class="bg-blue-50 rounded-xl p-3 text-center">
                                <p class="text-2xl font-bold text-blue-600">${students}</p>
                                <p class="text-xs text-blue-700 font-medium">Students</p>
                            </div>
                            <div class="bg-purple-50 rounded-xl p-3 text-center">
                                <p class="text-2xl font-bold text-purple-600">${teachers}</p>
                                <p class="text-xs text-purple-700 font-medium">Teachers</p>
                            </div>
                            <div class="bg-orange-50 rounded-xl p-3 text-center">
                                <p class="text-2xl font-bold text-orange-600">${admins}</p>
                                <p class="text-xs text-orange-700 font-medium">Admins</p>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-2">
                            <button onclick="editSchool('${school.id}')" class="py-2 bg-blue-500 text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition flex items-center justify-center gap-1">
                                <ion-icon name="pencil"></ion-icon> Edit
                            </button>
                            ${isBlocked ? 
                                `<button onclick="toggleSchoolStatus('${school.id}', true)" class="py-2 bg-green-500 text-white rounded-lg text-sm font-bold hover:bg-green-600 transition flex items-center justify-center gap-1">
                                    <ion-icon name="checkmark-circle"></ion-icon> Unblock
                                </button>` :
                                `<button onclick="toggleSchoolStatus('${school.id}', false)" class="py-2 bg-yellow-500 text-white rounded-lg text-sm font-bold hover:bg-yellow-600 transition flex items-center justify-center gap-1">
                                    <ion-icon name="ban"></ion-icon> Block
                                </button>`
                            }
                            <button onclick="viewSchoolDetails('${school.id}')" class="py-2 bg-gray-500 text-white rounded-lg text-sm font-bold hover:bg-gray-600 transition flex items-center justify-center gap-1">
                                <ion-icon name="eye"></ion-icon> View
                            </button>
                            <button onclick="deleteSchool('${school.id}')" class="py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition flex items-center justify-center gap-1">
                                <ion-icon name="trash"></ion-icon> Delete
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        async function toggleSchoolStatus(schoolId, activate) {
            const action = activate ? 'unblock' : 'block';
            if(!confirm(`Are you sure you want to ${action} this school?`)) return;
            
            const result = await fetchSuperAdminData('toggle_school', { school_id: schoolId, active: activate });
            if(result && result.success) {
                alert(`School ${activate ? 'unblocked' : 'blocked'} successfully!`);
                initSuperAdmin();
            } else {
                alert('Failed to update school status');
            }
        }

        function viewSchoolDetails(schoolId) {
            alert(`School details view coming soon for ID: ${schoolId}`);
        }

        function openAddSchoolModal() {
            document.getElementById('add-school-modal').classList.remove('hidden');
        }

        function closeModal(modalId) {
            document.getElementById(modalId).classList.add('hidden');
        }

        async function handleAddSchool(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            const levels = [];
            formData.getAll('levels').forEach(level => levels.push(level));
            
            const data = {
                school_name: formData.get('school_name'),
                school_address: formData.get('school_address'),
                contact_email: formData.get('contact_email'),
                contact_phone: formData.get('contact_phone'),
                admin_name: formData.get('admin_name'),
                email: formData.get('admin_email'),
                password: formData.get('admin_password'),
                levels: levels
            };

            const result = await registerSchool(data);
            if(result && result.success) {
                alert('School created successfully!');
                closeModal('add-school-modal');
                e.target.reset();
                initSuperAdmin();
            } else {
                alert('Failed to create school');
            }
        }

        async function editSchool(schoolId) {
            const db = await Storage.get();
            const school = db.schools.find(s => s.id === schoolId);
            
            if (!school) {
                alert('School not found');
                return;
            }

            // Populate the edit form
            document.getElementById('edit-school-id').value = school.id;
            document.getElementById('edit-school-name').value = school.name;
            document.getElementById('edit-school-address').value = school.address || '';
            document.getElementById('edit-contact-email').value = school.contact_email || '';
            document.getElementById('edit-contact-phone').value = school.contact_phone || '';
            document.getElementById('edit-school-active').checked = school.active !== false;

            // Open modal
            document.getElementById('edit-school-modal').classList.remove('hidden');
        }

        async function handleEditSchool(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            const data = {
                school_id: formData.get('school_id'),
                school_name: formData.get('school_name'),
                school_address: formData.get('school_address'),
                contact_email: formData.get('contact_email'),
                contact_phone: formData.get('contact_phone'),
                active: document.getElementById('edit-school-active').checked
            };

            const result = await fetchSuperAdminData('edit_school', data);
            if(result && result.success) {
                alert('School updated successfully!');
                closeModal('edit-school-modal');
                initSuperAdmin();
            } else {
                alert('Failed to update school');
            }
        }

        function deleteSchool(schoolId) {
            document.getElementById('delete-school-id').value = schoolId;
            document.getElementById('delete-school-modal').classList.remove('hidden');
        }

        async function confirmDeleteSchool() {
            const schoolId = document.getElementById('delete-school-id').value;
            
            const result = await fetchSuperAdminData('delete_school', { school_id: schoolId });
            if(result && result.success) {
                alert('School deleted successfully!');
                closeModal('delete-school-modal');
                initSuperAdmin();
            } else {
                alert(result.message || 'Failed to delete school');
            }
        }

        // ==== ADMIN MANAGEMENT FUNCTIONS ====

        async function renderAdmins() {
            const db = await Storage.get();
            const admins = db.users.filter(u => u.role === 'admin') || [];
            const searchTerm = document.getElementById('search-admin').value.toLowerCase();
            const schoolFilter = document.getElementById('filter-admin-school').value;
            const statusFilter = document.getElementById('filter-admin-status').value;

            let filtered = admins.filter(admin => {
                const matchesSearch = admin.name.toLowerCase().includes(searchTerm) || 
                                     admin.email.toLowerCase().includes(searchTerm);
                const matchesSchool = !schoolFilter || admin.school_id === schoolFilter;
                const matchesStatus = !statusFilter || 
                    (statusFilter === 'active' && admin.active !== false) ||
                    (statusFilter === 'inactive' && admin.active === false);
                return matchesSearch && matchesSchool && matchesStatus;
            });

            const tbody = document.getElementById('admins-table');
            
            if (filtered.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center py-12 text-gray-400">
                            <ion-icon name="person-outline" class="text-6xl mb-4"></ion-icon>
                            <p class="text-lg font-medium">No admins found</p>
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = filtered.map(admin => {
                const school = db.schools.find(s => s.id === admin.school_id);
                const isActive = admin.active !== false;

                return `
                    <tr class="border-b border-gray-100 hover:bg-gray-50">
                        <td class="py-4 px-4">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                                    ${admin.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p class="font-bold text-gray-900">${admin.name}</p>
                                    <p class="text-xs text-gray-500">ID: ${admin.id}</p>
                                </div>
                            </div>
                        </td>
                        <td class="py-4 px-4 text-gray-700">${admin.email}</td>
                        <td class="py-4 px-4">
                            <span class="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                ${school ? school.name : 'Unassigned'}
                            </span>
                        </td>
                        <td class="py-4 px-4">
                            ${isActive ?
                                '<span class="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Active</span>' :
                                '<span class="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Inactive</span>'
                            }
                        </td>
                        <td class="py-4 px-4">
                            <div class="flex justify-end gap-2">
                                <button onclick="editAdmin('${admin.id}')" class="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition" title="Edit">
                                    <ion-icon name="pencil"></ion-icon>
                                </button>
                                <button onclick="resetAdminPassword('${admin.id}')" class="p-2 hover:bg-purple-50 rounded-lg text-purple-600 transition" title="Reset Password">
                                    <ion-icon name="key"></ion-icon>
                                </button>
                                <button onclick="toggleAdminStatus('${admin.id}', ${!isActive})" class="p-2 hover:bg-${isActive ? 'red' : 'green'}-50 rounded-lg text-${isActive ? 'red' : 'green'}-600 transition" title="${isActive ? 'Deactivate' : 'Activate'}">
                                    <ion-icon name="${isActive ? 'close-circle' : 'checkmark-circle'}"></ion-icon>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        async function populateSchoolDropdowns() {
            const db = await Storage.get();
            const schools = db.schools.filter(s => !s.deleted && s.active !== false);
            
            const options = schools.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
            
            document.getElementById('admin-add-school').innerHTML = '<option value="">Select School</option>' + options;
            document.getElementById('edit-admin-school').innerHTML = options;
            document.getElementById('filter-admin-school').innerHTML = '<option value="">All Schools</option>' + options;
        }

        async function openAddAdminModal() {
            await populateSchoolDropdowns();
            document.getElementById('add-admin-modal').classList.remove('hidden');
        }

        async function handleAddAdmin(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            const data = {
                name: formData.get('admin_name'),
                email: formData.get('admin_email'),
                password: formData.get('admin_password'),
                school_id: formData.get('school_id')
            };

            const result = await fetchSuperAdminData('create_admin', data);
            if (result && result.success) {
                alert('Admin created successfully!');
                closeModal('add-admin-modal');
                e.target.reset();
                renderAdmins();
            } else {
             alert(result.message || 'Failed to create admin');
            }
        }

        async function editAdmin(adminId) {
            const db = await Storage.get();
            const admin = db.users.find(u => u.id === adminId);
            
            if (!admin) {
                alert('Admin not found');
                return;
            }

            await populateSchoolDropdowns();
            
            document.getElementById('edit-admin-id').value = admin.id;
            document.getElementById('edit-admin-name').value = admin.name;
            document.getElementById('edit-admin-email').value = admin.email;
            document.getElementById('edit-admin-school').value = admin.school_id;
            document.getElementById('edit-admin-active').checked = admin.active !== false;

            document.getElementById('edit-admin-modal').classList.remove('hidden');
        }

        async function handleEditAdmin(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            const data = {
                admin_id: formData.get('admin_id'),
                name: formData.get('admin_name'),
                email: formData.get('admin_email'),
                school_id: formData.get('school_id'),
                active: document.getElementById('edit-admin-active').checked
            };

            const result = await fetchSuperAdminData('edit_admin', data);
            if (result && result.success) {
                alert('Admin updated successfully!');
                closeModal('edit-admin-modal');
                renderAdmins();
            } else {
                alert(result.message || 'Failed to update admin');
            }
        }

        async function toggleAdminStatus(adminId, activate) {
            const action = activate ? 'activate' : 'deactivate';
            if (!confirm(`Are you sure you want to ${action} this admin?`)) return;
            
            const result = await fetchSuperAdminData('toggle_admin', { admin_id: adminId, active: activate });
            if (result && result.success) {
                alert(`Admin ${activate ? 'activated' : 'deactivated'} successfully!`);
                renderAdmins();
            } else {
                alert('Failed to update admin status');
            }
        }

        function resetAdminPassword(adminId) {
            document.getElementById('reset-admin-id').value = adminId;
            document.getElementById('reset-password-modal').classList.remove('hidden');
        }

        async function handleResetPassword(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            const newPassword = formData.get('new_password');
            const confirmPassword = formData.get('confirm_password');
            
            if (newPassword !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }

            const data = {
                admin_id: document.getElementById('reset-admin-id').value,
                new_password: newPassword
            };

            const result = await fetchSuperAdminData('reset_admin_password', data);
            if (result && result.success) {
                alert('Password reset successfully!');
                closeModal('reset-password-modal');
                e.target.reset();
            } else {
                alert('Failed to reset password');
            }
        }

        // Initialize on load
        initSuperAdmin();
        renderAdmins();
    