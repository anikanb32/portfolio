// Password Protection System
// (function() {
    
//     const pw = 'brain';
    
   
//     function isAuthenticated() {
//         return sessionStorage.getItem('portfolio_authenticated') === 'true';
//     }
    
   
//     function hideMainContent() {
//         const body = document.body;
//         if (body) {
//             body.style.overflow = 'hidden';
//             body.classList.add('content-hidden');
//             const header = document.querySelector('header');
//             const main = document.querySelector('main');
//             const footer = document.querySelector('footer');
//             if (header) {
//                 header.style.display = '';
//                 header.style.opacity = '0';
//             }
//             if (main) {
//                 main.style.display = '';
//                 main.style.opacity = '0';
//             }
//             if (footer) {
//                 footer.style.display = '';
//                 footer.style.opacity = '0';
//             }
//         }
//     }
    
//     // Show main content after authentication
//     function showMainContent() {
//         const body = document.body;
//         if (body) {
//             body.classList.remove('content-hidden');
//             body.style.overflow = '';
//             body.style.overflowX = 'hidden'; // Keep horizontal overflow hidden
//             body.style.overflowY = 'auto'; // Allow vertical scrolling
//             const header = document.querySelector('header');
//             const main = document.querySelector('main');
//             const footer = document.querySelector('footer');
//             if (header) {
//                 header.style.display = '';
//                 header.style.opacity = '';
//                 header.style.pointerEvents = '';
//             }
//             if (main) {
//                 main.style.display = '';
//                 main.style.opacity = '';
//                 main.style.pointerEvents = '';
//             }
//             if (footer) {
//                 footer.style.display = '';
//                 footer.style.opacity = '';
//                 footer.style.pointerEvents = '';
//             }
//         }
//     }
    
//     // Check authentication status immediately
//     if (!isAuthenticated()) {
//         hideMainContent();
//     }
    
//     // Initialize password modal when DOM is ready
//     function initPasswordModal() {
//         const passwordModal = document.getElementById('passwordModal');
//         const passwordInput = document.getElementById('passwordInput');
//         const passwordForm = document.getElementById('passwordForm');
//         const passwordError = document.getElementById('passwordError');
        
//         if (!passwordModal || !passwordInput || !passwordForm) {
//             return;
//         }
        
//         // Show modal if not authenticated
//         if (!isAuthenticated()) {
//             passwordModal.style.display = 'flex';
//             passwordInput.focus();
//         } else {
//             passwordModal.style.display = 'none';
//             showMainContent();
//         }
        
//         // Handle form submission
//         passwordForm.addEventListener('submit', function(e) {
//             e.preventDefault();
//             e.stopPropagation();
            
//             const enteredPassword = passwordInput.value.trim();
            
//             // HIDE ERROR IMMEDIATELY - BEFORE CHECKING PASSWORD
//             passwordError.classList.remove('show');
//             passwordError.style.display = 'none';
//             passwordError.style.visibility = 'hidden';
//             passwordError.style.opacity = '0';
//             passwordError.textContent = '';
//             passwordError.style.transition = 'none';
            
//             // Use requestAnimationFrame to ensure error is hidden before any rendering
//             requestAnimationFrame(function() {
//                 if (enteredPassword === pw) {
//                     // Correct password - authenticate user
//                     sessionStorage.setItem('portfolio_authenticated', 'true');
//                     passwordInput.value = '';
//                     passwordInput.removeAttribute('required');
                    
//                     // Make absolutely sure error is hidden
//                     passwordError.classList.remove('show');
//                     passwordError.style.display = 'none';
//                     passwordError.style.visibility = 'hidden';
//                     passwordError.style.opacity = '0';
//                     passwordError.textContent = '';
                    
//                     // Fade out modal and immediately disable pointer events
//                     passwordModal.classList.add('fade-out');
//                     passwordModal.style.pointerEvents = 'none';
                    
//                     // Show main content after a short delay for smooth transition
//                     setTimeout(function() {
//                         showMainContent();
//                         setTimeout(function() {
//                             passwordModal.style.display = 'none';
//                             passwordModal.classList.remove('fade-out');
//                         }, 200);
//                     }, 200);
//                 } else {
//                     // Wrong password - show error
//                     passwordError.textContent = 'Incorrect password. Please try again.';
//                     passwordError.style.transition = '';
//                     passwordError.classList.add('show');
//                     passwordError.style.display = 'flex';
//                     passwordError.style.visibility = 'visible';
//                     passwordError.style.opacity = '1';
//                     passwordInput.value = '';
//                     passwordInput.focus();
//                 }
//             });
//         });
        
//         // Prevent browser validation on input
//         passwordInput.addEventListener('invalid', function(e) {
//             e.preventDefault();
//             e.stopPropagation();
//             return false;
//         });
        
//         // Also prevent validation on form
//         passwordForm.addEventListener('invalid', function(e) {
//             e.preventDefault();
//             e.stopPropagation();
//             return false;
//         }, true);
        
//         // Clear error message when user starts typing
//         passwordInput.addEventListener('input', function() {
//             passwordError.classList.remove('show');
//             passwordError.style.display = 'none';
//             passwordError.style.visibility = 'hidden';
//             passwordError.style.opacity = '0';
//         });
        
//         // Allow Enter key to submit
//         passwordInput.addEventListener('keydown', function(e) {
//             if (e.key === 'Enter') {
//                 passwordForm.dispatchEvent(new Event('submit'));
//             }
//         });
//     }
    
