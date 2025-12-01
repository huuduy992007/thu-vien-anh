document.addEventListener("DOMContentLoaded", () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser || currentUser.role !== "admin") {
        alert("Bạn cần đăng nhập bằng tài khoản Admin để truy cập trang này.");
        window.location.href = "login.html";
        return;
    }

    const tbody = document.querySelector("#usersTable tbody");
    const searchInput = document.getElementById("searchInput");
    const btnRefresh = document.getElementById("btnRefresh");
    const btnExport = document.getElementById("btnExport");
    const btnClearAll = document.getElementById("btnClearAll");

    function loadUsers(filter = "") {
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const lastRegisteredEmail = localStorage.getItem("lastRegisteredEmail");
        tbody.innerHTML = "";

        const filtered = users.filter(u => {
            const q = filter.trim().toLowerCase();
            return !q || (u.fullname && u.fullname.toLowerCase().includes(q)) || (u.email && u.email.toLowerCase().includes(q));
        });

        filtered.forEach((u, idx) => {
            const tr = document.createElement("tr");
            if (u.email === lastRegisteredEmail) tr.classList.add("highlight");
            tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${u.fullname || "(chưa có)"}</td>
        <td>${u.email}</td>
        <td>
          <select class="role-select" data-email="${u.email}">
            <option value="admin" ${u.role === "admin" ? "selected" : ""}>Admin</option>
            <option value="editor" ${u.role === "editor" ? "selected" : ""}>Editor/Staff</option>
            <option value="member" ${u.role === "member" ? "selected" : ""}>Member</option>
          </select>
        </td>
        <td>${new Date(u.createdAt).toLocaleString()}</td>
        <td>
          <button class="btn-small btn-view" data-email="${u.email}">Xem</button>
          <button class="btn-small btn-delete" data-email="${u.email}">Xóa</button>
        </td>
      `;
            tbody.appendChild(tr);
        });
    }

    tbody.addEventListener("change", (e) => {
        const sel = e.target;
        if (sel.classList.contains("role-select")) {
            const email = sel.dataset.email;
            const newRole = sel.value;
            updateUserRole(email, newRole);
            alert("Cập nhật quyền thành công.");
        }
    });

    tbody.addEventListener("click", (e) => {
        const btn = e.target;
        if (btn.classList.contains("btn-view")) {
            const email = btn.dataset.email;
            window.location.href = `user-info.html?email=${encodeURIComponent(email)}`;
        }
        if (btn.classList.contains("btn-delete")) {
            const email = btn.dataset.email;
            if (!confirm(`Bạn có chắc muốn xóa ${email}?`)) return;
            deleteUser(email);
            loadUsers(searchInput.value);
        }
    });

    btnRefresh.addEventListener("click", () => loadUsers(searchInput.value));
    searchInput.addEventListener("input", () => loadUsers(searchInput.value));

    btnExport.addEventListener("click", () => {
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const blob = new Blob([JSON.stringify(users, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "users.json";
        a.click();
        URL.revokeObjectURL(url);
    });

    btnClearAll.addEventListener("click", () => {
        if (!confirm("Xóa toàn bộ user (trừ admin mặc định)?")) return;
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const adminEmail = "huuduy992007@gmail.com";
        const remaining = users.filter(u => u.email === adminEmail);
        localStorage.setItem("users", JSON.stringify(remaining));
        loadUsers();
        alert("Đã xóa tất cả người dùng (trừ admin).");
    });

    function updateUserRole(email, newRole) {
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const idx = users.findIndex(u => u.email === email);
        if (idx >= 0) {
            users[idx].role = newRole;
            localStorage.setItem("users", JSON.stringify(users));
        }
    }

    function deleteUser(email) {
        let users = JSON.parse(localStorage.getItem("users")) || [];
        if (email === "huuduy992007@gmail.com") {
            alert("Không thể xóa admin mặc định.");
            return;
        }
        users = users.filter(u => u.email !== email);
        localStorage.setItem("users", JSON.stringify(users));
    }

    loadUsers();
});
