// ==========================================
// 粒子系统 - 鼠标追踪效果
// ==========================================

class Particle {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color = this.getRandomColor();
        this.originalX = this.x;
        this.originalY = this.y;
        this.density = Math.random() * 30 + 1;
    }

    getRandomColor() {
        const colors = [
            'rgba(0, 212, 255, 0.8)',   // 科技蓝
            'rgba(124, 58, 237, 0.6)',   // 紫色
            'rgba(255, 107, 157, 0.5)',  // 粉色
            'rgba(255, 160, 122, 0.4)',  // 温馨橙
            'rgba(0, 212, 255, 0.3)',   // 浅蓝
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update(mouse) {
        // 鼠标交互
        if (mouse.x !== null && mouse.y !== null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const maxDistance = 150;
            const force = (maxDistance - distance) / maxDistance;
            const directionX = forceDirectionX * force * this.density * 0.5;
            const directionY = forceDirectionY * force * this.density * 0.5;

            if (distance < maxDistance) {
                this.x += directionX;
                this.y += directionY;
            } else {
                // 缓慢回到原始位置
                if (this.x !== this.originalX) {
                    const dx = this.x - this.originalX;
                    this.x -= dx / 20;
                }
                if (this.y !== this.originalY) {
                    const dy = this.y - this.originalY;
                    this.y -= dy / 20;
                }
            }
        }

        // 自然漂浮
        this.x += this.speedX * 0.3;
        this.y += this.speedY * 0.3;

        // 边界检测
        if (this.x < 0 || this.x > this.canvas.width) {
            this.speedX = -this.speedX;
        }
        if (this.y < 0 || this.y > this.canvas.height) {
            this.speedY = -this.speedY;
        }
    }
}

class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particle-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = {
            x: null,
            y: null,
            radius: 150
        };
        this.numberOfParticles = 100;
        this.rippleEffects = [];
        
        this.init();
        this.animate();
        this.setupEventListeners();
    }

    init() {
        this.resize();
        this.createParticles();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.numberOfParticles; i++) {
            this.particles.push(new Particle(this.canvas));
        }
    }

    connectParticles() {
        const maxDistance = 120;
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    const opacity = 1 - (distance / maxDistance);
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(0, 212, 255, ${opacity * 0.15})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }

    // 鼠标拖动时的涟漪效果
    addRipple(x, y) {
        this.rippleEffects.push({
            x: x,
            y: y,
            radius: 0,
            maxRadius: 100,
            opacity: 0.5
        });
    }

    drawRipples() {
        this.rippleEffects.forEach((ripple, index) => {
            ripple.radius += 2;
            ripple.opacity -= 0.01;

            if (ripple.opacity <= 0) {
                this.rippleEffects.splice(index, 1);
                return;
            }

            this.ctx.beginPath();
            this.ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = `rgba(0, 212, 255, ${ripple.opacity})`;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 更新和绘制粒子
        this.particles.forEach(particle => {
            particle.update(this.mouse);
            particle.draw(this.ctx);
        });

        // 连接粒子
        this.connectParticles();

        // 绘制涟漪效果
        this.drawRipples();

        // 鼠标光晕效果
        if (this.mouse.x !== null && this.mouse.y !== null) {
            const gradient = this.ctx.createRadialGradient(
                this.mouse.x, this.mouse.y, 0,
                this.mouse.x, this.mouse.y, 100
            );
            gradient.addColorStop(0, 'rgba(0, 212, 255, 0.1)');
            gradient.addColorStop(0.5, 'rgba(124, 58, 237, 0.05)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            this.ctx.beginPath();
            this.ctx.arc(this.mouse.x, this.mouse.y, 100, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        }

        requestAnimationFrame(() => this.animate());
    }

    setupEventListeners() {
        // 窗口大小改变
        window.addEventListener('resize', () => {
            this.resize();
            this.createParticles();
        });

        // 鼠标移动
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        // 鼠标离开
        window.addEventListener('mouseout', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });

        // 鼠标点击涟漪效果
        window.addEventListener('click', (e) => {
            this.addRipple(e.clientX, e.clientY);
        });

        // 触摸支持
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.mouse.x = e.touches[0].clientX;
                this.mouse.y = e.touches[0].clientY;
            }
        });

        window.addEventListener('touchend', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }
}

// ==========================================
// 导航栏滚动效果
// ==========================================

