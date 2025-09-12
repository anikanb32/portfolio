document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing navigation...');
    
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
        
        // Close mobile nav when clicking on a link
        const mobileNavLinks = mobileNav.querySelectorAll('a');
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
                    window.location.href = 'quantframe.html';
                    break;
                case 'class':
                    window.location.href = 'work.html';
                    break;
                case 'noborders':
                    window.location.href = 'work.html';
                    break;
                case 'coachpro':
                    window.location.href = 'work.html';
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
        const fadeInElements = document.querySelectorAll('.fade-in, .fade-in-delay-1, .fade-in-delay-2, .fade-in-delay-3, .fade-in-delay-4');
        const staggerElements = document.querySelectorAll('.fade-in-stagger');
        
        // Animate individual fade-in elements
        fadeInElements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('loaded');
            }, 100 + (index * 100)); // Stagger the animations
        });
        
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

  // Loader HTML
  var loader = document.createElement('div');
  loader.className = 'loading-overlay';
  loader.setAttribute('data-theme', theme);
  loader.innerHTML = `
    <div class="record-loader">
      <svg class="record-svg" id="record-svg" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="45" cy="45" r="40" fill="#15705b"/>
        <!-- Even more gray, thin semicircle lines/arcs for spinning effect -->
        <path d="M57 45a12 12 0 0 0-24 0" stroke="#bbbbbb" stroke-width="0.7" fill="none" stroke-linecap="round"/>
        <path d="M63 45a18 18 0 0 0-36 0" stroke="#bbbbbb" stroke-width="0.5" fill="none" stroke-linecap="round"/>
        <path d="M75 45a30 30 0 0 0-60 0" stroke="#bbbbbb" stroke-width="0.3" fill="none" stroke-linecap="round"/>
        <circle cx="45" cy="45" r="14" fill="#111"/>
        <circle cx="45" cy="45" r="3.5" fill="#fff"/>
      </svg>
    </div>
  `;
  document.body.appendChild(loader);

  var record = document.getElementById('record-svg');
  // Start slow, then speed up after 1s
  setTimeout(function() {
    record.classList.add('fast');
  }, 1000);

  // Hide loader when page is ready
  function hideLoader() {
    loader.classList.add('hidden');
    setTimeout(function() {
      if (loader.parentNode) loader.parentNode.removeChild(loader);
    }, 400);
  }
  if (document.readyState === 'complete') {
    hideLoader();
  } else {
    window.addEventListener('load', hideLoader);
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
                        window.location.href = 'class.html';
                        break;
                    case 'quantframe':
                        window.location.href = 'quantframe.html';
                        break;
                    case 'noborders':
                        // Add navigation when noborders page is created
                        console.log('No Borders project clicked - page not yet created');
                        break;
                    case 'coachpro':
                        // Add navigation when coachpro page is created
                        console.log('CoachPro project clicked - page not yet created');
                        break;
                    case 'xometry':
                        // Add navigation when xometry page is created
                        console.log('Xometry project clicked - page not yet created');
                        break;
                    case 'neurologic':
                        // Add navigation when neurologic page is created
                        console.log('Neurologic project clicked - page not yet created');
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
        
        // Add click event to all expandable images
        expandableImages.forEach(img => {
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