//     // Initialize when DOM is ready
//     if (document.readyState === 'loading') {
//         document.addEventListener('DOMContentLoaded', initPasswordModal);
//     } else {
//         initPasswordModal();
//     }
// })();

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing navigation...');
    
    // Detect if we're on a project page and add class to body
    const projectPages = ['quantframe', 'xometry', 'neurologic', 'class', 'context-aware-vr', 'coachpro', 'noborders'];
    const pathname = window.location.pathname;
    const isProjectPage = projectPages.some(page => pathname.includes('/' + page + '/') || pathname.includes('/' + page + '.html'));
    
    if (isProjectPage) {
        document.body.classList.add('project-page');
    }
    
    // Initialize test page functionality
    initializeTestPage();
    
    // Lazy loading for images
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy-load');
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for browsers without IntersectionObserver
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.classList.remove('lazy-load');
            img.classList.add('loaded');
        });
    }
    
    // Hamburger menu functionality
    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.querySelector('.mobile-nav');
    
    if (hamburger && mobileNav) {
        hamburger.addEventListener('click', function() {
            console.log('Hamburger clicked!');
            
            if (mobileNav.classList.contains('active')) {
                // Closing the menu
                mobileNav.classList.add('closing');
                mobileNav.classList.remove('active');
                
                setTimeout(() => {
                    mobileNav.classList.remove('closing');
                    document.body.classList.remove('menu-open');
                }, 400);
            } else {
                // Opening the menu
                mobileNav.classList.add('active');
                document.body.classList.add('menu-open');
            }
            
            console.log('Mobile nav active:', mobileNav.classList.contains('active'));
            console.log('Mobile nav display:', window.getComputedStyle(mobileNav).display);
            console.log('Mobile nav z-index:', window.getComputedStyle(mobileNav).zIndex);
        });
        
        // Close mobile nav when clicking on a link (except work links which are handled separately)
        const mobileNavLinks = mobileNav.querySelectorAll('a:not([href="#work"]):not([href="../#work"])');
        console.log('Found mobile navigation links:', mobileNavLinks.length);
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', function() {
                const href = this.getAttribute('href');
                console.log('Mobile navigation link clicked:', href);
                mobileNav.classList.add('closing');
                mobileNav.classList.remove('active');
                
                setTimeout(() => {
                    mobileNav.classList.remove('closing');
                    document.body.classList.remove('menu-open');
                }, 400);
            });
        });
        
        // Close mobile nav when clicking the X button
        const mobileClose = mobileNav.querySelector('.mobile-close');
        if (mobileClose) {
            mobileClose.addEventListener('click', function() {
                // Add closing class for animation
                mobileNav.classList.add('closing');
                mobileNav.classList.remove('active');
                
                // Wait for animation to complete before hiding
                setTimeout(() => {
                    mobileNav.classList.remove('closing');
                    document.body.classList.remove('menu-open');
                }, 400); // Match the CSS transition duration
            });
        }
    }
    
    const records = document.querySelectorAll('.record');
    let currentTopZIndex = 10;
    let isAnyRecordHovered = false;
    
    records.forEach(record => {
        // Store original transform values
        const originalTransform = record.style.transform;
        const originalZIndex = record.style.zIndex;
        
        // Mouse enter event
        record.addEventListener('mouseenter', function() {
            // Set global hover state
            isAnyRecordHovered = true;
            
            // Add smooth transition with bounce
            this.style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
            
            // Rotate 360 degrees, scale up, and add glow effect
            this.style.transform = 'rotate(360deg) scale(1.15)';
            this.style.filter = 'drop-shadow(0 0 20px rgba(0, 123, 255, 0.3))';
            
            // Bring to front and increment z-index
            currentTopZIndex++;
            this.style.zIndex = currentTopZIndex;
        });
        
        // Mouse leave event
        record.addEventListener('mouseleave', function() {
            // Reset to original position but keep the higher z-index
            this.style.transform = originalTransform || 'rotate(0deg) scale(1)';
            this.style.filter = 'none';
            
            // Remove transition after animation completes
            setTimeout(() => {
                this.style.transition = '';
            }, 800);
            
            // Check if any other record is still being hovered
            setTimeout(() => {
                isAnyRecordHovered = false;
            }, 100);
        });
        
                // Click event for navigation to project pages
        record.addEventListener('click', function() {
            const project = this.getAttribute('data-project');
            console.log(`Clicked on project: ${project}`);
            
            // Navigate to the appropriate project page
            switch(project) {
                case 'quantframe':
                    window.location.href = '../quantframe/';
                    break;
                case 'class':
                    window.location.href = '../class/';
                    break;
                case 'noborders':
                    window.location.href = '../noborders/';
                    break;
                case 'coachpro':
                    window.location.href = '../coachpro/';
                    break;
                case 'xometry':
                    window.location.href = '../xometry/';
                    break;
                case 'neurologic':
                    window.location.href = '../neurologic/';
                    break;
                case 'context-aware-vr':
                    window.location.href = '../context-aware-vr/';
                    break;
                default:
                    console.log(`No navigation defined for project: ${project}`);
            }
        });
    });
    
    // Add smooth scroll for navigation links (only for internal page links)
    const navLinks = document.querySelectorAll('nav a');
    console.log('Found navigation links:', navLinks.length);
    navLinks.forEach((link, index) => {
        console.log(`Link ${index}:`, link.href, link.textContent);
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            console.log('Navigation link clicked:', href);
            
            // Only prevent default for internal page links (starting with #)
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
            // External page links (like work.html, about.html) will work normally
            console.log('Navigation proceeding to:', href);
        });
    });
    
    // Handle work link navigation to index.html#work section
    const workLinks = document.querySelectorAll('nav a[href="#work"], nav a[href="../#work"], .mobile-nav a[href="#work"], .mobile-nav a[href="../#work"]');
    
    workLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const workSection = document.getElementById('work');
            
            // If we're on index.html and work section exists, scroll to it
            if (workSection && (href === '#work' || href === '../#work')) {
                e.preventDefault();
                
                // Check if mobile (viewport width <= 768px)
                const isMobile = window.innerWidth <= 768;
                
                // Close mobile menu if open
                const mobileNav = document.querySelector('.mobile-nav');
                const isMobileMenuOpen = mobileNav && mobileNav.classList.contains('active');
                
                if (isMobileMenuOpen) {
                    mobileNav.classList.add('closing');
                    mobileNav.classList.remove('active');
                    
                    // Wait for menu animation to complete before scrolling
                    setTimeout(() => {
                        mobileNav.classList.remove('closing');
                        document.body.classList.remove('menu-open');
                        
                        // Scroll to work section after menu closes
                        // Use less offset on mobile
                        const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
                        const offset = isMobile ? 20 : 80;
                        const targetPosition = workSection.offsetTop - headerHeight - offset;
                        
                        window.scrollTo({
                            top: Math.max(0, targetPosition),
                            behavior: 'smooth'
                        });
                    }, 400);
                } else {
                    // If menu is not open, scroll immediately
                    // Use less offset on mobile
                    const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
                    const offset = isMobile ? 20 : 80;
                    const targetPosition = workSection.offsetTop - headerHeight - offset;
                    
                    window.scrollTo({
                        top: Math.max(0, targetPosition),
                        behavior: 'smooth'
                    });
                }
            } else if (href === '../#work') {
                // If we're on another page, navigate to index.html first
                e.preventDefault();
                
                // Close mobile menu if open
                const mobileNav = document.querySelector('.mobile-nav');
                if (mobileNav && mobileNav.classList.contains('active')) {
                    mobileNav.classList.add('closing');
                    mobileNav.classList.remove('active');
                    setTimeout(() => {
                        mobileNav.classList.remove('closing');
                        document.body.classList.remove('menu-open');
                    }, 400);
                }
                
                // Navigate to index.html with hash
                window.location.href = '../#work';
            }
        });
    });
    
    // Handle hash navigation to work section on page load
    if (window.location.hash === '#work') {
        // Check if mobile (viewport width <= 768px)
        const isMobile = window.innerWidth <= 768;
        
        // Wait for page to fully load
        window.addEventListener('load', function() {
            const workSection = document.getElementById('work');
            if (workSection) {
                setTimeout(() => {
                    const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
                    const offset = isMobile ? 20 : 80;
                    const targetPosition = workSection.offsetTop - headerHeight - offset;
                    
                    window.scrollTo({
                        top: Math.max(0, targetPosition),
                        behavior: 'smooth'
                    });
                }, 100);
            }
        });
        
        // Also handle if page is already loaded
        if (document.readyState === 'complete') {
            const workSection = document.getElementById('work');
            if (workSection) {
                setTimeout(() => {
                    const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
                    const offset = isMobile ? 20 : 80;
                    const targetPosition = workSection.offsetTop - headerHeight - offset;
                    
                    window.scrollTo({
                        top: Math.max(0, targetPosition),
                        behavior: 'smooth'
                    });
                }, 100);
            }
        }
    }
    
    // Page load animations
    const header = document.querySelector('.header');
    const intro = document.querySelector('.intro');
    
    // Fade in header first, then intro follows shortly after
    setTimeout(() => {
        if (header) {
            header.classList.add('loaded');
        }
    }, 300);
    
    setTimeout(() => {
        if (intro) {
            intro.classList.add('loaded');
        }
    }, 500);

    // Universal fade-in animation system
    function initFadeInAnimations() {
        // Get all elements with fade-in classes
        const fadeInElements = document.querySelectorAll('.fade-in, .fade-in-delay-1, .fade-in-delay-2, .fade-in-delay-3, .fade-in-delay-4, .fade-in-delay-5, .fade-in-delay-6');
        const staggerElements = document.querySelectorAll('.fade-in-stagger');
        
        // Animate individual fade-in elements - respect CSS transition delays
        fadeInElements.forEach((element) => {
            // Add loaded class immediately - CSS will handle the timing with transition-delay
            element.classList.add('loaded');
        });
        
        // Specifically handle the highlight quote
        const highlightQuote = document.querySelector('.about-highlight-quote');
        if (highlightQuote) {
            highlightQuote.classList.add('loaded');
        }
        
        // Animate staggered elements
        staggerElements.forEach((container, containerIndex) => {
            setTimeout(() => {
                container.classList.add('loaded');
            }, 200 + (containerIndex * 200));
        });
    }

    // Initialize fade-in animations after page load
    setTimeout(() => {
        initFadeInAnimations();
    }, 800);
    
    // Custom Cursor with Three Dots
    function initCustomCursor() {
        const cursorDot = document.getElementById('cursor-dot');
        const cursorDot2 = document.getElementById('cursor-dot-2');
        const cursorDot3 = document.getElementById('cursor-dot-3');
        
        if (!cursorDot || !cursorDot2 || !cursorDot3) {
            console.log('Cursor dots not found');
            return;
        }
        
        // Only show cursor on desktop
        if (window.innerWidth <= 768) {
            cursorDot.style.display = 'none';
            cursorDot2.style.display = 'none';
            cursorDot3.style.display = 'none';
            return;
        }
        
        // Function to update cursor colors for project pages
        function updateProjectPageCursorColors() {
            const isProjectPage = document.body.classList.contains('project-page');
            if (isProjectPage) {
                const isDarkMode = document.body.classList.contains('dark-mode');
                const cursorColor = isDarkMode ? '#ffffff' : '#000000';
                cursorDot.style.background = cursorColor;
                cursorDot2.style.background = cursorColor;
                cursorDot3.style.background = cursorColor;
            }
        }
        
        // Update cursor colors initially
        updateProjectPageCursorColors();
        
        // Watch for theme changes
        const themeObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    updateProjectPageCursorColors();
                }
            });
        });
        themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        
        // Try to get last cursor position from sessionStorage
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        
        try {
            const lastX = sessionStorage.getItem('cursorX');
            const lastY = sessionStorage.getItem('cursorY');
            if (lastX !== null && lastY !== null) {
                const x = parseFloat(lastX);
                const y = parseFloat(lastY);
                // Only use stored position if it's within viewport bounds
                if (x >= 0 && x <= window.innerWidth && y >= 0 && y <= window.innerHeight) {
                    mouseX = x;
                    mouseY = y;
                }
            }
        } catch (e) {
            // If sessionStorage is not available, use center
        }
        
        let dot2X = mouseX;
        let dot2Y = mouseY;
        let dot3X = mouseX;
        let dot3Y = mouseY;
        
        // Initialize cursor dots position and make them visible
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';
        cursorDot.style.display = 'block';
        cursorDot.style.opacity = '1';
        cursorDot.style.visibility = 'visible';
        
        cursorDot2.style.left = dot2X + 'px';
        cursorDot2.style.top = dot2Y + 'px';
        cursorDot2.style.display = 'block';
        cursorDot2.style.opacity = '0.8';
        cursorDot2.style.visibility = 'visible';
        
        cursorDot3.style.left = dot3X + 'px';
        cursorDot3.style.top = dot3Y + 'px';
        cursorDot3.style.display = 'block';
        cursorDot3.style.opacity = '0.6';
        cursorDot3.style.visibility = 'visible';
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Save position to sessionStorage
            try {
                sessionStorage.setItem('cursorX', mouseX.toString());
                sessionStorage.setItem('cursorY', mouseY.toString());
            } catch (e) {
                // If sessionStorage is not available, ignore
            }
            
            // First dot follows immediately
            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top = mouseY + 'px';
        });
        
        function animate() {
            // Smoothly interpolate position for second dot - slower catch up
            dot2X += (mouseX - dot2X) * 0.2;
            dot2Y += (mouseY - dot2Y) * 0.2;
            cursorDot2.style.left = dot2X + 'px';
            cursorDot2.style.top = dot2Y + 'px';
            
            // Smoothly interpolate position for third dot - even slower catch up
            dot3X += (mouseX - dot3X) * 0.1;
            dot3Y += (mouseY - dot3Y) * 0.1;
            cursorDot3.style.left = dot3X + 'px';
            cursorDot3.style.top = dot3Y + 'px';
            
            requestAnimationFrame(animate);
        }
        
        // Start animation loop
        animate();
    }
    
    // Initialize custom cursor when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCustomCursor);
    } else {
        initCustomCursor();
    }
    
    // Cool page load animations for records
    setTimeout(() => {
        records.forEach((record, index) => {
            // Start with records scattered and invisible
            record.style.opacity = '0';
            record.style.transform = `translateY(${100 + (index * 30)}px) rotate(${index * 45}deg) scale(0.3)`;
            
            // Ensure the first record also gets the animation
            console.log(`Setting up animation for record ${index + 1}`);
            
            setTimeout(() => {
                record.style.transition = 'all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
                record.style.opacity = '1';
                record.style.transform = 'translateY(0) rotate(0deg) scale(1)';
                
                console.log(`Animating record ${index + 1} into place`);
                
                // Add a subtle bounce effect
                setTimeout(() => {
                    record.style.transition = 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                    record.style.transform = 'translateY(-8px) scale(1.05)';
                    
                    setTimeout(() => {
                        record.style.transform = 'translateY(0) scale(1)';
                    }, 300);
                }, 1200);
            }, index * 300); // Stagger the entrance (including first record)
        });
    }, 1200);

    // Cool floating animation every few seconds
    function startFloatingAnimation() {
        // Don't animate if any record is being hovered
        if (isAnyRecordHovered) {
            return;
        }

        records.forEach((record, index) => {
            setTimeout(() => {
                // Double-check that no record is being hovered
                if (!isAnyRecordHovered) {
                    record.style.transition = 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
                    
                    // Create a gentle floating motion with slight rotation
                    const floatY = Math.sin(Date.now() * 0.001 + index) * 8;
                    const floatRotate = Math.sin(Date.now() * 0.0005 + index) * 2;
                    record.style.transform = `translateY(${floatY}px) rotate(${floatRotate}deg)`;
                    
                    setTimeout(() => {
                        if (!isAnyRecordHovered) {
                            record.style.transform = 'translateY(0) rotate(0deg)';
                        }
                    }, 1200);
                }
            }, index * 200); // Stagger the floating effect
        });
    }

    // Start the floating animation after initial load
    setTimeout(() => {
        // Run floating animation every 3 seconds
        setInterval(startFloatingAnimation, 3000);
    }, 3000);

    // Theme Toggle Functionality
    const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
    const body = document.body;
    
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        themeToggleBtns.forEach(btn => btn.classList.add('dark'));
    }
    
    function toggleTheme() {
        // Toggle dark mode
        body.classList.toggle('dark-mode');
        themeToggleBtns.forEach(btn => btn.classList.toggle('dark'));
        
        // Save preference to localStorage
        const isDark = body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        // Add a cute animation effect
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);
    }
    
    themeToggleBtns.forEach(btn => {
        btn.addEventListener('click', toggleTheme);
    });

    // Back to top button functionality
    const backToTopButton = document.getElementById('backToTop');
    
    if (backToTopButton) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        });
        
        // Smooth scroll to top when clicked
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

}); 

