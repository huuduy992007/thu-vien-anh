// post-detail.js
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('post-detail');
    if (!container) return;

    // Lấy id bài viết từ query ?id=...
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        container.innerHTML = '<p>Không tìm thấy ID bài viết.</p>';
        return;
    }

    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    const post = posts.find(p => p.id === id);

    if (!post) {
        container.innerHTML = '<p>Bài viết không tồn tại hoặc đã bị xoá.</p>';
        return;
    }

    const createdDate = post.createdAt
        ? new Date(post.createdAt).toLocaleDateString('vi-VN')
        : '';

    container.innerHTML = `
        <article class="post-detail-card">
            <h1>${post.title}</h1>
            ${createdDate ? `<p class="post-detail-meta">Đăng ngày ${createdDate}</p>` : ''}
            <div class="post-detail-thumb">
                <img src="${post.thumbnail}" alt="${post.title}">
            </div>
            <div class="post-detail-content">
                <p>${post.content}</p>
            </div>
            <a href="index.html#blog-section" class="back-link">← Quay lại Blog</a>
        </article>
    `;
});
