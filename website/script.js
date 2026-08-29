// ===== Paint Battle Website - JavaScript =====

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initScrollAnimations();
    initMobileMenu();
    initSmoothScroll();
    initIntersectionObserver();
    initMarbleAnimation();
    initGridEffects();
    initTypeWriter();
});

// ===== Navigation =====
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        // Add/remove scrolled class for navbar styling
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Hide navbar on scroll down, show on scroll up
        if (currentScroll <= 0) {
            navbar.style.top = '0';
        } else if (currentScroll > lastScroll && currentScroll > 100) {
            // Scrolling down
            navbar.style.top = '-100px';
        } else {
            // Scrolling up
            navbar.style.top = '0';
        }

        lastScroll = currentScroll;
    });
}

// ===== Scroll Animations =====
function initScrollAnimations() {
    const sections = document.querySelectorAll('.section');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });
}

// ===== Mobile Menu =====
function initMobileMenu() {
    // Create mobile menu button
    const navContainer = document.querySelector('.nav-container');
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.innerHTML = '<span class="hamburger"></span>';
    
    // Create mobile menu
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu';
    mobileMenu.innerHTML = `
        <ul class="mobile-nav-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#overview">Overview</a></li>
            <li><a href="#gameplay">Gameplay</a></li>
            <li><a href="#modes">Modes</a></li>
            <li><a href="#ai-coach">AI Coach</a></li>
            <li><a href="#architecture">Architecture</a></li>
            <li><a href="#play">Play</a></li>
        </ul>
    `;

    // Add to DOM
    navContainer.appendChild(mobileMenuBtn);
    document.body.appendChild(mobileMenu);

    // Toggle menu
    let menuOpen = false;
    mobileMenuBtn.addEventListener('click', function() {
        menuOpen = !menuOpen;
        mobileMenu.classList.toggle('open', menuOpen);
        mobileMenuBtn.classList.toggle('open', menuOpen);
        document.body.style.overflow = menuOpen ? 'hidden' : '';
    });

    // Close menu when clicking outside
    mobileMenu.addEventListener('click', function(e) {
        if (e.target === mobileMenu) {
            mobileMenu.classList.remove('open');
            mobileMenuBtn.classList.remove('open');
            document.body.style.overflow = '';
            menuOpen = false;
        }
    });

    // Close menu when clicking a link
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('open');
            mobileMenuBtn.classList.remove('open');
            document.body.style.overflow = '';
            menuOpen = false;
        });
    });

    // Add mobile menu styles
    const mobileStyles = document.createElement('style');
    mobileStyles.textContent = `
        .mobile-menu-btn {
            display: none;
            position: relative;
            width: 40px;
            height: 40px;
            background: transparent;
            border: none;
            cursor: pointer;
            z-index: 1001;
        }
        
        .mobile-menu-btn .hamburger {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 24px;
            height: 2px;
            background: white;
            border-radius: 2px;
            transition: 0.3s ease;
        }
        
        .mobile-menu-btn .hamburger::before,
        .mobile-menu-btn .hamburger::after {
            content: '';
            position: absolute;
            width: 24px;
            height: 2px;
            background: white;
            border-radius: 2px;
            transition: 0.3s ease;
        }
        
        .mobile-menu-btn .hamburger::before {
            top: -8px;
        }
        
        .mobile-menu-btn .hamburger::after {
            bottom: -8px;
        }
        
        .mobile-menu-btn.open .hamburger {
            background: transparent;
        }
        
        .mobile-menu-btn.open .hamburger::before {
            top: 0;
            transform: rotate(45deg);
        }
        
        .mobile-menu-btn.open .hamburger::after {
            bottom: 0;
            transform: rotate(-45deg);
        }
        
        .mobile-menu {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(10, 10, 10, 0.98);
            backdrop-filter: blur(10px);
            z-index: 1000;
            padding: 80px 2rem 2rem;
        }
        
        .mobile-menu.open {
            display: block;
        }
        
        .mobile-nav-links {
            list-style: none;
            text-align: center;
        }
        
        .mobile-nav-links li {
            margin-bottom: 1.5rem;
        }
        
        .mobile-nav-links a {
            font-family: 'Inter', sans-serif;
            font-size: 1.5rem;
            font-weight: 500;
            color: var(--text-secondary);
            transition: 0.3s ease;
        }
        
        .mobile-nav-links a:hover {
            color: var(--primary);
        }
        
        @media (max-width: 768px) {
            .mobile-menu-btn {
                display: block;
            }
            
            .nav-links {
                display: none;
            }
            
            .cta-button {
                display: none;
            }
        }
    `;
    document.head.appendChild(mobileStyles);
}

// ===== Smooth Scroll =====
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.offsetTop - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== Intersection Observer =====
function initIntersectionObserver() {
    // Animate elements on scroll
    const animateOnScroll = document.querySelectorAll('.card, .goal, .mode-card, .faction-card, .weapon-card, .service-card');
    
    const animateOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const animateObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, animateOptions);

    animateOnScroll.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        animateObserver.observe(element);
    });
}