// Loading Screen Logic
(function() {
  // Detect theme: prefer site setting, then system, default to light
  function getTheme() {
    var stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  }
  var theme = getTheme();

  // Check if we're using styles_test.css
  var isTestStyles = document.querySelector('link[href*="styles_test.css"]') !== null;
  
  // Function to create and show loader
  function createLoader() {
    var loader = document.createElement('div');
    loader.className = 'loading-overlay';
    loader.setAttribute('data-theme', theme);
    loader.style.display = 'flex'; // Ensure it's visible
    loader.style.opacity = '1';
    loader.style.visibility = 'visible';
    
    // Use three animated dots for loading screen
    loader.innerHTML = `
      <div class="loading-dots">
        <div class="loading-dot" style="background: #903232;"></div>
        <div class="loading-dot" style="background: #C94949;"></div>
        <div class="loading-dot" style="background: #DE7E7E;"></div>
      </div>
    `;
    return loader;
  }
  
  // Loader HTML - create immediately to show loading screen right away
  var loader = createLoader();
  
  // Function to show loading screen
  function showLoader() {
    // Remove any existing loader first
    var existingLoader = document.querySelector('.loading-overlay');
    if (existingLoader) {
      existingLoader.remove();
    }
    
    // Create and show new loader
    loader = createLoader();
    // Ensure it's on top and visible
    loader.style.zIndex = '99999';
    loader.style.position = 'fixed';
    
    if (document.body) {
      document.body.appendChild(loader);
      // Force immediate visibility
      loader.style.display = 'flex';
      loader.style.opacity = '1';
      loader.style.visibility = 'visible';
    } else {
      // If body doesn't exist, append to documentElement as fallback
      if (document.documentElement) {
        document.documentElement.appendChild(loader);
        loader.style.display = 'flex';
        loader.style.opacity = '1';
        loader.style.visibility = 'visible';
      }
      // Also wait for body
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
          if (document.body && !document.body.querySelector('.loading-overlay')) {
            if (loader.parentNode) loader.parentNode.removeChild(loader);
            document.body.appendChild(loader);
            loader.style.display = 'flex';
            loader.style.opacity = '1';
            loader.style.visibility = 'visible';
          }
        });
      }
    }
  }
  
  // Insert loader immediately, even before DOM is ready
  if (document.body) {
    document.body.appendChild(loader);
  } else {
    // If body doesn't exist yet, wait for it
    document.addEventListener('DOMContentLoaded', function() {
      if (!document.body.querySelector('.loading-overlay')) {
        document.body.appendChild(loader);
      }
    });
    // Also try to append immediately if body becomes available
    if (document.readyState === 'loading') {
      var checkBody = setInterval(function() {
        if (document.body) {
          document.body.appendChild(loader);
          clearInterval(checkBody);
        }
      }, 10);
    }
  }
  
  // Intercept navigation links to show loading screen before navigation
  function interceptNavigation() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', interceptNavigation);
      return;
    }
    
    // Get all navigation links (logo, nav links, work items, etc.)
    var navLinks = document.querySelectorAll('a[href]');
    
    navLinks.forEach(function(link) {
      var href = link.getAttribute('href');
      // Only intercept internal navigation links (not anchors, mailto, or external)
      if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('http') && !href.startsWith('//')) {
        link.addEventListener('click', function(e) {
          // Don't intercept if it's already handled (like work links with special handling)
          if (this.hasAttribute('data-no-loader')) {
            return;
          }
          
          // Show loading screen immediately before navigation
          showLoader();
          
          // Allow navigation to proceed normally
          // The loading screen will persist until the new page loads
        }, true); // Use capture phase to ensure it fires before other handlers
      }
    });
    
    // Also intercept clicks on elements that navigate programmatically (like record clicks)
    document.addEventListener('click', function(e) {
      var target = e.target.closest('[data-project]');
      if (target && target.hasAttribute('data-project')) {
        // This is likely a work item or record that will navigate
        // Show loader immediately
        showLoader();
      }
    }, true);
  }
  
  // Start intercepting navigation
  interceptNavigation();
  
  // Also show loader when page is about to unload (catches programmatic navigation)
  window.addEventListener('beforeunload', function() {
    showLoader();
  });

  // Hide loader when page is ready
  function hideLoader() {
    if (loader && loader.parentNode) {
      loader.classList.add('hidden');
      setTimeout(function() {
        if (loader.parentNode) loader.parentNode.removeChild(loader);
      }, 400);
    }
  }
  
  // Ensure loading screen shows for minimum duration
  var minLoadTime = 800; // 800ms minimum to ensure it's visible
  var startTime = Date.now();
  
  function checkAndHideLoader() {
    var elapsed = Date.now() - startTime;
    if (elapsed >= minLoadTime) {
      hideLoader();
    } else {
      setTimeout(checkAndHideLoader, minLoadTime - elapsed);
    }
  }
  
  // Always wait for load event to ensure everything is ready
  if (document.readyState === 'complete') {
    // Page already loaded, but still show loader for minimum time
    checkAndHideLoader();
  } else {
    window.addEventListener('load', checkAndHideLoader);
    // Also check if DOM is ready
    if (document.readyState === 'interactive') {
      // DOM is ready, but wait for full load
      window.addEventListener('load', checkAndHideLoader);
    }
  }

  // Ensure default theme is light if not set
  if (!localStorage.getItem('theme')) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})(); 

