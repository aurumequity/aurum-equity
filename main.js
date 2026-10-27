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

  // Footer year
  var yr = document.getElementById('year');
  if (yr) yr.textContent = String(new Date().getFullYear());

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
    status.className = 'form-status' + (kind ? ' ' + kind : '');
    status.innerHTML = html;
  }

  var fallback =
    'Please email <a href="mailto:dominique.deamues@aurumequitylegacy.com">dominique.deamues@aurumequitylegacy.com</a> directly.';

  var messages = {
    name: 'Enter your full name.',
    organization: 'Enter your organization.',
    email: 'Enter a valid work email address.',
    opportunity_type: 'Select an opportunity type.',
  };

  // Validate required fields. Errors are written as text and linked with aria-describedby.
  function validate() {
    var invalid = [];
    form.querySelectorAll('[required]').forEach(function (field) {
      var err = document.getElementById(field.id + '-err');
      var bad = !field.value.trim() || (field.type === 'email' && !field.checkValidity());
      if (bad) {
        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-describedby', err.id);
        err.textContent = 'Error: ' + messages[field.name];
        err.hidden = false;
        invalid.push(field);
      } else {
        field.removeAttribute('aria-invalid');
        field.removeAttribute('aria-describedby');
        err.hidden = true;
        err.textContent = '';
      }
    });
    return invalid;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var invalid = validate();
    if (invalid.length) {
      show(
        'error',
        'Error: ' +
          invalid.length +
          (invalid.length === 1 ? ' field needs' : ' fields need') +
          ' attention. Please correct the marked fields and send again.'
      );
      invalid[0].focus();
      return;
    }
    var data = new FormData(form);
    if (data.get('botcheck')) return; // honeypot filled, silently stop
    if (data.get('access_key') === KEY_PLACEHOLDER) {
      show('error', 'Error: the form is not connected yet, so your message was not sent. ' + fallback);
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
        show('success', 'Message sent. A reply will come directly from our lead engineer.');
      })
      .catch(function () {
        show('error', 'Error: your message could not be sent. ' + fallback);
      })
      .then(function () {
        submit.disabled = false;
      });
  });
})();
