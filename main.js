// Mobile Menu Functionality
const menuToggle = document.getElementById('menu-toggle');
const closeMenuBtn = document.getElementById('close-menu');
const mobileMenu = document.getElementById('mobile-menu');
const menuLinks = document.querySelectorAll('.menu-link');

function openMenu() {
  mobileMenu.classList.add('active');
  mobileMenu.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  // Add backdrop
  const backdrop = document.createElement('div');
  backdrop.id = 'menu-backdrop';
  backdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: rgba(0, 0, 0, 0.7);
    z-index: 39;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  document.body.appendChild(backdrop);
  requestAnimationFrame(() => {
    backdrop.style.opacity = '1';
  });
  backdrop.addEventListener('click', closeMenu);
}

function closeMenu() {
  mobileMenu.classList.remove('active');
  mobileMenu.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = 'auto';
  // Remove backdrop
  const backdrop = document.getElementById('menu-backdrop');
  if (backdrop) {
    backdrop.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(backdrop);
    }, 300);
  }
}

menuToggle.addEventListener('click', openMenu);
closeMenuBtn.addEventListener('click', closeMenu);

// Close menu when clicking on menu links
menuLinks.forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Close menu on Escape key
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
    closeMenu();
  }
});

// Service Tabs Functionality
const tabBtns = document.querySelectorAll('.tab-btn');
const serviceSections = document.querySelectorAll('.service-single');

function showService(targetId) {
  // Hide all services
  serviceSections.forEach(section => {
    section.classList.remove('active');
    section.style.display = 'none';
  });

  // Show target service
  const targetService = document.getElementById(targetId);
  if (targetService) {
    targetService.classList.add('active');
    targetService.style.display = 'block';
  }
}

function setActiveTab(activeBtn) {
  // Remove active class from all tabs
  tabBtns.forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Add active class to clicked tab
  activeBtn.classList.add('active');
}

tabBtns.forEach(btn => {
  btn.addEventListener('click', function() {
    const targetId = this.getAttribute('data-target');
    setActiveTab(this);
    showService(targetId);
  });
});

// Initialize first service as active
showService('service-launch');

// Reveal on Scroll Animation
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      
      // Check for typing animation
      const typingTexts = entry.target.querySelectorAll('.typing-text');
      if (typingTexts.length > 0) {
        startTypingSequence(typingTexts);
      }
      
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1
});

reveals.forEach(el => observer.observe(el));

// Typing Animation
function startTypingSequence(typingTexts) {
  let currentIndex = 0;
  let isTyping = false;
  
  // Clear all text first and ensure proper state
  typingTexts.forEach(text => {
    text.textContent = '';
    text.innerHTML = '';
    text.classList.remove('typing', 'typed');
  });
  
  function typeNext() {
    if (currentIndex >= typingTexts.length) {
      // All typing is complete - show the button
      const ctaButton = document.getElementById('about-cta-btn');
      if (ctaButton) {
        setTimeout(() => {
          ctaButton.style.opacity = '1';
          ctaButton.style.visibility = 'visible';
        }, 500);
      }
      isTyping = false;
      return;
    }
    
    const text = typingTexts[currentIndex];
    const targetText = text.dataset.text || '';
    
    // Ensure element is completely reset
    text.textContent = '';
    text.innerHTML = '';
    text.style.whiteSpace = 'normal';
    text.style.overflow = 'visible';
    text.classList.remove('typed');
    text.classList.add('typing');
    
    isTyping = true;
    let currentText = '';
    let i = 0;
    
    const typeInterval = setInterval(() => {
      if (i < targetText.length && isTyping) {
        currentText += targetText.charAt(i);
        text.textContent = currentText;
        i++;
      } else {
        clearInterval(typeInterval);
        
        // Remove typing cursor after completion
        setTimeout(() => {
          text.classList.remove('typing');
          text.classList.add('typed');
          
          // Move to next element
          currentIndex++;
          setTimeout(() => {
            typeNext();
          }, 300);
        }, 200);
      }
    }, 20);
  }
  
  // Start typing sequence
  setTimeout(() => {
    typeNext();
  }, 500);
}

// Clear typing elements on page load
document.addEventListener('DOMContentLoaded', function() {
  const typingElements = document.querySelectorAll('.typing-text');
  typingElements.forEach(element => {
    element.textContent = '';
  });
  
  // Ensure CTA button starts hidden
  const ctaButton = document.getElementById('about-cta-btn');
  if (ctaButton) {
    ctaButton.style.opacity = '0';
    ctaButton.style.visibility = 'hidden';
  }
});