// Custom Cursor: 3 trailing dots (danielgamble.com.au style, forest green) - COMMENTED OUT
// (function() {
//   if (window.matchMedia('(pointer: fine)').matches) {
//     // Main cursor dot
//     var mainDot = document.createElement('div');
//     mainDot.style.position = 'fixed';
//     mainDot.style.width = mainDot.style.height = '28px';
//     mainDot.style.background = 'rgba(21,112,91,0.7)';
//     mainDot.style.borderRadius = '50%';
//     mainDot.style.pointerEvents = 'none';
//     mainDot.style.zIndex = '10000';
//     mainDot.style.transform = 'translate(-50%, -50%)';
//     mainDot.style.transition = 'opacity 0.2s, background 0.3s';
//     mainDot.style.opacity = '0';
//     document.body.appendChild(mainDot);

//     // Trailing dots
//     var trail1 = document.createElement('div');
//     var trail2 = document.createElement('div');
//     [trail1, trail2].forEach(function(dot, i) {
//       dot.style.position = 'fixed';
//       dot.style.width = dot.style.height = (i === 0 ? '20px' : '14px');
//       dot.style.background = i === 0 ? 'rgba(21,112,91,0.45)' : 'rgba(21,112,91,0.28)';
//       dot.style.borderRadius = '50%';
//       dot.style.pointerEvents = 'none';
//       dot.style.zIndex = '9999';
//       dot.style.transform = 'translate(-50%, -50%)';
//       dot.style.transition = 'opacity 0.2s, background 0.3s';
//       dot.style.opacity = '0';
//       document.body.appendChild(dot);
//     });

