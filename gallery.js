// gallery.js
document.addEventListener('DOMContentLoaded', () => {
    // ====== HÀM ĐỌC / GHI ALBUM, MEDIA ======
    function getAlbums() {
        return JSON.parse(localStorage.getItem('albums')) || [];
    }

    function saveAlbums(albums) {
        localStorage.setItem('albums', JSON.stringify(albums));
    }

    function getMedia() {
        return JSON.parse(localStorage.getItem('media')) || [];
    }

    function saveMedia(media) {
        localStorage.setItem('media', JSON.stringify(media));
    }

    // ====== SEED DỮ LIỆU MẪU NẾU CHƯA CÓ ======
    function initAlbumsAndMedia() {
        const existingAlbums = getAlbums();
        const existingMedia = getMedia();

        if (existingAlbums.length > 0 || existingMedia.length > 0) {
            // đã có dữ liệu rồi thì không tạo lại (tránh mất dữ liệu)
            return;
        }

        const now = new Date().toISOString();

        const albums = [
            {
                id: 'alb_1',
                name: 'Phong cảnh thiên nhiên',
                description: 'Những khung cảnh thiên nhiên hùng vĩ và yên bình.',
                coverUrl: 'https://images.pexels.com/photos/460197/pexels-photo-460197.jpeg',
                createdAt: now,
                createdBy: 'system',
                isActive: true
            },
            {
                id: 'alb_2',
                name: 'Chân dung đường phố',
                description: 'Khoảnh khắc con người trong đời sống thường nhật.',
                coverUrl: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg',
                createdAt: now,
                createdBy: 'system',
                isActive: true
            },
            {
                id: 'alb_3',
                name: 'Đêm & ánh sáng',
                description: 'Thử nghiệm ánh sáng trong bóng tối.',
                coverUrl: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg',
                createdAt: now,
                createdBy: 'system',
                isActive: true
            }
        ];

        const media = [
            // Album 1
            {
                id: 'img_1',
                albumId: 'alb_1',
                title: 'Đỉnh núi trong sương',
                url: 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg',
                views: 0,
                likedBy: [],
                createdAt: now,
                createdBy: 'system',
                isActive: true
            },
            {
                id: 'img_2',
                albumId: 'alb_1',
                title: 'Rừng thông buổi sáng',
                url: 'https://images.pexels.com/photos/552785/pexels-photo-552785.jpeg',
                views: 0,
                likedBy: [],
                createdAt: now,
                createdBy: 'system',
                isActive: true
            },
            // Album 2
            {
                id: 'img_3',
                albumId: 'alb_2',
                title: 'Người lạ nơi góc phố',
                url: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg',
                views: 0,
                likedBy: [],
                createdAt: now,
                createdBy: 'system',
                isActive: true
            },
            // Album 3
            {
                id: 'img_4',
                albumId: 'alb_3',
                title: 'Ánh đèn thành phố',
                url: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg',
                views: 0,
                likedBy: [],
                createdAt: now,
                createdBy: 'system',
                isActive: true
            }
        ];

        saveAlbums(albums);
        saveMedia(media);
    }

    // ====== RENDER SLIDER "ALBUM MỚI" ======
    function renderNewAlbums() {
        const carousel = document.getElementById('photo-carousel');
        if (!carousel) return; // không phải trang index thì thoát

        const track = carousel.querySelector('.carousel-track');
        if (!track) return;

        const albums = getAlbums()
            .filter(a => a.isActive)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        // có thể .slice(0, 8) nếu muốn giới hạn 8 album

        if (!albums.length) {
            track.innerHTML = '<p>Chưa có album nào.</p>';
            return;
        }

        track.innerHTML = albums.map(a => `
            <article class="card" data-album-id="${a.id}">
                <img src="${a.coverUrl}" alt="${a.name}">
                <h3>${a.name}</h3>
                <p>${a.description}</p>
            </article>
        `).join('');
    }

    // ====== DEBUG (có thể xoá nếu thấy vướng console) ======
    function debugPrint() {
        console.log('Albums:', getAlbums());
        console.log('Media:', getMedia());
    }

    // ====== CLICK VÀO ALBUM CARD -> SANG TRANG CHI TIẾT ======
    function setupAlbumCardClicks() {
        const carousel = document.getElementById('photo-carousel');
        if (!carousel) return;

        carousel.addEventListener('click', (e) => {
            const card = e.target.closest('.card');
            if (!card) return;

            const albumId = card.dataset.albumId;
            if (!albumId) return;

            // Chuyển sang trang chi tiết album
            window.location.href = `album-detail.html?id=${encodeURIComponent(albumId)}`;
        });
    }


    // KHỞI TẠO
    initAlbumsAndMedia();
    renderNewAlbums();
    setupAlbumCardClicks();
    debugPrint();
});
