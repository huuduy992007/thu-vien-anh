document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".reg-card");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const fullname = document.getElementById("fullname").value.trim();
        const email = document.getElementById("email").value.trim().toLowerCase();
        const password = document.getElementById("password").value;

        if (!fullname || !email || !password) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        // Đảm bảo admin mặc định tồn tại
        ensureDefaultAdmin();

        // Lấy danh sách người dùng hiện có
        const users = JSON.parse(localStorage.getItem("users")) || [];

        // Kiểm tra email đã tồn tại chưa
        const exists = users.some(u => u.email === email);
        if (exists) {
            alert("Email đã được đăng ký trước đó. Vui lòng dùng email khác hoặc đăng nhập.");
            return;
        }

        // Tạo người dùng mới
        const newUser = {
            fullname,
            email,
            password,
            role: "member",
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));

        // Lưu email mới nhất để hiển thị trong trang thông tin người dùng
        localStorage.setItem("lastRegisteredEmail", email);

        alert("Đăng ký thành công! 🎉 Bây giờ bạn có thể đăng nhập.");
        form.reset();

        window.location.href = "login.html";
    });
});

// Đảm bảo admin mặc định tồn tại
function ensureDefaultAdmin() {
    const DEFAULT_ADMIN = {
        fullname: "Default Admin",
        email: "huuduy992007@gmail.com",
        password: "huuduy992007",
        role: "admin",
        createdAt: new Date().toISOString()
    };

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const hasAdmin = users.some(u => u.email === DEFAULT_ADMIN.email);
    if (!hasAdmin) {
        users.unshift(DEFAULT_ADMIN);
        localStorage.setItem("users", JSON.stringify(users));
    }
}