//     // Colors
//     var normal = [
//       'rgba(21,112,91,0.7)',
//       'rgba(21,112,91,0.45)',
//       'rgba(21,112,91,0.28)'
//     ];
//     var dark = [
//       'rgba(16,85,73,0.7)',
//       'rgba(16,85,73,0.45)',
//       'rgba(16,85,73,0.28)'
//     ];

//     // Link hover color change
//     document.querySelectorAll('a').forEach(link => {
//       link.addEventListener('mouseenter', function() {
//         mainDot.style.background = dark[0];
//         trail1.style.background = dark[1];
//         trail2.style.background = dark[2];
//       });
//       link.addEventListener('mouseleave', function() {
//         mainDot.style.background = normal[0];
//         trail1.style.background = normal[1];
//         trail2.style.background = normal[2];
//       });
//     });

//     // Physics variables
//     var mouse = { x: window.innerWidth/2, y: window.innerHeight/2 };
//     var pos = { x: mouse.x, y: mouse.y };
//     var t1 = { x: mouse.x, y: mouse.y };
//     var t2 = { x: mouse.x, y: mouse.y };

//     // Show/hide on enter/leave
//     document.addEventListener('mouseenter', function() {
//       if (mainDot && trail1 && trail2) {
//         mainDot.style.opacity = '1';
//         trail1.style.opacity = '1';
//         trail2.style.opacity = '1';
//       }
//     });
//     document.addEventListener('mouseleave', function() {
//       if (mainDot && trail1 && trail2) {
//         mainDot.style.opacity = '0';
//         trail1.style.opacity = '0';
//         trail2.style.opacity = '0';
//       }
//     });

