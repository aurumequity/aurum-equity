// Aurum Equity shared script: nav toggle, analytics events, contact form.
(function () {
  'use strict';

  var FORM_ENDPOINT = 'https://api.web3forms.com/submit';
  var KEY_PLACEHOLDER = 'WEB3FORMS_ACCESS_KEY_PLACEHOLDER';

  // Analytics helper. Does nothing if gtag is missing (blocked or not loaded).
  function track(name, params) {
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', name, params || {});
      }
    } catch (e) {
      /* never break the page for analytics */
    }
  }

  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('site-nav');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('open')) {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  // Analytics events via delegated clicks
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    var where = a.getAttribute('data-location') || 'unspecified';
    if (a.hasAttribute('data-schedule')) {
      track('schedule_call_click', { link_location: where });
    }
    if (/\.pdf($|\?)/i.test(a.getAttribute('href') || '')) {
      track('capability_statement_download', { link_location: where });
    }
  });

  // Contact form
  var form = document.getElementById('contact-form');
  if (!form) return;
  var status = document.getElementById('form-status');
  var submit = form.querySelector('button[type="submit"]');

  function show(kind, html) {
    status.className = 'form-status ' + kind;
    status.innerHTML = html;
  }

  var fallback =
    'Please email <a href="mailto:dominique.deamues@aurumequitylegacy.com">dominique.deamues@aurumequitylegacy.com</a> directly.';

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    var data = new FormData(form);
    if (data.get('botcheck')) return; // honeypot filled, silently stop
    if (data.get('access_key') === KEY_PLACEHOLDER) {
      show('error', 'The form is not connected yet, so your message was not sent. ' + fallback);
      return;
    }
    var payload = {};
    data.forEach(function (v, k) {
      payload[k] = v;
    });
    submit.disabled = true;
    show('', 'Sending...');
    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(function (r) {
        return r.json().then(function (j) {
          return { ok: r.ok && j.success, body: j };
        });
      })
      .then(function (res) {
        if (!res.ok) throw new Error('rejected');
        track('generate_lead', { opportunity_type: String(data.get('opportunity_type') || '') });
        form.reset();
        show('success', 'Thank you. Your message was sent and Dominique will reply directly.');
      })
      .catch(function () {
        show('error', 'Your message could not be sent. ' + fallback);
      })
      .then(function () {
        submit.disabled = false;
      });
  });
})();