// ===== Marble Animation =====
function initMarbleAnimation() {
    const marbles = document.querySelectorAll('.marble');
    
    marbles.forEach((marble, index) => {
        // Add styles
        marble.style.width = '40px';
        marble.style.height = '40px';
        marble.style.borderRadius = '50%';
        marble.style.position = 'absolute';
        marble.style.animation = `float ${2 + (index * 0.5)}s ease-in-out infinite`;
        
        // Set colors
        if (marble.classList.contains('red')) {
            marble.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            marble.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.5)';
            marble.style.left = '20%';
            marble.style.top = '30%';
        } else if (marble.classList.contains('blue')) {
            marble.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
            marble.style.boxShadow = '0 0 20px rgba(37, 99, 235, 0.5)';
            marble.style.left = '50%';
            marble.style.top = '10%';
        } else if (marble.classList.contains('green')) {
            marble.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            marble.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.5)';
            marble.style.left = '80%';
            marble.style.top = '40%';
        }
    });

    // Add float animation
    const floatStyle = document.createElement('style');
    floatStyle.textContent = `
        @keyframes float {
            0%, 100% {
                transform: translateY(0) rotate(0deg);
            }
            50% {
                transform: translateY(-20px) rotate(5deg);
            }
        }
    `;
    document.head.appendChild(floatStyle);
}

// ===== Grid Effects =====
function initGridEffects() {
    const tiles = document.querySelectorAll('.tile');
    
    tiles.forEach(tile => {
        // Add hover effect to grid tiles
        tile.addEventListener('mouseenter', function() {
            if (!tile.classList.contains('wall')) {
                this.style.transform = 'scale(1.05)';
                this.style.transition = 'transform 0.3s ease';
            }
        });

        tile.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });

    // Add glow effect to units on grid
    const units = document.querySelectorAll('.tile.unit');
    units.forEach(unit => {
        unit.style.transition = 'all 0.3s ease';
        
        unit.addEventListener('mouseenter', function() {
            if (this.classList.contains('red')) {
                this.style.boxShadow = '0 0 30px rgba(239, 68, 68, 0.8)';
            } else if (this.classList.contains('blue')) {
                this.style.boxShadow = '0 0 30px rgba(37, 99, 235, 0.8)';
            }
        });

        unit.addEventListener('mouseleave', function() {
            this.style.boxShadow = 'none';
        });
    });
}

// ===== Type Writer Effect =====
function initTypeWriter() {
    const heroSubtitle = document.querySelector('.hero-subtitle');
    
    if (heroSubtitle) {
        const text = heroSubtitle.textContent;
        heroSubtitle.textContent = '';
        heroSubtitle.style.opacity = '1';
        
        let i = 0;
        const typeInterval = setInterval(() => {
            if (i < text.length) {
                heroSubtitle.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typeInterval);
            }
        }, 50);
    }
}

// ===== Utility Functions =====

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ===== Parallax Effect (Optional) =====
// Add parallax effect to hero section
window.addEventListener('scroll', throttle(function() {
    const hero = document.querySelector('.hero');
    const scrolled = window.pageYOffset;
    
    if (hero && scrolled < window.innerHeight) {
        const heroContent = hero.querySelector('.hero-content');
        const heroVisual = hero.querySelector('.hero-visual');
        
        if (heroContent) {
            heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
            heroContent.style.opacity = 1 - (scrolled / window.innerHeight);
        }
        
        if (heroVisual) {
            heroVisual.style.transform = `translateY(${scrolled * 0.2}px)`;
        }
    }
}, 16));

// ===== Add loading animation =====
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
    
    // Add loaded style
    const loadedStyle = document.createElement('style');
    loadedStyle.textContent = `
        body.loaded {
            opacity: 1;
        }
        
        body {
            opacity: 0;
            transition: opacity 0.5s ease;
        }
    `;
    document.head.appendChild(loadedStyle);
});

// ===== Console Easter Egg =====
console.log('%c🎨 Paint Battle %c- Real-Time Marble Autobattler', 
    'background: linear-gradient(135deg, #2563eb, #10b981); color: white; padding: 10px 20px; font-size: 16px; font-weight: bold; border-radius: 5px 0 0 5px;',
    'background: #111827; color: #9ca3af; padding: 10px 20px; font-size: 16px; border-radius: 0 5px 5px 0;');
console.log('%cReady to battle? Visit us at https://paint-battle.com', 'color: #3b82f6; font-size: 14px;');

// ===== Export for module usage =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initNavigation,
        initScrollAnimations,
        initMobileMenu,
        initSmoothScroll,
        initIntersectionObserver,
        initMarbleAnimation,
        initGridEffects,
        initTypeWriter
    };
}