//     // Mouse move
//     document.addEventListener('mousemove', function(e) {
//       mouse.x = e.clientX;
//       mouse.y = e.clientY;
//       if (mainDot && trail1 && trail2) {
//         mainDot.style.opacity = '1';
//         trail1.style.opacity = '1';
//         trail2.style.opacity = '1';
//       }
//     });

//     // Animation loop
//     function animate() {
//       // Main dot follows mouse tightly
//       pos.x += (mouse.x - pos.x) * 0.25;
//       pos.y += (mouse.y - pos.y) * 0.25;
//       mainDot.style.left = pos.x + 'px';
//       mainDot.style.top = pos.y + 'px';
//       // Trail1 follows main
//       t1.x += (pos.x - t1.x) * 0.18;
//       t1.y += (pos.y - t1.y) * 0.18;
//       trail1.style.left = t1.x + 'px';
//       trail1.style.top = t1.y + 'px';
//       // Trail2 follows trail1
//       t2.x += (t1.x - t2.x) * 0.16;
//       t2.y += (t1.y - t2.y) * 0.16;
//       trail2.style.left = t2.x + 'px';
//       trail2.style.top = t2.y + 'px';
//       requestAnimationFrame(animate);
//     }
//     animate();

//     // Hide default cursor only if custom cursor is working
//     if (mainDot && trail1 && trail2) {
//       document.body.style.cursor = 'none';
//     }
//   }
// })();

  // DJ Turntable Controller
  (function() {
    let currentRotation = 0;
    let isSpinning = false;
    let animationId = null;
    let recordLeft, recordRight;

  // Record spinning animation (only when active)
  function spinRecord() {
    if (isSpinning && recordLeft && recordRight) {
      currentRotation += 2;
      recordLeft.style.transform = `rotate(${currentRotation}deg)`;
      recordRight.style.transform = `rotate(${-currentRotation}deg)`;
      animationId = requestAnimationFrame(spinRecord);
    }
  }

  // Function to start spinning
  function startSpinning() {
    if (!isSpinning) {
      isSpinning = true;
      spinRecord();
    }
  }

  // Function to stop spinning
  function stopSpinning() {
    isSpinning = false;
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    
    // Gradually slow down over 1 second
    if (recordLeft && recordRight) {
      const startRotation = currentRotation;
      const startTime = Date.now();
      const duration = 1000; // 1 second
      
      function slowDown() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3); // Smooth deceleration
        
        const currentRot = startRotation + (2 * easeOut);
        recordLeft.style.transform = `rotate(${currentRot}deg)`;
        recordRight.style.transform = `rotate(${-currentRot}deg)`;
        
        if (progress < 1) {
          requestAnimationFrame(slowDown);
        } else {
          // Records stay where they are - no reset to 0
        }
      }
      
      slowDown();
    }
  }

  function initDJTurntable() {
    const turntable = document.getElementById('dj-turntable');
    recordLeft = document.getElementById('turntable-record-left');
    recordRight = document.getElementById('turntable-record-right');
    const sliders = document.querySelectorAll('.slider');
    
    if (!turntable) return;

    // Slider click handlers for visual feedback only
    sliders.forEach(slider => {
      slider.addEventListener('click', function() {
        // Visual feedback
        sliders.forEach(s => s.style.background = 'linear-gradient(145deg, #6a6a6a 0%, #4a4a4a 100%)');
        this.style.background = 'linear-gradient(145deg, #8a8a8a 0%, #6a6a6a 100%)';
        
        // Reset after a short delay
        setTimeout(() => {
          this.style.background = 'linear-gradient(145deg, #6a6a6a 0%, #4a4a4a 100%)';
        }, 300);
      });
    });
  }

    // Initialize DJ turntable if on about page
    if (document.getElementById('dj-turntable')) {
        initDJTurntable();
        
        // Add screen message functionality
        const screenText = document.getElementById('screen-text');
        const centerButtons = document.querySelectorAll('.center-button');
        const imagesContainer = document.getElementById('dj-images-container');
        const turntable = document.getElementById('dj-turntable');
        
        let activeButton = null;
        let currentImageSet = null;
        


        // Function to show images for a specific mode
        function showImages(mode) {
            const targetImageSet = document.querySelector(`[data-mode="${mode}"]`);
            if (!targetImageSet) return;

            // Hide all image sets and remove floating classes
            const allImageSets = document.querySelectorAll('.dj-image-set');
            allImageSets.forEach(set => {
                set.classList.remove('active');
                // Remove floating class from all image items
                const imageItems = set.querySelectorAll('.dj-image-item');
                imageItems.forEach(item => {
                    item.classList.remove('floating');
                });
            });

            // Show the target image set
            targetImageSet.classList.add('active');
            currentImageSet = mode;
            
            // Add floating animation immediately with staggered delays
            const imageItems = targetImageSet.querySelectorAll('.dj-image-item');
            imageItems.forEach((item, index) => {
                // Start floating immediately with small staggered delays (0s, 0.2s, 0.4s)
                const delay = index * 200; // 0ms, 200ms, 400ms
                setTimeout(() => {
                    item.classList.add('floating');
                }, delay);
            });
        }

        // Function to hide all images
        function hideImages() {
            const allImageSets = document.querySelectorAll('.dj-image-set');
            allImageSets.forEach(set => {
                set.classList.remove('active');
                // Remove floating class from all image items
                const imageItems = set.querySelectorAll('.dj-image-item');
                imageItems.forEach(item => {
                    item.classList.remove('floating');
                });
            });
            currentImageSet = null;
        }

        centerButtons.forEach(button => {
            // Hover: show mode text
            button.addEventListener('mouseenter', function() {
                const message = this.getAttribute('data-message');
                screenText.textContent = message;
                screenText.classList.add('visible');
            });
            // Mouse leave: restore active or clear
            button.addEventListener('mouseleave', function() {
                if (activeButton) {
                    screenText.textContent = activeButton.getAttribute('data-message');
                    screenText.classList.add('visible');
                } else {
                    screenText.classList.remove('visible');
                }
            });
            // Click: activate/deactivate mode
            button.addEventListener('click', function() {
                // If this button is already active, deactivate it
                if (this.classList.contains('active')) {
                    this.classList.remove('active');
                    activeButton = null;
                    // Clear screen
                    screenText.textContent = '';
                    screenText.classList.remove('visible');
                    // Stop spinning
                    stopSpinning();
                    // Hide images
                    hideImages();
                } else {
                    // Remove active from all other buttons
                    centerButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    activeButton = this;
                    // Show text
                    const message = this.getAttribute('data-message');
                    screenText.textContent = message;
                    screenText.classList.add('visible');
                    // Start spinning
                    startSpinning();
                    // Show images for this mode
                    showImages(this.getAttribute('data-message').toLowerCase().replace(' mode', ''));
                }
            });
        });
    }

        // Fallback: restore default cursor if custom cursor fails - COMMENTED OUT
    // setTimeout(() => {
    //   if (!mainDot || !trail1 || !trail2) {
    //     document.body.style.cursor = 'default';
    //     console.log('Custom cursor failed, restoring default cursor');
    //   }
    // }, 1000);

        // Test navigation functionality
    console.log('Testing navigation functionality...');
    const testLink = document.querySelector('nav a[href="work.html"]');
    if (testLink) {
        console.log('Found work link:', testLink);
        testLink.addEventListener('click', function(e) {
            console.log('Work link clicked!');
        });
    } else {
        console.log('Work link not found');
    }

    // Initialize work page filtering if on work page
    if (document.querySelector('.work-filters')) {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const workItems = document.querySelectorAll('.work-item');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                
                // Update active button state
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Filter work items
                workItems.forEach(item => {
                    const category = item.getAttribute('data-category');
                    const project = item.getAttribute('data-project');
                    
                    // Special case for CoachPro - exclude from programming filter
                    if (filter === 'programming' && project === 'coachpro') {
                        item.classList.add('hidden');
                        setTimeout(() => {
                            item.style.display = 'none';
                        }, 300);
                    } else if (filter === 'all' || category === filter) {
                        item.classList.remove('hidden');
                        // Add a small delay for smooth animation
                        setTimeout(() => {
                            item.style.display = 'block';
                        }, 50);
                    } else {
                        item.classList.add('hidden');
                        // Hide after animation completes
                        setTimeout(() => {
                            item.style.display = 'none';
                        }, 300);
                    }
                });
                
                // Update filter counts (commented out since counts are not displayed)
                // updateFilterCounts(filter);
            });
        });
        
        // Function to update filter counts (commented out since counts are not displayed)
        // function updateFilterCounts(activeFilter) {
        //     const allCount = workItems.length;
        //     const designCount = document.querySelectorAll('[data-category="design"]').length;
        //     // Exclude CoachPro from programming count
        //     const programmingCount = document.querySelectorAll('[data-category="programming"]:not([data-project="coachpro"])').length;
        //     
        //     // Update count displays
        //     document.querySelector('[data-filter="all"] .filter-count').textContent = allCount;
        //     document.querySelector('[data-filter="design"] .filter-count').textContent = designCount;
        //     document.querySelector('[data-filter="programming"] .filter-count').textContent = programmingCount;
        // }
        
        // Initialize counts (commented out since counts are not displayed)
        // updateFilterCounts('all');
        
        // Add click navigation for work items
        workItems.forEach(item => {
            item.addEventListener('click', function() {
                const project = this.getAttribute('data-project');
                console.log(`Clicked on work item: ${project}`);
                
                // Navigate to the appropriate project page
                switch(project) {
                    case 'class':
                        window.location.href = '../class/';
                        break;
                    case 'quantframe':
                        window.location.href = '../quantframe/';
                        break;
                    case 'noborders':
                        window.location.href = '../noborders/';
                        break;
                    case 'coachpro':
                        window.location.href = '../coachpro/';
                        break;
                    case 'xometry':
                        window.location.href = '../xometry/';
                        break;
                    case 'neurologic':
                        window.location.href = '../neurologic/';
                        break;
                    case 'context-aware-vr':
                        window.location.href = '../context-aware-vr/';
                        break;
                    default:
                        console.log(`No navigation defined for project: ${project}`);
                }
            });
        });
    }
  })();

