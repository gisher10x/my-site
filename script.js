(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;

  var status = document.getElementById('contact-status');
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Each field and the function that returns its error message ('' when valid).
  var fields = [
    {
      input: document.getElementById('contact-name'),
      check: function (value) {
        return value ? '' : 'נא להזין שם מלא.';
      }
    },
    {
      input: document.getElementById('contact-email'),
      check: function (value) {
        if (!value) return 'נא להזין כתובת אימייל.';
        if (!emailPattern.test(value)) return 'כתובת האימייל אינה תקינה.';
        return '';
      }
    },
    {
      input: document.getElementById('contact-message'),
      check: function (value) {
        return value ? '' : 'נא להזין הודעה.';
      }
    }
  ];

  function errorElement(field) {
    return document.getElementById(field.input.id + '-error');
  }

  function showError(field, message) {
    errorElement(field).textContent = message;
    field.input.setAttribute('aria-invalid', 'true');
  }

  function clearError(field) {
    errorElement(field).textContent = '';
    field.input.removeAttribute('aria-invalid');
  }

  function validate(field) {
    var message = field.check(field.input.value.trim());
    if (message) {
      showError(field, message);
    } else {
      clearError(field);
    }
    return !message;
  }

  // Clear (or update) an error as soon as the user edits a field that was flagged.
  fields.forEach(function (field) {
    field.input.addEventListener('input', function () {
      status.textContent = '';
      if (field.input.getAttribute('aria-invalid') === 'true') {
        validate(field);
      }
    });
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    status.textContent = '';

    var firstInvalid = null;
    fields.forEach(function (field) {
      if (!validate(field) && !firstInvalid) {
        firstInvalid = field.input;
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    form.reset();
    fields.forEach(clearError);
    status.textContent = 'הטופס נבדק בהצלחה, אבל שליחת הודעות עדיין לא מחוברת. אפשר ליצור קשר דרך GitHub או LinkedIn.';
  });
})();

/* =========================================================
   Scroll reveal (separate from the form validation above)
   Elements start hidden only when this code runs, so the page
   stays fully visible without JavaScript.
   ========================================================= */
(function () {
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) return;

  var STAGGER_MS = 60;     // delay between items in a group
  var MAX_DELAY_MS = 500;  // the last item never waits longer than this
  var DURATION_MS = 600;   // keep in sync with --reveal-duration in style.css

  // Single elements that reveal on their own.
  var singleSelectors = [
    '.intro-inner',
    '.band h2',
    '.background-summary',
    '.background-label',
    '.background-education',
    '.selected-work-layout',
    '.contact-note',
    '.contact-form'
  ];

  // Groups whose children reveal one after another.
  // (Groups are never nested inside a single element above, so nothing fades twice.)
  var groupSelectors = [
    '.background-cards',
    '.tags-skills',
    '.tags-interests',
    '.steps',
    '.contact-links'
  ];

  document.documentElement.classList.add('js-reveal');

  // When the reveal is over, remove the helper classes and inline delay so the
  // element goes back to its normal styles (and hover transitions are not delayed).
  function finish(el) {
    el.classList.remove('reveal', 'is-visible');
    el.style.transitionDelay = '';
  }

  function show(el, delay) {
    var done = false;
    function end() {
      if (done) return;
      done = true;
      el.removeEventListener('transitionend', onEnd);
      finish(el);
    }
    function onEnd(event) {
      if (event.target === el && event.propertyName === 'opacity') end();
    }

    el.style.transitionDelay = delay + 'ms';
    el.addEventListener('transitionend', onEnd);
    el.classList.add('is-visible');
    // Fallback in case transitionend does not fire.
    window.setTimeout(end, delay + DURATION_MS + 200);
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var target = entry.target;
      observer.unobserve(target); // animate once only

      if (target.hasAttribute('data-reveal-group')) {
        Array.prototype.forEach.call(target.children, function (child, index) {
          show(child, Math.min(index * STAGGER_MS, MAX_DELAY_MS));
        });
      } else {
        show(target, 0);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });

  singleSelectors.forEach(function (selector) {
    Array.prototype.forEach.call(document.querySelectorAll(selector), function (el) {
      el.classList.add('reveal');
      observer.observe(el);
    });
  });

  groupSelectors.forEach(function (selector) {
    Array.prototype.forEach.call(document.querySelectorAll(selector), function (group) {
      group.setAttribute('data-reveal-group', '');
      Array.prototype.forEach.call(group.children, function (child) {
        child.classList.add('reveal');
      });
      observer.observe(group);
    });
  });
})();
