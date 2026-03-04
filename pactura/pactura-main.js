    document.getElementById("year").textContent = new Date().getFullYear();

    // Dynamic aria-current
    document.querySelectorAll('.nav a').forEach(link => {
      if (link.pathname === window.location.pathname) {
        link.setAttribute('aria-current', 'page');
      }
    });

    // Scroll animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));