// Smooth scrolling for anchor links (exclude service-details-contact to allow close-and-scroll)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  // Skip contact buttons inside the service details menus so the details close first
  if (anchor.classList && anchor.classList.contains('service-details-contact')) return;
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});

// Service Details Slide-down Functionality
document.addEventListener('DOMContentLoaded', function() {
  // Helpers to open/close details with opposite close animation
  function openDetails(menu) {
    if (!menu) return;
    // remove state that pins menu below
    menu.classList.remove('closing');
    menu.classList.remove('closed-below');
    // force reflow to ensure transition when toggling classes
    // eslint-disable-next-line no-unused-expressions
    menu.offsetHeight;
    menu.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDetails(menu, cb) {
    if (!menu) {
      if (cb) cb();
      return;
    }
    // Remove active and add closing so it slides down
    menu.classList.remove('active');
    menu.classList.remove('closed-below');
    menu.classList.add('closing');
    document.body.style.overflow = '';

    // Wait for transitionend on transform, then remove closing class and pin below
    var onEnd = function(e) {
      if (e && e.propertyName && e.propertyName.indexOf('transform') === -1) return;
      menu.classList.remove('closing');
      // pin the menu below so it doesn't jump back up
      menu.classList.add('closed-below');
      menu.removeEventListener('transitionend', onEnd);
      if (typeof cb === 'function') cb();
    };
    menu.addEventListener('transitionend', onEnd);

    // Fallback in case transitionend doesn't fire
    setTimeout(function() {
      if (menu.classList.contains('closing')) {
        menu.classList.remove('closing');
        menu.classList.add('closed-below');
        if (typeof cb === 'function') cb();
      }
    }, 700);
  }

  // LAUNCH
  const launchBtn = document.getElementById('launch-more-info-btn');
  const launchMenu = document.getElementById('launch-details-menu');
  const closeLaunchBtn = document.getElementById('close-launch-details');
  if (launchBtn && launchMenu && closeLaunchBtn) {
    launchBtn.addEventListener('click', function(e) {
      e.preventDefault();
      openDetails(launchMenu);
    });
    closeLaunchBtn.addEventListener('click', function() {
      closeDetails(launchMenu);
    });
  }

  // SHIFT
  const shiftBtn = document.querySelector('#service-shift .service-cta');
  const shiftMenu = document.getElementById('shift-details-menu');
  const closeShiftBtn = document.getElementById('close-shift-details');
  if (shiftBtn && shiftMenu && closeShiftBtn) {
    shiftBtn.addEventListener('click', function(e) {
      e.preventDefault();
      openDetails(shiftMenu);
    });
    closeShiftBtn.addEventListener('click', function() {
      closeDetails(shiftMenu);
    });
  }

  // GROW
  const growBtn = document.querySelector('#service-refresh .service-cta');
  const growMenu = document.getElementById('grow-details-menu');
  const closeGrowBtn = document.getElementById('close-grow-details');
  if (growBtn && growMenu && closeGrowBtn) {
    growBtn.addEventListener('click', function(e) {
      e.preventDefault();
      openDetails(growMenu);
    });
    closeGrowBtn.addEventListener('click', function() {
      closeDetails(growMenu);
    });
  }

  // Close details menu and scroll to contact when clicking Contact button in details
  function closeDetailsAndScroll(e) {
    if (e && e.preventDefault) e.preventDefault();

    // Also close mobile menu if open
    try {
      if (typeof closeMenu === 'function') closeMenu();
    } catch (err) {
      // ignore if closeMenu not available
    }

    // Close any active service details with downward animation, then scroll
    const activeMenus = document.querySelectorAll('.service-details-menu.active');
    let count = activeMenus.length;
    if (count === 0) {
      // No active menus, just scroll
      setTimeout(function() {
        var contactSection = document.getElementById('contact');
        if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
      }, 10);
      return;
    }

    activeMenus.forEach(function(menu) {
      closeDetails(menu, function() {
        count--;
        if (count === 0) {
          // remove any backdrop immediately
          const backdrop = document.getElementById('menu-backdrop');
          if (backdrop && backdrop.parentNode) {
            backdrop.style.opacity = '0';
            setTimeout(function() {
              if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
            }, 300);
          }
          setTimeout(function() {
            var contactSection = document.getElementById('contact');
            if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
          }, 50);
        }
      });
    });
  }

  // Attach to all service-details-contact buttons
  document.querySelectorAll('.service-details-contact').forEach(function(btn) {
    btn.removeEventListener('click', closeDetailsAndScroll); // Prevent duplicate
    btn.addEventListener('click', closeDetailsAndScroll);
  });
});

// Helper to animate closing of a service-details menu (slides down)
function animateCloseMenu(menu, cb) {
  if (!menu) {
    if (typeof cb === 'function') cb();
    return;
  }
  menu.classList.remove('active');
  // ensure closed-below cleared then add closing to animate down
  menu.classList.remove('closed-below');
  // trigger reflow then add closing to animate down
  // eslint-disable-next-line no-unused-expressions
  menu.offsetHeight;
  menu.classList.add('closing');
  document.body.style.overflow = '';

  var onEnd = function(e) {
    if (e && e.propertyName && e.propertyName.indexOf('transform') === -1) return;
    menu.classList.remove('closing');
    // pin below after animation
    menu.classList.add('closed-below');
    menu.removeEventListener('transitionend', onEnd);
    if (typeof cb === 'function') cb();
  };
  menu.addEventListener('transitionend', onEnd);

  // Fallback
  setTimeout(function() {
    if (menu.classList.contains('closing')) {
      menu.classList.remove('closing');
      menu.classList.add('closed-below');
      if (typeof cb === 'function') cb();
    }
  }, 700);
}

// Delegated capture handler to ensure service details 'Contact' clicks are intercepted
document.addEventListener('click', function(evt) {
  const anchor = evt.target.closest && evt.target.closest('a.service-details-contact');
  if (!anchor) return;
  // Intercept immediately
  evt.preventDefault();

  // Close mobile menu if open
  if (typeof closeMenu === 'function') {
    try { closeMenu(); } catch (e) { /* ignore */ }
  }

  // Close any open service details menus using animateCloseMenu
  const activeMenus = document.querySelectorAll('.service-details-menu.active');
  if (activeMenus.length === 0) {
    // nothing open; just scroll
    setTimeout(function() {
      const contactSection = document.getElementById('contact');
      if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
    }, 10);
    return;
  }

  let remaining = activeMenus.length;
  activeMenus.forEach(function(menu) {
    animateCloseMenu(menu, function() {
      remaining--;
      if (remaining === 0) {
        // remove backdrop if any
        const backdrop = document.getElementById('menu-backdrop');
        if (backdrop && backdrop.parentNode) {
          backdrop.style.opacity = '0';
          setTimeout(function() {
            if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
          }, 300);
        }
        setTimeout(function() {
          const contactSection = document.getElementById('contact');
          if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      }
    });
  });
}, true);

// Global function usable from inline onclick to close details and scroll (uses animateCloseMenu)
window.closeDetailsAndScrollInline = function() {
  try { if (typeof closeMenu === 'function') closeMenu(); } catch (e) { /* ignore */ }
  const activeMenus = document.querySelectorAll('.service-details-menu.active');
  if (activeMenus.length === 0) {
    setTimeout(function() {
      const contactSection = document.getElementById('contact');
      if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
    }, 10);
    return;
  }
  let remaining = activeMenus.length;
  activeMenus.forEach(function(menu) {
    animateCloseMenu(menu, function() {
      remaining--;
      if (remaining === 0) {
        const backdrop = document.getElementById('menu-backdrop');
        if (backdrop && backdrop.parentNode) {
          backdrop.style.opacity = '0';
          setTimeout(function() {
            if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
          }, 300);
        }
        setTimeout(function() {
          const contactSection = document.getElementById('contact');
          if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      }
    });
  });
};

// Scroll Up Arrow Functionality
(function() {
    const scrollArrow = document.getElementById('scroll-up-arrow');
    // Only show on desktop
    function checkArrowVisibility() {
        if (window.innerWidth > 1024 && window.scrollY > 200) {
            scrollArrow.style.display = 'block';
        } else {
            scrollArrow.style.display = 'none';
        }
    }
    window.addEventListener('scroll', checkArrowVisibility);
    window.addEventListener('resize', checkArrowVisibility);
    document.addEventListener('DOMContentLoaded', checkArrowVisibility);
    // Smooth scroll to top
    scrollArrow.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
})();