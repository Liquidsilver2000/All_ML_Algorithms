/**
 * ML Algorithm Guide - Main JavaScript
 * Handles particles, scroll animations, filters, decision tree, and interactivity
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    initParticleCanvas();
    initScrollProgress();
    initNavigation();
    initScrollReveal();
    initSideNav();
    initMobileMenu();
    initAlgoCards();
    initFilters();
    initSearch();
    initDecisionTree();
    initStatCounters();
    initFloatingElements();
});

/* ============================================
   PARTICLE CANVAS
   ============================================ */
function initParticleCanvas() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;
    let mouse = { x: null, y: null };
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

    // Resize canvas
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Particle class
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 2 + 1;
            this.baseX = this.x;
            this.baseY = this.y;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

            // Mouse interaction (desktop only)
            if (!isTouchDevice && mouse.x !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDist = 150;

                if (distance < maxDist) {
                    const force = (maxDist - distance) / maxDist;
                    this.vx -= (dx / distance) * force * 0.02;
                    this.vy -= (dy / distance) * force * 0.02;
                }
            }

            // Damping
            this.vx *= 0.99;
            this.vy *= 0.99;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(6, 182, 212, 0.5)';
            ctx.fill();
        }
    }

    // Create particles - fewer on mobile
    const particleCount = isTouchDevice ? 30 : 60;
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    // Draw connections
    function drawConnections() {
        const maxDist = 120;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < maxDist) {
                    const opacity = (1 - dist / maxDist) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(6, 182, 212, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        drawConnections();
        animationId = requestAnimationFrame(animate);
    }
    animate();

    // Mouse tracking
    if (!isTouchDevice) {
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });
    }

    // Cleanup on visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            animate();
        }
    });
}

/* ============================================
   SCROLL PROGRESS BAR
   ============================================ */
function initScrollProgress() {
    const progressBar = document.getElementById('scrollProgress');
    if (!progressBar) return;

    function updateProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        progressBar.style.width = `${progress}%`;
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
}

/* ============================================
   NAVIGATION
   ============================================ */
function initNavigation() {
    const nav = document.getElementById('mainNav');
    if (!nav) return;

    function handleScroll() {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Smooth scroll for nav links
    document.querySelectorAll('.nav-link, .side-dot').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offset = 80;
                    const top = target.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top, behavior: 'smooth' });
                }

                // Close mobile menu
                const navLinks = document.getElementById('navLinks');
                const mobileBtn = document.getElementById('mobileMenuBtn');
                if (navLinks) navLinks.classList.remove('active');
                if (mobileBtn) mobileBtn.classList.remove('active');
            }
        });
    });
}

/* ============================================
   SCROLL REVEAL ANIMATIONS
   ============================================ */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('[data-reveal]');
    if (!revealElements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add stagger delay based on element index within parent
                const siblings = Array.from(entry.target.parentElement?.children || []);
                const siblingIndex = siblings.indexOf(entry.target);
                entry.target.style.transitionDelay = `${siblingIndex * 0.08}s`;
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
}

/* ============================================
   SIDE NAVIGATION ACTIVE STATE
   ============================================ */
