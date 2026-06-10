// Smooth scrolling and active nav link
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
      updateActiveNav();
    }
  });
});

// Update active navigation link on scroll
window.addEventListener('scroll', updateActiveNav);

function updateActiveNav() {
  const sections = document.querySelectorAll('section');
  let current = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (pageYOffset >= sectionTop - 200) {
      current = section.getAttribute('id');
    }
  });

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}

// Form submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const formStatus = document.getElementById('formStatus');
    const originalBtnText = submitBtn.textContent;
    
    // Set loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    if (formStatus) {
      formStatus.className = 'form-status';
      formStatus.textContent = '';
      formStatus.style.display = 'none';
    }

    const data = new FormData(contactForm);

    fetch(contactForm.action, {
      method: contactForm.method,
      body: data,
      headers: {
        'Accept': 'application/json'
      }
    }).then(response => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
      response.json().then(data => {
        if (response.ok && (data.success !== false)) {
          if (formStatus) {
            formStatus.className = 'form-status success';
            formStatus.textContent = 'Thank you! Your message has been sent successfully.';
            formStatus.style.display = 'block';
          }
          contactForm.reset();
        } else {
          if (formStatus) {
            formStatus.className = 'form-status error';
            if (Object.prototype.hasOwnProperty.call(data, 'errors')) {
              formStatus.textContent = data.errors.map(error => error.message).join(', ');
            } else if (data.message) {
              formStatus.textContent = data.message;
            } else {
              formStatus.textContent = 'Oops! There was a problem submitting your form.';
            }
            formStatus.style.display = 'block';
          }
        }
      }).catch(() => {
        if (response.ok) {
          if (formStatus) {
            formStatus.className = 'form-status success';
            formStatus.textContent = 'Thank you! Your message has been sent successfully.';
            formStatus.style.display = 'block';
          }
          contactForm.reset();
        } else {
          if (formStatus) {
            formStatus.className = 'form-status error';
            formStatus.textContent = 'Oops! There was a problem submitting your form.';
            formStatus.style.display = 'block';
          }
        }
      });
    }).catch(error => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
      if (formStatus) {
        formStatus.className = 'form-status error';
        formStatus.textContent = 'Oops! There was a problem sending your message. Please check your network connection.';
        formStatus.style.display = 'block';
      }
    });
  });
}

// Fade in animation on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.portfolio-item, .resume-section, .skill-tag').forEach(el => {
  observer.observe(el);
});

// Mobile menu toggle
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
const navOverlay = document.getElementById('navOverlay');

function toggleMenu(forceClose = false) {
  const isActive = forceClose ? false : !navLinks.classList.contains('active');
  hamburger.classList.toggle('active', isActive);
  navLinks.classList.toggle('active', isActive);
  navOverlay.classList.toggle('active', isActive);
  document.body.style.overflow = isActive ? 'hidden' : '';
}

if (hamburger) {
  hamburger.addEventListener('click', function() {
    toggleMenu();
  });
}

// Close mobile menu on overlay click
if (navOverlay) {
  navOverlay.addEventListener('click', function() {
    toggleMenu(true);
  });
}

// Close mobile menu on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', function() {
    toggleMenu(true);
  });
});

// Video error fallback - direct Google Drive link
document.querySelectorAll('.video-wrapper video').forEach(video => {
  video.addEventListener('error', function() {
    const wrapper = this.closest('.video-wrapper');
    if (!wrapper || wrapper.querySelector('.video-fallback')) return;

    const source = this.querySelector('source');
    const match = source ? source.src.match(/id=([^&]+)/) : null;
    if (!match) return;

    const fallback = document.createElement('div');
    fallback.className = 'video-fallback';
    fallback.innerHTML = `
      <p>Play in Google Drive</p>
      <a href="https://drive.google.com/file/d/${match[1]}/view" target="_blank" rel="noopener">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        Open Video
      </a>
    `;
    wrapper.appendChild(fallback);
  });
});