function setupNavbar() {
    const navbar = document.querySelector('.navbar');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            navbar.style.background = 'rgba(10, 14, 39, 0.95)';
            navbar.style.boxShadow = '0 5px 30px rgba(0, 0, 0, 0.3)';
        } else {
            navbar.style.background = 'rgba(10, 14, 39, 0.8)';
            navbar.style.boxShadow = 'none';
        }

        lastScrollY = currentScrollY;
    });
}

// ==========================================
// 平滑滚动
// ==========================================

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ==========================================
// 回到顶部按钮
// ==========================================

function setupBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ==========================================
// 作品筛选功能
// ==========================================

function setupWorksFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const workItems = document.querySelectorAll('.work-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 更新按钮状态
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            workItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    item.style.display = 'block';
                    item.style.animation = 'fadeIn 0.5s ease';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// ==========================================
// 滚动动画 - 元素进入视口时的动画
// ==========================================

function setupScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // 观察需要动画的元素
    const animateElements = document.querySelectorAll('.intro-card, .article-card, .work-item, .feature-item');
    
    animateElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
    });
}

// ==========================================
// 视频播放功能
// ==========================================

function setupVideoPlayer() {
    const videoPlaceholder = document.querySelector('.video-placeholder');
    
    if (videoPlaceholder) {
        videoPlaceholder.addEventListener('click', () => {
            // 这里可以添加视频播放逻辑
            // 例如：替换为实际视频或打开模态框
            alert('视频功能：请将视频文件放置在 videos/promo.mp4，并取消注释 HTML 中的 video 标签');
        });
    }
}

// ==========================================
// 加载更多文章（模拟）
// ==========================================

function setupLoadMore() {
    const loadMoreBtn = document.querySelector('.load-more-btn');
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            // 这里可以添加实际的加载更多逻辑
            loadMoreBtn.textContent = '加载中...';
            setTimeout(() => {
                loadMoreBtn.textContent = '没有更多文章了';
                loadMoreBtn.disabled = true;
                loadMoreBtn.style.opacity = '0.5';
            }, 1000);
        });
    }
}

// ==========================================
// 作品放大预览（模拟）
// ==========================================

function setupWorkZoom() {
    const zoomBtns = document.querySelectorAll('.work-zoom');
    
    zoomBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const workItem = btn.closest('.work-item');
            const img = workItem.querySelector('img');
            
            // 创建预览模态框
            const modal = document.createElement('div');
            modal.className = 'work-modal';
            modal.innerHTML = `
                <div class="work-modal-content">
                    <img src="${img.src}" alt="${img.alt}">
                    <button class="work-modal-close">&times;</button>
                </div>
            `;
            
            // 添加样式
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            
            const modalContent = modal.querySelector('.work-modal-content');
            modalContent.style.cssText = `
                position: relative;
                max-width: 90%;
                max-height: 90%;
            `;
            
            const modalImg = modal.querySelector('img');
            modalImg.style.cssText = `
                max-width: 100%;
                max-height: 90vh;
                border-radius: 10px;
                box-shadow: 0 0 50px rgba(0, 212, 255, 0.3);
            `;
            
            const closeBtn = modal.querySelector('.work-modal-close');
            closeBtn.style.cssText = `
                position: absolute;
                top: -40px;
                right: 0;
                width: 40px;
                height: 40px;
                background: transparent;
                border: 2px solid rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                color: white;
                font-size: 24px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            
            document.body.appendChild(modal);
            
            // 动画显示
            setTimeout(() => {
                modal.style.opacity = '1';
            }, 10);
            
            // 关闭模态框
            const closeModal = () => {
                modal.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(modal);
                }, 300);
            };
            
            closeBtn.addEventListener('click', closeModal);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal();
                }
            });
            
            // ESC 键关闭
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    closeModal();
                }
            }, { once: true });
        });
    });
}

// ==========================================
// 打字机效果（可选）
// ==========================================

function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// ==========================================
// 添加 CSS 动画关键帧
// ==========================================

function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// ==========================================
// 初始化
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // 初始化粒子系统
    new ParticleSystem();
    
    // 初始化其他功能
    setupNavbar();
    setupSmoothScroll();
    setupBackToTop();
    setupWorksFilter();
    setupScrollAnimations();
    setupVideoPlayer();
    setupLoadMore();
    setupWorkZoom();
    addAnimationStyles();
    
    console.log('🏠 云端栖居官网已加载完成');
    console.log('✨ 粒子追踪效果已启用');
});

// ==========================================
// 性能优化：减少动画在不可见页面时的运行
// ==========================================

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // 页面不可见时暂停动画
        document.body.style.animationPlayState = 'paused';
    } else {
        // 页面可见时恢复动画
        document.body.style.animationPlayState = 'running';
    }
});