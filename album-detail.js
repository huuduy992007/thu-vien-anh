// album-detail.js
document.addEventListener('DOMContentLoaded', () => {
    const headerEl = document.getElementById('album-header');
    const photosEl = document.getElementById('album-photos');

    // ===== HÀM ĐỌC / GHI TỪ localStorage =====
    function getAlbums() {
        return JSON.parse(localStorage.getItem('albums')) || [];
    }

    function getMedia() {
        return JSON.parse(localStorage.getItem('media')) || [];
    }

    function saveMedia(media) {
        localStorage.setItem('media', JSON.stringify(media));
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

    // ===== LẤY ID ALBUM TỪ URL =====
    const params = new URLSearchParams(window.location.search);
    const albumId = params.get('id');

    if (!albumId) {
        headerEl.innerHTML = '<p>Không tìm thấy album.</p>';
        return;
    }

    const albums = getAlbums();
    const media = getMedia();

    const album = albums.find(a => a.id === albumId);
    if (!album) {
        headerEl.innerHTML = '<p>Album không tồn tại.</p>';
        return;
    }

    // ===== RENDER HEADER ALBUM =====
    function renderAlbumHeader() {
        const createdDate = album.createdAt
            ? new Date(album.createdAt).toLocaleDateString('vi-VN')
            : '';

        headerEl.innerHTML = `
            <div class="album-header-card">
                <div class="album-cover">
                    <img src="${album.coverUrl}" alt="${album.name}">
                </div>
                <div class="album-info">
                    <h1>${album.name}</h1>
                    ${createdDate ? `<p class="album-meta">Tạo ngày ${createdDate}</p>` : ''}
                    <p>${album.description || ''}</p>
                    <a href="index.html#content" class="back-link">← Về trang chủ</a>
                </div>
            </div>
        `;
    }

    // ===== RENDER DANH SÁCH ẢNH =====
    function renderPhotos() {
        const photos = getMedia().filter(
            p => p.albumId === albumId && p.isActive !== false
        );

        if (!photos.length) {
            photosEl.innerHTML = '<p>Chưa có ảnh nào trong album này.</p>';
            return;
        }

        photosEl.innerHTML = photos.map(p => {
            const likedBy = p.likedBy || [];
            const liked = currentUser ? likedBy.includes(currentUser.email) : false;
            const likeCount = likedBy.length;
            const views = p.views || 0;

            return `
                <article class="photo-card" data-photo-id="${p.id}">
                    <div class="photo-thumb" data-photo-id="${p.id}">
                        <img src="${p.url}" alt="${p.title}">
                    </div>
                    <div class="photo-info">
                        <h3>${p.title}</h3>
                        <div class="photo-stats">
                            <button class="like-btn ${liked ? 'liked' : ''}">
                                ❤ <span class="like-count">${likeCount}</span>
                            </button>
                            <span class="view-count">${views} lượt xem</span>
                        </div>
                    </div>
                </article>
            `;
        }).join('');
    }

    // ===== XỬ LÝ VIEW (CLICK VÀO ẢNH) =====
    photosEl.addEventListener('click', (e) => {
        const thumb = e.target.closest('.photo-thumb');
        if (!thumb) return;

        const photoId = thumb.dataset.photoId;
        if (!photoId) return;

        const allMedia = getMedia();
        const idx = allMedia.findIndex(p => p.id === photoId);
        if (idx === -1) return;

        allMedia[idx].views = (allMedia[idx].views || 0) + 1;
        saveMedia(allMedia);
        renderPhotos(); // render lại để cập nhật số view
    });

    // ===== XỬ LÝ LIKE (1 USER / ẢNH) =====
    photosEl.addEventListener('click', (e) => {
        const btn = e.target.closest('.like-btn');
        if (!btn) return;

        if (!currentUser || !currentUser.email) {
            alert('Vui lòng đăng nhập để thích ảnh.');
            return;
        }

        const card = btn.closest('.photo-card');
        const photoId = card.dataset.photoId;

        const allMedia = getMedia();
        const idx = allMedia.findIndex(p => p.id === photoId);
        if (idx === -1) return;

        const likedBy = allMedia[idx].likedBy || [];
        const userEmail = currentUser.email;

        const hasLiked = likedBy.includes(userEmail);

        if (hasLiked) {
            // Bỏ like
            allMedia[idx].likedBy = likedBy.filter(e => e !== userEmail);
        } else {
            // Like mới
            allMedia[idx].likedBy = [...likedBy, userEmail];
        }

        saveMedia(allMedia);
        renderPhotos(); // cập nhật trạng thái nút + số like
    });

    // KHỞI TẠO
    renderAlbumHeader();
    renderPhotos();
});