function initSideNav() {
    const sections = document.querySelectorAll('section[id]');
    const dots = document.querySelectorAll('.side-dot');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!sections.length) return;

    function updateActive() {
        const scrollPos = window.scrollY + 200;

        sections.forEach((section, index) => {
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;

            if (scrollPos >= top && scrollPos < bottom) {
                const id = section.getAttribute('id');

                // Update side dots
                dots.forEach(dot => {
                    dot.classList.toggle('active', dot.getAttribute('href') === `#${id}`);
                });

                // Update nav links
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }

    window.addEventListener('scroll', updateActive, { passive: true });
}

/* ============================================
   MOBILE MENU
   ============================================ */
function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    if (!btn || !navLinks) return;

    btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
}

/* ============================================
   ALGORITHM CARDS EXPAND/COLLAPSE
   ============================================ */
function initAlgoCards() {
    const cards = document.querySelectorAll('.algo-detail-card');

    cards.forEach(card => {
        const header = card.querySelector('.algo-card-header');
        if (!header) return;

        header.addEventListener('click', () => {
            // Close other cards
            cards.forEach(c => {
                if (c !== card) c.classList.remove('expanded');
            });
            // Toggle current card
            card.classList.toggle('expanded');
        });
    });
}

/* ============================================
   FILTERS
   ============================================ */
function initFilters() {
    // Decision grid category filter
    const filterBtns = document.querySelectorAll('.filter-btn');
    const categories = document.querySelectorAll('.grid-category');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;

            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Filter categories
            categories.forEach(cat => {
                if (filter === 'all' || cat.dataset.category === filter) {
                    cat.classList.remove('hidden');
                } else {
                    cat.classList.add('hidden');
                }
            });
        });
    });

    // Goal filter for algorithm cards
    const goalBtns = document.querySelectorAll('.goal-filter-btn');
    const algoCards = document.querySelectorAll('.algo-detail-card');

    goalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const goal = btn.dataset.goal;

            goalBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            algoCards.forEach(card => {
                const cardGoals = card.dataset.goal || '';
                if (goal === 'all' || cardGoals.includes(goal)) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
}

/* ============================================
   SEARCH
   ============================================ */
function initSearch() {
    const searchInput = document.getElementById('algoSearch');
    if (!searchInput) return;

    const algoCards = document.querySelectorAll('.algo-detail-card');

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        algoCards.forEach(card => {
            const name = card.dataset.name || '';
            const title = card.querySelector('h3')?.textContent.toLowerCase() || '';

            if (!query || name.includes(query) || title.includes(query)) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    });
}

/* ============================================
   DECISION TREE
   ============================================ */
function initDecisionTree() {
    const container = document.getElementById('decisionTreeContainer');
    if (!container) return;

    // Option buttons - navigate to next level or show result
    container.querySelectorAll('.tree-option[data-next]').forEach(btn => {
        btn.addEventListener('click', () => {
            const nextId = btn.dataset.next;
            const nextLevel = document.getElementById(nextId);

            if (nextLevel) {
                // Hide all level 2s
                container.querySelectorAll('.tree-level-2').forEach(l => l.classList.remove('active'));
                // Show target
                nextLevel.classList.add('active');
                // Hide level 1
                container.querySelector('.tree-level-1').classList.remove('active');
            }
        });
    });

    // Option buttons that show results
    container.querySelectorAll('.tree-option[data-result]').forEach(btn => {
        btn.addEventListener('click', () => {
            const resultId = btn.dataset.result;
            const resultEl = document.getElementById(resultId);

            if (resultEl) {
                // Hide all levels
                container.querySelectorAll('.tree-level').forEach(l => l.classList.remove('active'));
                // Hide all results
                container.querySelectorAll('.tree-result').forEach(r => r.classList.remove('active'));
                // Show result
                resultEl.classList.add('active');
            }
        });
    });

    // Back buttons
    container.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Hide all level 2s
            container.querySelectorAll('.tree-level-2').forEach(l => l.classList.remove('active'));
            // Show level 1
            container.querySelector('.tree-level-1').classList.add('active');
        });
    });

    // Restart buttons
    container.querySelectorAll('.restart-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Hide all results
            container.querySelectorAll('.tree-result').forEach(r => r.classList.remove('active'));
            // Hide all level 2s
            container.querySelectorAll('.tree-level-2').forEach(l => l.classList.remove('active'));
            // Show level 1
            container.querySelector('.tree-level-1').classList.add('active');
        });
    });
}

/* ============================================
   STAT COUNTERS
   ============================================ */
function initStatCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count);
                animateCounter(el, target);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el, target) {
    const duration = 2000;
    const start = performance.now();

    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);

        el.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = target;
        }
    }

    requestAnimationFrame(update);
}

/* ============================================
   FLOATING ELEMENTS PARALLAX
   ============================================ */
function initFloatingElements() {
    const floatingEls = document.querySelectorAll('.float-el');
    if (!floatingEls.length) return;

    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return; // Skip on mobile

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        floatingEls.forEach(el => {
            const speed = parseFloat(el.dataset.speed) || 0.5;
            const y = scrollY * speed * 0.3;
            el.style.transform = `translateY(${y}px)`;
        });
    }, { passive: true });
}
