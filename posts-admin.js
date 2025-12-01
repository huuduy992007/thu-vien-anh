// posts-admin.js
document.addEventListener("DOMContentLoaded", () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser || currentUser.role !== "admin") {
        alert("Bạn cần đăng nhập bằng tài khoản Admin để truy cập trang này.");
        window.location.href = "login.html";
        return;
    }

    const btnBackUsers = document.getElementById("btnBackUsers");
    const postForm = document.getElementById("postForm");
    const titleInput = document.getElementById("title");
    const thumbnailInput = document.getElementById("thumbnail");
    const excerptInput = document.getElementById("excerpt");
    const contentInput = document.getElementById("content");
    const statusSelect = document.getElementById("status");
    const postsTableBody = document.querySelector("#postsTable tbody");

    // ====== HÀM TIỆN ÍCH ======
    function getPosts() {
        return JSON.parse(localStorage.getItem("posts")) || [];
    }

    function savePosts(posts) {
        localStorage.setItem("posts", JSON.stringify(posts));
    }

    // ====== HIỂN THỊ DANH SÁCH BÀI VIẾT ======
    function renderPosts() {
        const posts = getPosts();

        if (!posts.length) {
            postsTableBody.innerHTML = `
                <tr><td colspan="4">Chưa có bài viết nào.</td></tr>
            `;
            return;
        }

        // sắp xếp mới nhất lên trên
        posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        postsTableBody.innerHTML = posts.map(p => {
            const createdDate = p.createdAt
                ? new Date(p.createdAt).toLocaleDateString("vi-VN")
                : "";
            return `
                <tr data-id="${p.id}">
                    <td>${p.title}</td>
                    <td>
                        <select class="post-status-select">
                            <option value="pending" ${p.status === "pending" ? "selected" : ""}>Chờ duyệt</option>
                            <option value="approved" ${p.status === "approved" ? "selected" : ""}>Đã duyệt</option>
                            <option value="hidden" ${p.status === "hidden" ? "selected" : ""}>Ẩn</option>
                        </select>
                    </td>
                    <td>${createdDate}</td>
                    <td>
                        <button class="btn-delete-post">Xóa</button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    // ====== THÊM BÀI VIẾT MỚI ======
    postForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const title = titleInput.value.trim();
        const thumbnail = thumbnailInput.value.trim();
        const excerpt = excerptInput.value.trim();
        const content = contentInput.value.trim();
        const status = statusSelect.value;

        if (!title || !thumbnail || !excerpt || !content) {
            alert("Vui lòng nhập đầy đủ thông tin.");
            return;
        }

        const posts = getPosts();

        const newPost = {
            id: "post_" + Date.now(),
            title,
            thumbnail,
            excerpt,
            content,
            status,
            createdAt: new Date().toISOString()
        };

        posts.push(newPost);
        savePosts(posts);

        postForm.reset();
        statusSelect.value = "approved"; // mặc định lại
        renderPosts();

        alert("Đã thêm bài viết mới.");
    });

    // ====== ĐỔI TRẠNG THÁI + XOÁ BÀI ======
    postsTableBody.addEventListener("change", (e) => {
        const sel = e.target;
        if (!sel.classList.contains("post-status-select")) return;

        const row = sel.closest("tr");
        const id = row.dataset.id;
        const newStatus = sel.value;

        const posts = getPosts();
        const idx = posts.findIndex(p => p.id === id);
        if (idx === -1) return;

        posts[idx].status = newStatus;
        savePosts(posts);
        alert("Cập nhật trạng thái bài viết thành công.");
    });

    postsTableBody.addEventListener("click", (e) => {
        const btn = e.target;
        if (!btn.classList.contains("btn-delete-post")) return;

        const row = btn.closest("tr");
        const id = row.dataset.id;

        if (!confirm("Bạn chắc chắn muốn xoá bài viết này?")) return;

        let posts = getPosts();
        posts = posts.filter(p => p.id !== id);
        savePosts(posts);
        renderPosts();
    });

    // ====== QUAY LẠI TRANG ADMIN USERS ======
    btnBackUsers.addEventListener("click", () => {
        window.location.href = "admin.html";
    });

    // KHỞI TẠO
    renderPosts();
});
