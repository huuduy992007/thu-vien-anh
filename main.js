// main.js

// ====== PHẦN XỬ LÝ NAVBAR / AUTH ======
document.addEventListener('DOMContentLoaded', () => {
    const loginItem = document.getElementById('login-item');
    const registerItem = document.getElementById('register-item');
    const userGreeting = document.getElementById('user-greeting');
    const greetingLink = document.getElementById('greeting-link');
    const logoutItem = document.getElementById('logout-item');
    const logoutBtn = document.getElementById('logout-btn');
    const adminPanelItem = document.getElementById('admin-panel-item');
    const mediaAdminItem = document.getElementById('media-admin-item'); // có thể null

    // Đọc user hiện tại an toàn
    let currentUser = null;
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    } catch (e) {
        console.warn('Lỗi parse currentUser, reset về null', e);
        currentUser = null;
    }

    // Nếu có email thì thử lấy avatar lưu riêng (avatar:[email])
    if (currentUser && currentUser.email) {
        const avatarKey = 'avatar:' + currentUser.email;
        const storedAvatar = localStorage.getItem(avatarKey);
        if (storedAvatar) {
            currentUser.avatar = storedAvatar;
        }
    }

    // Helper cho nav avatar
    function getDisplayName(user) {
        if (!user) return '';
        const name = user.fullname && user.fullname.trim();
        return name || user.email || '';
    }

    function getAvatarInitial(user) {
        const displayName = getDisplayName(user);
        return displayName ? displayName.charAt(0).toUpperCase() : '?';
    }

    function buildNavAvatarHtml(user) {
        const initial = getAvatarInitial(user);
        const hasAvatar = user && user.avatar && String(user.avatar).trim();
        let cls = 'nav-avatar';
        let style = '';

        if (hasAvatar) {
            cls += ' has-image';
            style = ` style="background-image:url('${user.avatar}')"`; // base64 hoặc URL
        }

        return `<span class="${cls}"${style}>${initial}</span>`;
    }

    // Hàm set giao diện theo trạng thái
    function applyUIByAuth() {
        if (currentUser && currentUser.email) {
            // Ẩn nút đăng nhập/đăng ký
            if (loginItem) loginItem.style.display = 'none';
            if (registerItem) registerItem.style.display = 'none';

            // Hiện lời chào + avatar
            if (userGreeting) {
                userGreeting.style.display = 'block';
                const name = getDisplayName(currentUser);
                if (greetingLink) {
                    greetingLink.href = 'user-info.html';
                    greetingLink.innerHTML = `
                        ${buildNavAvatarHtml(currentUser)}
                        <span class="nav-greeting-text">Xin chào, ${name}</span>
                    `;
                }
            }

            // Hiện logout
            if (logoutItem) logoutItem.style.display = 'block';

            // Nếu là admin -> hiện Admin Panel
            if (adminPanelItem) {
                if (currentUser.role === 'admin') {
                    adminPanelItem.style.display = 'block';
                } else {
                    adminPanelItem.style.display = 'none';
                }
            }

            // Admin hoặc Editor/Staff -> hiện Quản lý Album (nếu có phần tử này)
            if (mediaAdminItem) {
                if (currentUser.role === 'admin' || currentUser.role === 'editor') {
                    mediaAdminItem.style.display = 'block';
                } else {
                    mediaAdminItem.style.display = 'none';
                }
            }
        } else {
            // Chưa đăng nhập
            if (loginItem) loginItem.style.display = 'list-item';
            if (registerItem) registerItem.style.display = 'list-item';
            if (userGreeting) userGreeting.style.display = 'none';
            if (logoutItem) logoutItem.style.display = 'none';
            if (adminPanelItem) adminPanelItem.style.display = 'none';
            if (mediaAdminItem) mediaAdminItem.style.display = 'none';
        }
    }

    applyUIByAuth();

    // Đăng xuất: xóa currentUser và về trang login
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    }
});

