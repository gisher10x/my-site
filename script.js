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

    send();
  });

  // ---------- Sending through FormSubmit (runs only after validation passes) ----------
  var ENDPOINT = 'https://formsubmit.co/ajax/gisher10x@gmail.com';
  var MSG_SUCCESS = 'ההודעה נשלחה, תודה! אחזור אליך בהקדם.';
  var MSG_ERROR = 'לא הצלחתי לשלוח את ההודעה. אפשר לנסות שוב, או ליצור קשר דרך GitHub או LinkedIn.';
  var MSG_SENDING = 'שולח...';

  var submitButton = form.querySelector('.contact-submit');
  var submitLabel = submitButton ? submitButton.textContent : '';
  var sending = false;

  // The status box is styled as success; an error switches it to the error colours.
  function setStatus(text, isError) {
    status.style.color = isError ? 'var(--color-error)' : '';
    status.style.background = isError ? 'var(--color-error-bg)' : '';
    status.textContent = text;
  }

  function succeed() {
    form.reset();
    fields.forEach(clearError);
    setStatus(MSG_SUCCESS, false);
  }

  function setSending(isSending) {
    sending = isSending;
    if (!submitButton) return;
    submitButton.disabled = isSending;
    submitButton.textContent = isSending ? MSG_SENDING : submitLabel;
  }

  function send() {
    if (sending) return;

    // Spam trap: real visitors never see this field. If it is filled, pretend it worked.
    var honey = form.elements['_honey'];
    if (honey && honey.value) {
      succeed();
      return;
    }

    setSending(true);

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form)
    })
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(function (data) {
        // FormSubmit can answer 200 with success "false" (for example before activation).
        if (data && (data.success === false || data.success === 'false')) {
          throw new Error('FormSubmit refused');
        }
        succeed();
      })
      .catch(function () {
        // Keep what the visitor typed so they can try again.
        setStatus(MSG_ERROR, true);
      })
      .then(function () {
        setSending(false);
      });
  }
})();

/* =========================================================
   Theme toggle (separate from the form validation above)
   A tiny script in <head> applies a stored choice before paint;
   this block keeps the toggle, aria-pressed and storage in sync.
   ========================================================= */
(function () {
  var STORAGE_KEY = 'theme';
  var root = document.documentElement;
  var button = document.querySelector('.theme-toggle');
  var systemDark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var reduceMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var chosenThisVisit = false; // covers browsers where storage is blocked
  var fadeTimer;

  function readStored() {
    try {
      var value = window.localStorage.getItem(STORAGE_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch (e) {
      return null;
    }
  }

  function store(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {
      // Storage unavailable: the choice still applies for this visit.
    }
  }

  function systemTheme() {
    return systemDark && systemDark.matches ? 'dark' : 'light';
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    if (button) button.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  }

  // First visit follows the system; later visits use the stored choice.
  apply(readStored() || systemTheme());

  // Follow system changes until the visitor makes a choice.
  if (systemDark) {
    var onSystemChange = function () {
      if (!chosenThisVisit && !readStored()) apply(systemTheme());
    };
    if (systemDark.addEventListener) {
      systemDark.addEventListener('change', onSystemChange);
    } else if (systemDark.addListener) {
      systemDark.addListener(onSystemChange);
    }
  }

  if (!button) return;
  button.hidden = false; // the button only shows when JavaScript runs

  button.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';

    if (!(reduceMotion && reduceMotion.matches)) {
      root.classList.add('theme-transition');
      window.clearTimeout(fadeTimer);
      fadeTimer = window.setTimeout(function () {
        root.classList.remove('theme-transition');
      }, 400);
    }

    chosenThisVisit = true;
    apply(next);
    store(next);
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
