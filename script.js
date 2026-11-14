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