// ====== PHẦN SLIDER / CAROUSEL / BÀI VIẾT ======
document.addEventListener("DOMContentLoaded", () => {
    /* ================= SLIDER 3 ẢNH ================= */
    const slider = document.getElementById("hero-slider");
    if (slider) {
        const slidesContainer = slider.querySelector(".slides");
        const slides = slider.querySelectorAll(".slide");
        const dots = slider.querySelectorAll(".dot");
        const prevBtn = slider.querySelector(".slider-btn.prev");
        const nextBtn = slider.querySelector(".slider-btn.next");

        let currentIndex = 0;
        const totalSlides = slides.length;
        const intervalTime = 4000; // 4s tự động
        let timer;

        function goToSlide(index) {
            currentIndex = (index + totalSlides) % totalSlides;
            const offset = -currentIndex * 100;
            slidesContainer.style.transform = `translateX(${offset}%)`;

            dots.forEach(dot => dot.classList.remove("active"));
            dots[currentIndex].classList.add("active");
        }

        function nextSlide() {
            goToSlide(currentIndex + 1);
        }

        function prevSlideHandler() {
            goToSlide(currentIndex - 1);
        }

        function startAutoPlay() {
            timer = setInterval(nextSlide, intervalTime);
        }

        function stopAutoPlay() {
            clearInterval(timer);
        }

        function resetAutoPlay() {
            stopAutoPlay();
            startAutoPlay();
        }

        // Event cho nút
        nextBtn.addEventListener("click", () => {
            nextSlide();
            resetAutoPlay();
        });

        prevBtn.addEventListener("click", () => {
            prevSlideHandler();
            resetAutoPlay();
        });

        // Event cho dots
        dots.forEach(dot => {
            dot.addEventListener("click", () => {
                const index = parseInt(dot.dataset.index, 10);
                goToSlide(index);
                resetAutoPlay();
            });
        });

        // Dừng khi hover, chạy lại khi rời chuột
        slider.addEventListener("mouseenter", stopAutoPlay);
        slider.addEventListener("mouseleave", startAutoPlay);

        // Khởi tạo
        goToSlide(0);
        startAutoPlay();
    }

    /* ================= CAROUSEL NGANG ================= */
    const carousel = document.getElementById("photo-carousel");
    if (carousel) {
        const container = carousel.querySelector(".carousel-track-container");
        const prev = carousel.querySelector(".carousel-btn.prev");
        const next = carousel.querySelector(".carousel-btn.next");

        const scrollAmount = () => container.clientWidth * 0.8; // cuộn ~80% chiều rộng

        next.addEventListener("click", () => {
            container.scrollBy({
                left: scrollAmount(),
                behavior: "smooth"
            });
        });

        prev.addEventListener("click", () => {
            container.scrollBy({
                left: -scrollAmount(),
                behavior: "smooth"
            });
        });
    }

    // ====== POSTS / BLOG KỸ THUẬT CHỤP ======
    function initPosts() {
        const existing = JSON.parse(localStorage.getItem('posts') || 'null');
        if (existing && Array.isArray(existing) && existing.length > 0) {
            // Đã có dữ liệu rồi thì không seed nữa
            return;
        }

        const seedPosts = [
            {
                id: 'post_1',
                title: 'Kỹ thuật chụp phơi sáng dài cơ bản',
                thumbnail: 'https://images.pexels.com/photos/462146/pexels-photo-462146.jpeg',
                excerpt: 'Làm quen với tripod, khẩu độ nhỏ và tốc độ màn trập chậm để tạo hiệu ứng vệt sáng ấn tượng.',
                content: 'Nội dung chi tiết sẽ hiển thị ở trang post-detail sau này...',
                status: 'approved',
                createdAt: new Date().toISOString()
            },
            {
                id: 'post_2',
                title: 'Mẹo chụp ngược sáng mà vẫn giữ được chi tiết',
                thumbnail: 'https://images.pexels.com/photos/3748221/pexels-photo-3748221.jpeg',
                excerpt: 'Sử dụng đo sáng spot, bù trừ EV và fill light để kiểm soát vùng tối khi chụp ngược sáng.',
                content: 'Nội dung chi tiết sẽ hiển thị ở trang post-detail sau này...',
                status: 'approved',
                createdAt: new Date().toISOString()
            },
            {
                id: 'post_3',
                title: 'Bố cục trong nhiếp ảnh: quy tắc 1/3',
                thumbnail: 'https://images.pexels.com/photos/1252983/pexels-photo-1252983.jpeg',
                excerpt: 'Quy tắc 1/3 giúp bức ảnh cân đối hơn bằng cách đặt chủ thể lệch khỏi trung tâm.',
                content: 'Nội dung chi tiết sẽ hiển thị ở trang post-detail sau này...',
                status: 'approved',
                createdAt: new Date().toISOString()
            }
        ];

        localStorage.setItem('posts', JSON.stringify(seedPosts));
    }

    function renderHomePosts() {
        const blogList = document.getElementById('blog-list');
        if (!blogList) {
            // Không phải trang index.html thì thoát
            return;
        }

        const posts = JSON.parse(localStorage.getItem('posts') || '[]');

        // Lọc bài đã duyệt & sắp xếp mới nhất lên trên
        const visible = posts
            .filter(p => p.status === 'approved')
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (visible.length === 0) {
            blogList.innerHTML = '<p>Chưa có bài viết kỹ thuật chụp ảnh.</p>';
            return;
        }

        blogList.innerHTML = visible.map(p => `
            <article class="blog-card">
                <div class="blog-thumb">
                    <img src="${p.thumbnail}" alt="${p.title}">
                </div>
                <div class="blog-content">
                    <h3>${p.title}</h3>
                    <p>${p.excerpt}</p>
                    <a href="post-detail.html?id=${encodeURIComponent(p.id)}" class="read-more">
                        Xem thêm
                    </a>
                </div>
            </article>
        `).join('');
    }

    // Khởi tạo dữ liệu bài viết mẫu + hiển thị lên trang chủ
    initPosts();
    renderHomePosts();
});