// Resume Page Scroll Animations
(function() {
    function initResumeAnimations() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        
        if (timelineItems.length === 0) return; // Not on resume page
        
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Add staggered delay for each item
                    setTimeout(() => {
                        entry.target.classList.add('animate');
                    }, index * 200); // 200ms delay between each item
                }
            });
        }, observerOptions);
        
        timelineItems.forEach(item => {
            observer.observe(item);
        });
    }
    
    // Initialize on DOM load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initResumeAnimations);
    } else {
        initResumeAnimations();
    }
})();

// Image Modal Functionality
(function() {
    function initializeImageModal() {
        const modal = document.getElementById('imageModal');
        const modalImg = document.getElementById('modalImage');
        const closeBtn = document.querySelector('.image-modal-close');
        const expandableImages = document.querySelectorAll('.expandable-image');
        
        if (!modal || !modalImg || !closeBtn) return; // Modal elements not found
        
        // Add click event to all expandable images (excluding hero image)
        expandableImages.forEach(img => {
            // Skip the hero image
            if (img.closest('.class-hero-image')) {
                return;
            }
            
            img.addEventListener('click', function() {
                modal.style.display = 'block';
                modalImg.src = this.getAttribute('data-src') || this.src;
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
            });
        });
        
        // Close modal when clicking the X
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restore scrolling
        });
        
        // Close modal when clicking outside the image
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto'; // Restore scrolling
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto'; // Restore scrolling
            }
        });
    }
    
    // Initialize image modal when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeImageModal);
    } else {
        initializeImageModal();
    }
})();

