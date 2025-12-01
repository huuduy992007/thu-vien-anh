// media-admin.js
document.addEventListener("DOMContentLoaded", () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

    // CHỈ CHO ADMIN + EDITOR/STAFF VÀO
    if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "editor")) {
        alert("Bạn cần đăng nhập với vai trò Admin hoặc Editor/Staff để truy cập trang này.");
        window.location.href = "login.html";
        return;
    }

    const btnBackHome = document.getElementById("btnBackHome");

    const albumForm = document.getElementById("albumForm");
    const albumNameInput = document.getElementById("albumName");
    const albumCoverInput = document.getElementById("albumCover");
    const albumDescInput = document.getElementById("albumDesc");
    const albumsTableBody = document.querySelector("#albumsTable tbody");

    const mediaForm = document.getElementById("mediaForm");
    const mediaAlbumSelect = document.getElementById("mediaAlbum");
    const mediaTitleInput = document.getElementById("mediaTitle");
    const mediaUrlInput = document.getElementById("mediaUrl");
    const mediaTableBody = document.querySelector("#mediaTable tbody");

    // ====== HÀM ĐỌC / GHI ALBUM, MEDIA ======
    function getAlbums() {
        return JSON.parse(localStorage.getItem("albums")) || [];
    }

    function saveAlbums(albums) {
        localStorage.setItem("albums", JSON.stringify(albums));
    }

    function getMedia() {
        return JSON.parse(localStorage.getItem("media")) || [];
    }

    function saveMedia(media) {
        localStorage.setItem("media", JSON.stringify(media));
    }

    // ====== RENDER DANH SÁCH ALBUM ======
    function renderAlbums() {
        const albums = getAlbums().sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        if (!albums.length) {
            albumsTableBody.innerHTML = `
                <tr><td colspan="4">Chưa có album nào.</td></tr>
            `;
            mediaAlbumSelect.innerHTML = '<option value="">Chưa có album</option>';
            mediaTableBody.innerHTML = `
                <tr><td colspan="5">Chưa có ảnh.</td></tr>
            `;
            return;
        }

        albumsTableBody.innerHTML = albums.map(a => {
            const createdDate = a.createdAt
                ? new Date(a.createdAt).toLocaleDateString("vi-VN")
                : "";
            return `
                <tr data-id="${a.id}">
                    <td>${a.name}</td>
                    <td>
                        <select class="album-status-select">
                            <option value="true" ${a.isActive !== false ? "selected" : ""}>Hiển thị</option>
                            <option value="false" ${a.isActive === false ? "selected" : ""}>Ẩn</option>
                        </select>
                    </td>
                    <td>${createdDate}</td>
                    <td>
                        <button class="btn-delete-album">Xóa</button>
                    </td>
                </tr>
            `;
        }).join("");

        // fill select album cho form media
        mediaAlbumSelect.innerHTML = albums.map(a => `
            <option value="${a.id}">${a.name}</option>
        `).join("");

        // sau khi render, hiển thị ảnh của album đầu tiên
        if (mediaAlbumSelect.value) {
            renderMediaForAlbum(mediaAlbumSelect.value);
        }
    }

    // ====== RENDER ẢNH THEO ALBUM ======
    function renderMediaForAlbum(albumId) {
        const allMedia = getMedia().filter(m => m.albumId === albumId);

        if (!allMedia.length) {
            mediaTableBody.innerHTML = `
                <tr><td colspan="5">Chưa có ảnh trong album này.</td></tr>
            `;
            return;
        }

        mediaTableBody.innerHTML = allMedia.map(m => {
            const views = m.views || 0;
            const likeCount = (m.likedBy || []).length;

            return `
                <tr data-id="${m.id}">
                    <td>
                        <img src="${m.url}" alt="${m.title}" style="width:80px;height:60px;object-fit:cover;border-radius:4px;">
                    </td>
                    <td>${m.title}</td>
                    <td>${views}</td>
                    <td>${likeCount}</td>
                    <td>
                        <button class="btn-delete-media">Xóa</button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    // ====== THÊM ALBUM MỚI ======
    albumForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = albumNameInput.value.trim();
        const coverUrl = albumCoverInput.value.trim();
        const desc = albumDescInput.value.trim();

        if (!name || !coverUrl) {
            alert("Vui lòng nhập tên album và URL cover.");
            return;
        }

        const albums = getAlbums();
        const newAlbum = {
            id: "alb_" + Date.now(),
            name,
            description: desc,
            coverUrl,
            createdAt: new Date().toISOString(),
            createdBy: currentUser.email,
            isActive: true
        };

        albums.push(newAlbum);
        saveAlbums(albums);

        albumForm.reset();
        renderAlbums();
        alert("Đã thêm album mới.");
    });

    // ====== ĐỔI TRẠNG THÁI + XOÁ ALBUM ======
    albumsTableBody.addEventListener("change", (e) => {
        const sel = e.target;
        if (!sel.classList.contains("album-status-select")) return;

        const row = sel.closest("tr");
        const id = row.dataset.id;
        const newActive = sel.value === "true";

        const albums = getAlbums();
        const idx = albums.findIndex(a => a.id === id);
        if (idx === -1) return;

        albums[idx].isActive = newActive;
        saveAlbums(albums);
        alert("Đã cập nhật trạng thái album.");
    });

    albumsTableBody.addEventListener("click", (e) => {
        const btn = e.target;
        if (!btn.classList.contains("btn-delete-album")) return;

        const row = btn.closest("tr");
        const id = row.dataset.id;

        if (!confirm("Xóa album sẽ xóa luôn các ảnh bên trong. Bạn chắc chứ?")) return;

        let albums = getAlbums();
        albums = albums.filter(a => a.id !== id);
        saveAlbums(albums);

        let media = getMedia();
        media = media.filter(m => m.albumId !== id);
        saveMedia(media);

        renderAlbums();
    });

    // ====== THÊM ẢNH (UPLOAD GIẢ LẬP) ======
    mediaForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const albumId = mediaAlbumSelect.value;
        const title = mediaTitleInput.value.trim();
        const url = mediaUrlInput.value.trim();

        if (!albumId) {
            alert("Vui lòng chọn album.");
            return;
        }
        if (!title || !url) {
            alert("Vui lòng nhập tiêu đề và URL ảnh.");
            return;
        }

        const allMedia = getMedia();

        const newMedia = {
            id: "img_" + Date.now(),
            albumId,
            title,
            url,
            views: 0,
            likedBy: [],
            createdAt: new Date().toISOString(),
            createdBy: currentUser.email,
            isActive: true
        };

        allMedia.push(newMedia);
        saveMedia(allMedia);

        mediaForm.reset();
        renderMediaForAlbum(albumId);
        alert("Đã thêm ảnh vào album.");
    });

    // ====== XOÁ ẢNH ======
    mediaTableBody.addEventListener("click", (e) => {
        const btn = e.target;
        if (!btn.classList.contains("btn-delete-media")) return;

        const row = btn.closest("tr");
        const id = row.dataset.id;

        if (!confirm("Bạn chắc chắn muốn xóa ảnh này?")) return;

        let media = getMedia();
        media = media.filter(m => m.id !== id);
        saveMedia(media);

        const albumId = mediaAlbumSelect.value;
        renderMediaForAlbum(albumId);
    });

    // ====== ĐỔI ALBUM TRONG COMBOBOX THÌ HIỆN ẢNH TƯƠNG ỨNG ======
    mediaAlbumSelect.addEventListener("change", () => {
        const albumId = mediaAlbumSelect.value;
        if (albumId) {
            renderMediaForAlbum(albumId);
        } else {
            mediaTableBody.innerHTML = `
                <tr><td colspan="5">Chưa có ảnh.</td></tr>
            `;
        }
    });

    // ====== NÚT VỀ TRANG CHÍNH ======
    btnBackHome.addEventListener("click", () => {
        window.location.href = "index.html";
    });

    // KHỞI TẠO
    renderAlbums();
});