// ========== CHATBOT ĐƠN GIẢN ==========

document.addEventListener('DOMContentLoaded', () => {
    const widget = document.getElementById('chatbot-widget');
    const btnToggle = document.getElementById('chatbot-toggle');
    const btnClose = document.getElementById('chatbot-close');
    const form = document.getElementById('chatbot-form');
    const input = document.getElementById('chatbot-input');
    const messagesBox = document.getElementById('chatbot-messages');

    if (!widget || !form) return; // không phải trang có chatbot

    // Một vài câu trả lời mẫu
    const FAKE_BOT_RULES = [
        {
            keywords: ['xin chào', 'chào', 'hello', 'hi'],
            answer: 'Xin chào 👋 Mình là PhotoBot, bot hỗ trợ về thư viện ảnh và blog nhiếp ảnh.'
        },
        {
            keywords: ['giờ mở cửa', 'hoạt động lúc nào', 'open'],
            answer: 'Website hoạt động 24/7, bạn có thể xem album và blog bất kỳ lúc nào nhé.'
        },
        {
            keywords: ['liên hệ', 'contact', 'hỗ trợ'],
            answer: 'Hiện nhóm mình chỉ là project môn học, bạn có thể để lại góp ý ngay tại form liên hệ trên menu.'
        },
        {
            keywords: ['album', 'ảnh', 'thư viện'],
            answer: 'Bạn có thể kéo xuống phần "Album mới" để xem các album gần đây, hoặc click từng album để xem chi tiết.'
        },
        {
            keywords: ['blog', 'kỹ thuật', 'chụp ảnh'],
            answer: 'Phần Blog kỹ thuật chụp ảnh đang giới thiệu các bài viết cơ bản về bố cục, phơi sáng, chụp ngược sáng,...'
        }
    ];

    function addMessage(text, who = 'bot') {
        const div = document.createElement('div');
        div.className = `chatbot-msg ${who}`;
        div.textContent = text;
        messagesBox.appendChild(div);
        messagesBox.scrollTop = messagesBox.scrollHeight;
    }

    function getBotReply(userText) {
        const text = userText.toLowerCase();

        for (const rule of FAKE_BOT_RULES) {
            if (rule.keywords.some(k => text.includes(k))) {
                return rule.answer;
            }
        }

        return 'Mình chưa hiểu câu hỏi này 🥲 Bạn thử hỏi về: album, blog, kỹ thuật chụp, liên hệ, hoặc chào mình nhé.';
    }

    // Chào mặc định
    addMessage('Xin chào! Bạn cần hỗ trợ gì về Thư Viện Ảnh? ✨');

    // Mở/đóng widget
    btnToggle.addEventListener('click', () => {
        widget.classList.add('open');
        input.focus();
    });

    btnClose.addEventListener('click', () => {
        widget.classList.remove('open');
    });

    // Gửi tin nhắn
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        input.value = '';

        // Bot trả lời sau 400ms cho tự nhiên
        setTimeout(() => {
            const reply = getBotReply(text);
            addMessage(reply, 'bot');
        }, 400);
    });
});