// Problem Factor Arrow Animation
(function() {
    function initializeProblemArrows() {
        const problemFactors = document.querySelectorAll('.problem-factor');
        
        if (problemFactors.length === 0) return; // Not on class page
        
        // Set CSS custom properties for staggered animation delays
        problemFactors.forEach((factor, index) => {
            factor.style.setProperty('--factor-index', index);
        });
    }
    
    // Initialize problem arrows when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeProblemArrows);
    } else {
        initializeProblemArrows();
    }
})();

// Progress Indicator Functionality
function initializeProgressIndicator() {
    const progressIndicator = document.getElementById('progressIndicator');
    if (!progressIndicator) return;

    const progressSteps = progressIndicator.querySelectorAll('.progress-step');
    const sections = [];

    // Get all sections that have IDs matching the progress steps
    progressSteps.forEach(step => {
        const sectionId = step.getAttribute('data-section');
        const section = document.getElementById(sectionId);
        if (section) {
            sections.push({ element: section, step: step, id: sectionId });
        }
    });

    if (sections.length === 0) return;

    // Function to update active step based on scroll position
    function updateActiveStep() {
        const scrollPosition = window.scrollY + window.innerHeight / 2;
        let activeSection = null;
        let minDistance = Infinity;

        sections.forEach(({ element, step, id }) => {
            const rect = element.getBoundingClientRect();
            const elementTop = rect.top + window.scrollY;
            const elementBottom = elementTop + rect.height;
            
            // Calculate distance from center of viewport to section
            const distance = Math.abs(scrollPosition - (elementTop + elementBottom) / 2);
            
            if (distance < minDistance) {
                minDistance = distance;
                activeSection = { element, step, id };
            }
        });

        // Update active states
        progressSteps.forEach(step => {
            step.classList.remove('active', 'completed');
        });

        if (activeSection) {
            activeSection.step.classList.add('active');
            
            // Mark previous steps as completed
            const activeIndex = sections.findIndex(s => s.id === activeSection.id);
            sections.forEach((section, index) => {
                if (index < activeIndex) {
                    section.step.classList.add('completed');
                }
            });
        }
    }

    // Add click functionality to progress steps
    progressSteps.forEach(step => {
        step.addEventListener('click', () => {
            const sectionId = step.getAttribute('data-section');
            const section = document.getElementById(sectionId);
            if (section) {
                section.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Throttled scroll event listener
    let scrollTimeout;
    function handleScroll() {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(updateActiveStep, 10);
    }

    // Initial update
    updateActiveStep();

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Update on resize
    window.addEventListener('resize', handleScroll, { passive: true });
}

// Initialize progress indicator when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeProgressIndicator);
} else {
    initializeProgressIndicator();
}

// Test page specific functionality
function initializeTestPage() {
    // Only run on hometest.html
    if (!document.querySelector('.test-records-container')) {
        return;
    }
    
    console.log('Initializing test page functionality...');
    
    const testRecords = document.querySelectorAll('.test-record');
    const testProjectInfoPanels = document.querySelectorAll('.test-project-info');
    
    if (testRecords.length === 0 || testProjectInfoPanels.length === 0) {
        console.log('Test records or project info panels not found');
        return;
    }
    
    testRecords.forEach(record => {
        record.addEventListener('mouseenter', function() {
            const projectType = this.getAttribute('data-project');
            console.log('Hovering over test record:', projectType);
            
            // Remove active class from all project info panels
            testProjectInfoPanels.forEach(panel => {
                panel.classList.remove('active');
            });
            
            // Add active class to the corresponding project info panel
            const targetPanel = document.querySelector(`.test-project-info[data-project="${projectType}"]`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
        
        record.addEventListener('mouseleave', function() {
            // Remove active class from all project info panels
            testProjectInfoPanels.forEach(panel => {
                panel.classList.remove('active');
            });
        });
    });
    
    // Also handle hover on the project info container to keep it visible
    const testProjectInfoContainer = document.querySelector('.test-project-info-container');
    if (testProjectInfoContainer) {
        testProjectInfoContainer.addEventListener('mouseenter', function() {
            // Keep the currently active panel visible
            const activePanel = document.querySelector('.test-project-info.active');
            if (activePanel) {
                activePanel.classList.add('active');
            }
        });
        
        testProjectInfoContainer.addEventListener('mouseleave', function() {
            // Hide all panels when leaving the container
            testProjectInfoPanels.forEach(panel => {
                panel.classList.remove('active');
            });
        });
    }
}
