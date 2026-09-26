
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const successBox = document.getElementById('form-success');
  const submitBtn = document.getElementById('contact-submit-btn');

  const fields = {
    name: {
      input: document.getElementById('name'),
      wrap: document.getElementById('field-name'),
      validate: (v) => v.trim().length >= 2
    },
    email: {
      input: document.getElementById('email'),
      wrap: document.getElementById('field-email'),
      validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
    },
    message: {
      input: document.getElementById('message'),
      wrap: document.getElementById('field-message'),
      validate: (v) => v.trim().length >= 10
    }
  };

  function setFieldState(field, isValid, showAnyState) {
    if (!field.wrap) return;
    if (!showAnyState) {
      field.wrap.classList.remove('has-error', 'is-valid');
      return;
    }
    field.wrap.classList.toggle('has-error', !isValid);
    field.wrap.classList.toggle('is-valid', isValid);
  }

  function validateField(key, showAnyState) {
    const field = fields[key];
    const isValid = field.validate(field.input.value);
    setFieldState(field, isValid, showAnyState);
    return isValid;
  }

  Object.keys(fields).forEach((key) => {
    const field = fields[key];
    let touched = false;
    field.input.addEventListener('blur', () => {
      touched = true;
      validateField(key, true);
    });
    field.input.addEventListener('input', () => {
      if (touched) validateField(key, true);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    let allValid = true;
    Object.keys(fields).forEach((key) => {
      const ok = validateField(key, true);
      if (!ok) allValid = false;
    });

    if (!allValid) {
      const firstInvalid = form.querySelector('.field.has-error input, .field.has-error textarea');
      if (firstInvalid) firstInvalid.focus();
      if (successBox) successBox.classList.remove('is-visible');
      return;
    }

    if (submitBtn) {
      submitBtn.setAttribute('disabled', 'true');
      submitBtn.textContent = 'Sending…';
    }

    setTimeout(() => {
      if (successBox) successBox.classList.add('is-visible');
      form.reset();
      Object.keys(fields).forEach((key) => setFieldState(fields[key], false, false));
      if (submitBtn) {
        submitBtn.removeAttribute('disabled');
        submitBtn.textContent = 'Send Message';
      }
    }, 500);
  });
})();
