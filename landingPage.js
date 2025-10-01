document.addEventListener('DOMContentLoaded', function() {
    
    // --- SMOOTH SCROLLING ---
    // Handles smooth scroll and accounts for the fixed header height.
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerHeight = 72; // Height of the fixed header
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Close mobile menu if open after clicking a link
                const mobileMenu = document.getElementById('mobile-menu');
                const mobileMenuBtn = document.getElementById('mobile-menu-btn');
                if (!mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                    mobileMenuBtn.innerHTML = '☰';
                }
            }
        });
    });

    // --- NEWSLETTER FORM ---
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            
            // Basic email validation
            if (emailInput.value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
                alert('Thank you for subscribing!');
                emailInput.value = '';
            } else {
                alert('Please enter a valid email address.');
            }
        });
    }
    
    // --- INTERACTIVE ALERTS (Quiz and Sample Buttons) ---
    document.querySelectorAll('.js-quiz-trigger').forEach(button => {
        button.addEventListener('click', e => {
            e.preventDefault();
            alert('Pet matching quiz coming soon!');
        });
    });
    
    document.querySelectorAll('.js-sample-trigger').forEach(button => {
        button.addEventListener('click', e => {
            e.preventDefault();
            alert('Sample results feature coming soon!');
        });
    });

    // --- HEADER SCROLL EFFECT ---
    // Changes header background on scroll for a nice visual touch.
    const header = document.getElementById('page-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('bg-white/95', 'backdrop-blur-sm');
        } else {
            header.classList.remove('bg-white/95', 'backdrop-blur-sm');
        }
    });

    // --- FADE-IN ANIMATION ON SCROLL ---
    // Uses Intersection Observer for better performance.
    const animatedElements = document.querySelectorAll('.js-animate-on-scroll');
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        animatedElements.forEach(el => {
            el.classList.add('fade-in-element'); // Add class to apply initial styles via CSS
            observer.observe(el);
        });

        // Add required CSS for the fade-in animation to the head
        const style = document.createElement('style');
        style.innerHTML = `
            .fade-in-element {
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.6s ease-out, transform 0.6s ease-out;
            }
            .fade-in-element.is-visible {
                opacity: 1;
                transform: translateY(0);
            }
        `;
        document.head.appendChild(style);
    }
    
    // --- MOBILE MENU TOGGLE ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            // Change button text for better UX
            if (mobileMenu.classList.contains('hidden')) {
                mobileMenuBtn.innerHTML = '☰';
            } else {
                mobileMenuBtn.innerHTML = '✕';
            }
        });
    }

    // --- PAGE LOAD FADE-IN ---
    // Simple fade-in effect for the whole page on load.
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in-out';
        document.body.style.opacity = '1';
    }, 100);
});