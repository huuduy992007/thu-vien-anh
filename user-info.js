// user-info.js
document.addEventListener('DOMContentLoaded', () => {
    // Lấy query param trong URL
    function getQueryParam(name) {
        const url = new URL(window.location.href);
        return url.searchParams.get(name);
    }

    const emailParam = getQueryParam('email'); // nếu có => admin xem user bất kỳ
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

    const content = document.getElementById('content');
    const backLink = document.getElementById('back-link');

    // ====== Helper cho avatar / tên / role ======
    function getDisplayName(user) {
        if (!user) return '';
        const name = user.fullname && user.fullname.trim();
        return name || user.email || '';
    }

    function getAvatarInitial(user) {
        const displayName = getDisplayName(user);
        return displayName ? displayName.charAt(0).toUpperCase() : '?';
    }

    function getRoleClass(user) {
        const role = (user.role || '').toLowerCase();
        if (role === 'admin') return 'avatar-admin';
        if (role === 'editor' || role === 'editor/staff' || role === 'staff') return 'avatar-editor';
        return 'avatar-member';
    }

    // Lấy avatar đã lưu riêng (nếu có)
    function getStoredAvatar(email, fallbackAvatar) {
        if (!email) return fallbackAvatar || '';
        const key = 'avatar:' + email;
        const stored = localStorage.getItem(key);
        if (stored) return stored;
        return fallbackAvatar || '';
    }

    function buildAvatarDiv(user) {
        const initial = getAvatarInitial(user);
        const roleClass = getRoleClass(user);
        const hasAvatar = user.avatar && String(user.avatar).trim();
        const style = hasAvatar ? ` style="background-image:url('${user.avatar}')"` : '';
        const cls = hasAvatar ? `avatar ${roleClass} has-image` : `avatar ${roleClass}`;

        return `<div class="${cls}"${style}><span>${initial}</span></div>`;
    }

    function buildProfileHeader(user) {
        const displayName = getDisplayName(user);
        return `
            <div class="profile-header">
                ${buildAvatarDiv(user)}
                <div class="profile-title">
                    <div class="profile-name">${displayName}</div>
                    <div class="profile-role">${user.role}</div>
                </div>
            </div>
            <hr class="profile-divider" />
        `;
    }

    // ====== CHẾ ĐỘ XEM BỞI ADMIN (CÓ ?email=...) ======
    if (emailParam) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === emailParam);

        if (currentUser && currentUser.role === 'admin') {
            backLink.href = 'admin.html';
            backLink.textContent = 'Quay về Admin';
        } else {
            backLink.href = 'index.html';
            backLink.textContent = 'Về trang chính';
        }

        if (!user) {
            content.innerHTML = `<p>Không tìm thấy người dùng với email: ${emailParam}</p>`;
        } else {
            // Ưu tiên avatar lưu riêng nếu field avatar trong users bị mất
            user.avatar = getStoredAvatar(user.email, user.avatar);

            const headerHtml = buildProfileHeader(user);
            content.innerHTML = `
                ${headerHtml}
                <div class="field">
                    <span class="label">Họ và tên</span>
                    <div class="value">${user.fullname || '(chưa có)'}</div>
                </div>
                <div class="field">
                    <span class="label">Email</span>
                    <div class="value">${user.email}</div>
                </div>
                <div class="field">
                    <span class="label">Role</span>
                    <div class="value">${user.role}</div>
                </div>
                <div class="field">
                    <span class="label">Ngày tạo</span>
                    <div class="value">${new Date(user.createdAt).toLocaleString()}</div>
                </div>
            `;
        }
        return;
    }

    // ====== CHẾ ĐỘ HỒ SƠ CÁ NHÂN (KHÔNG CÓ ?email) ======
    if (!currentUser || !currentUser.email) {
        alert('Vui lòng đăng nhập để xem và cập nhật hồ sơ cá nhân.');
        window.location.href = 'login.html';
        return;
    }

    backLink.href = 'index.html';
    backLink.textContent = 'Về trang chính';

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const idx = users.findIndex(u => u.email === currentUser.email);

    if (idx === -1) {
        content.innerHTML = `<p>Không tìm thấy dữ liệu người dùng hiện tại.</p>`;
        return;
    }

    const user = users[idx];

    // Lấy avatar từ key riêng nếu field avatar bị mất
    const avatarKey = 'avatar:' + user.email;
    user.avatar = getStoredAvatar(user.email, user.avatar);

    let avatarData = user.avatar || '';

    const headerHtml = buildProfileHeader(user);
    const initial = getAvatarInitial(user);
    const roleClass = getRoleClass(user);
    const hasAvatar = avatarData && String(avatarData).trim();
    const previewClass = hasAvatar ? `avatar ${roleClass} has-image` : `avatar ${roleClass}`;
    const previewStyle = hasAvatar ? `style="background-image:url('${avatarData}')"` : '';

    // Form cập nhật hồ sơ + upload avatar
    content.innerHTML = `
        ${headerHtml}
        <form id="profile-form">
            <div class="field avatar-edit-field">
                <span class="label">Ảnh đại diện</span>
                <div class="avatar-edit">
                    <div class="${previewClass}" id="avatarPreview" ${previewStyle}>
                        <span>${initial}</span>
                    </div>
                    <div class="avatar-edit-controls">
                        <label class="btn-secondary">
                            Chọn ảnh
                            <input type="file" id="avatarInput" accept="image/*" hidden>
                        </label>
                        <button type="button" class="link-reset" id="avatarRemoveBtn">Xóa ảnh</button>
                    </div>
                </div>
            </div>

            <div class="field">
                <label class="label" for="fullname">Họ và tên</label>
                <input type="text" id="fullname" class="input-text" value="${user.fullname || ''}">
            </div>

            <div class="field">
                <span class="label">Email (không thể thay đổi)</span>
                <div class="value">${user.email}</div>
            </div>

            <div class="field">
                <label class="label" for="password">Mật khẩu mới (để trống nếu không đổi)</label>
                <input type="password" id="password" class="input-text" placeholder="••••••••">
            </div>

            <div class="field">
                <span class="label">Role</span>
                <div class="value">${user.role}</div>
            </div>

            <div class="field">
                <span class="label">Ngày tạo</span>
                <div class="value">${new Date(user.createdAt).toLocaleString()}</div>
            </div>

            <button type="submit" class="btn">Lưu thay đổi</button>
            <a href="index.html" class="btn" id="back-link-inline">Về trang chính</a>
            <div id="message"></div>
        </form>
    `;

    if (backLink) backLink.style.display = 'none';

    const form = document.getElementById('profile-form');
    const fullnameInput = document.getElementById('fullname');
    const passwordInput = document.getElementById('password');
    const messageEl = document.getElementById('message');

    const avatarPreview = document.getElementById('avatarPreview');
    const avatarInput = document.getElementById('avatarInput');
    const avatarRemoveBtn = document.getElementById('avatarRemoveBtn');

    function refreshAvatarPreview() {
        const letter = getAvatarInitial({
            ...user,
            fullname: fullnameInput.value || user.fullname
        });
        avatarPreview.className = `avatar ${getRoleClass(user)}`;
        avatarPreview.style.backgroundImage = '';
        avatarPreview.classList.remove('has-image');

        const span = avatarPreview.querySelector('span');
        if (span) span.textContent = letter;

        if (avatarData && String(avatarData).trim()) {
            avatarPreview.classList.add('has-image');
            avatarPreview.style.backgroundImage = `url('${avatarData}')`;
        }
    }

    if (avatarInput) {
        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                avatarData = reader.result;
                refreshAvatarPreview();
            };
            reader.readAsDataURL(file);
        });
    }

    if (avatarRemoveBtn) {
        avatarRemoveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            avatarData = '';
            if (avatarInput) avatarInput.value = '';
            refreshAvatarPreview();
        });
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const newFullname = fullnameInput.value.trim();
        const newPassword = passwordInput.value;

        if (!newFullname) {
            messageEl.textContent = 'Họ và tên không được để trống.';
            messageEl.classList.add('error');
            return;
        }

        const usersData = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = usersData.findIndex(u => u.email === currentUser.email);

        if (userIndex === -1) {
            messageEl.textContent = 'Không tìm thấy dữ liệu người dùng để cập nhật.';
            messageEl.classList.add('error');
            return;
        }

        // Cập nhật fullname
        usersData[userIndex].fullname = newFullname;

        // Mật khẩu mới
        if (newPassword && newPassword.trim().length > 0) {
            usersData[userIndex].password = newPassword;
        }

        // Avatar: lưu cả vào users[userIndex] và key riêng avatar:email
        const avatarKeySave = 'avatar:' + usersData[userIndex].email;
        if (avatarData && String(avatarData).trim()) {
            usersData[userIndex].avatar = avatarData;
            localStorage.setItem(avatarKeySave, avatarData);
        } else {
            delete usersData[userIndex].avatar;
            localStorage.removeItem(avatarKeySave);
        }

        // Lưu lại users
        localStorage.setItem('users', JSON.stringify(usersData));

        // Cập nhật currentUser
        const updatedUser = { ...currentUser, fullname: newFullname };
        if (newPassword && newPassword.trim().length > 0) {
            updatedUser.password = newPassword;
        }
        if (avatarData && String(avatarData).trim()) {
            updatedUser.avatar = avatarData;
        } else {
            delete updatedUser.avatar;
        }
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));

        passwordInput.value = '';
        messageEl.textContent = 'Đã cập nhật hồ sơ thành công.';
        messageEl.classList.remove('error');

        refreshAvatarPreview();
    });
});
