// login.js
document.addEventListener('DOMContentLoaded', () => {
    ensureDefaultAdmin();

    const form = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');

    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value.trim();

        // ✅ Kiểm tra rỗng
        if (!email || !password) {
            errorMessage.textContent = 'Vui lòng nhập đầy đủ email và mật khẩu';
            errorMessage.style.color = 'red';
            return;
        }

        // ✅ Đọc users an toàn
        const users = getUsersSafely();

        // ✅ Kiểm tra user
        const foundUser = users.find(u => u.email === email && u.password === password);

        if (!foundUser) {
            errorMessage.textContent = 'Sai email hoặc mật khẩu';
            errorMessage.style.color = 'red';
            return;
        }

        // Lưu người dùng đang đăng nhập
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        errorMessage.textContent = '';

        // Admin -> admin.html, người khác -> index.html
        if (foundUser.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'index.html';
        }
    });
});

// ====== HÀM HỖ TRỢ ======

// Đọc danh sách users an toàn, không bị vỡ nếu localStorage hỏng
function getUsersSafely() {
    try {
        const raw = localStorage.getItem('users');
        if (!raw) return [];
        const data = JSON.parse(raw);
        return Array.isArray(data) ? data : [];
    } catch (e) {
        console.error('Lỗi đọc users từ localStorage, reset lại.', e);
        // Nếu dữ liệu hỏng thì xóa đi cho sạch
        localStorage.removeItem('users');
        return [];
    }
}

// Đảm bảo luôn có admin mặc định
function ensureDefaultAdmin() {
    const DEFAULT_ADMIN = {
        fullname: "Default Admin",
        email: "huuduy992007@gmail.com",
        password: "huuduy992007",
        role: "admin",
        createdAt: new Date().toISOString()
    };

    const users = getUsersSafely();
    const hasAdmin = users.some(u => u.email === DEFAULT_ADMIN.email);

    if (!hasAdmin) {
        users.unshift(DEFAULT_ADMIN);
        localStorage.setItem('users', JSON.stringify(users));
    }
}

