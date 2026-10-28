/*
 * The application form on the careers pages. "Postuler" on a live offer (job-feed.js) and
 * the "Candidature spontanée" links open it in a pop-up instead of an email. It sends the
 * application to the Supabase function website-application (in Key4Nova's CRM repository),
 * which checks it again, stores it in the CRM and alerts the job's recruiter.
 *
 * The links keep their mailto: address: used as is when this script cannot run, and
 * offered again in the form if sending fails. Checks here only help the applicant; the
 * function refuses anything that does not pass its own.
 */
(function () {
  'use strict';

  var ENDPOINT = 'https://vouupibtbcxlcuwqrnhq.supabase.co/functions/v1/website-application';
  // The same public, read-only key as job-feed.js; the function needs no other.
  var PUBLIC_KEY = 'sb_publishable_rYbBlhO4y_hpiwNG3NggRQ_2ZjCtQVs';
  var MAX_CV_BYTES = 5 * 1024 * 1024;
  // The function refuses forms sent faster than a person can fill them in.
  var MIN_FILL_MS = 3100;
  var TIMEOUT = 60000;

  var lang = document.documentElement.lang || 'fr';
  var words = {
    fr: {
      apply: 'Postuler', spontaneous: 'Candidature spontanée', ref: 'réf.',
      firstName: 'Prénom', lastName: 'Nom', email: 'E-mail', phone: 'Téléphone',
      cv: 'CV', cvHint: 'PDF ou Word (.docx), 5 Mo maximum. Facultatif.',
      remark: 'Remarque', remarkHint: 'Facultatif.',
      consentBefore: 'J’accepte que Key4Nova traite mes données pour cette candidature, conformément à sa ',
      consentLink: 'politique de confidentialité', consentAfter: '.',
      privacy: 'https://www.key4nova.com/fr/privacy-policy',
      required: 'obligatoire', send: 'Envoyer ma candidature', sending: 'Envoi en cours…',
      cancel: 'Annuler', close: 'Fermer',
      doneTitle: 'Merci !', done: 'Votre candidature a bien été envoyée. Un consultant de Key4Nova vous recontacte rapidement.',
      byEmail: 'Envoyer plutôt par e-mail',
      errors: {
        name: 'Indiquez votre prénom et votre nom.', email: 'Indiquez une adresse e-mail valide.',
        phone: 'Indiquez un numéro de téléphone valide.', remark: 'La remarque est trop longue (2 000 caractères maximum).',
        consent: 'Cochez la case pour accepter le traitement de vos données.',
        cv_type: 'Le CV doit être un PDF ou un document Word (.docx), sans macros.',
        cv_size: 'Le CV dépasse 5 Mo.', job: 'Cette offre n’est plus disponible.',
        rate_limited: 'Trop d’envois depuis votre connexion. Réessayez plus tard ou envoyez-nous un e-mail.',
        too_fast: 'L’envoi a été bloqué par notre protection anti-spam. Réessayez dans quelques secondes.',
        rejected: 'L’envoi a été bloqué par notre protection anti-spam. Envoyez-nous plutôt un e-mail.',
        server: 'L’envoi n’a pas abouti. Réessayez dans un instant ou envoyez votre candidature par e-mail.',
      },
    },
    nl: {
      apply: 'Solliciteren', spontaneous: 'Spontane sollicitatie', ref: 'ref.',
      firstName: 'Voornaam', lastName: 'Achternaam', email: 'E-mail', phone: 'Telefoon',
      cv: 'Cv', cvHint: 'PDF of Word (.docx), maximaal 5 MB. Optioneel.',
      remark: 'Opmerking', remarkHint: 'Optioneel.',
      consentBefore: 'Ik ga ermee akkoord dat Key4Nova mijn gegevens voor deze sollicitatie verwerkt, volgens het ',
      consentLink: 'privacybeleid', consentAfter: '.',
      privacy: 'https://www.key4nova.com/nl/privacy-policy',
      required: 'verplicht', send: 'Sollicitatie versturen', sending: 'Bezig met versturen…',
      cancel: 'Annuleren', close: 'Sluiten',
      doneTitle: 'Bedankt!', done: 'Uw sollicitatie is verstuurd. Een consultant van Key4Nova neemt snel contact met u op.',
      byEmail: 'Liever per e-mail versturen',
      errors: {
        name: 'Vul uw voornaam en achternaam in.', email: 'Vul een geldig e-mailadres in.',
        phone: 'Vul een geldig telefoonnummer in.', remark: 'De opmerking is te lang (maximaal 2.000 tekens).',
        consent: 'Vink het vakje aan om akkoord te gaan met de verwerking van uw gegevens.',
        cv_type: 'Het cv moet een PDF of een Word-document (.docx) zijn, zonder macro’s.',
        cv_size: 'Het cv is groter dan 5 MB.', job: 'Deze vacature is niet meer beschikbaar.',
        rate_limited: 'Te veel verzendingen vanaf uw verbinding. Probeer het later opnieuw of stuur ons een e-mail.',
        too_fast: 'Het versturen werd tegengehouden door onze spambeveiliging. Probeer het over enkele seconden opnieuw.',
        rejected: 'Het versturen werd tegengehouden door onze spambeveiliging. Stuur ons liever een e-mail.',
        server: 'Het versturen is mislukt. Probeer het zo meteen opnieuw of stuur uw sollicitatie per e-mail.',
      },
    },
    en: {
      apply: 'Apply', spontaneous: 'Open application', ref: 'ref.',
      firstName: 'First name', lastName: 'Last name', email: 'Email', phone: 'Phone',
      cv: 'CV', cvHint: 'PDF or Word (.docx), 5 MB maximum. Optional.',
      remark: 'Remark', remarkHint: 'Optional.',
      consentBefore: 'I agree that Key4Nova processes my data for this application, in line with its ',
      consentLink: 'privacy policy', consentAfter: '.',
      privacy: 'https://www.key4nova.com/fr/privacy-policy',
      required: 'required', send: 'Send my application', sending: 'Sending…',
      cancel: 'Cancel', close: 'Close',
      doneTitle: 'Thank you!', done: 'Your application has been sent. A Key4Nova consultant will be in touch shortly.',
      byEmail: 'Send by email instead',
      errors: {
        name: 'Enter your first and last name.', email: 'Enter a valid email address.',
        phone: 'Enter a valid phone number.', remark: 'The remark is too long (2,000 characters maximum).',
        consent: 'Tick the box to agree to the processing of your data.',
        cv_type: 'The CV must be a PDF or a Word document (.docx), without macros.',
        cv_size: 'The CV is larger than 5 MB.', job: 'This role is no longer available.',
        rate_limited: 'Too many submissions from your connection. Try again later or send us an email.',
        too_fast: 'Our spam protection blocked the submission. Try again in a few seconds.',
        rejected: 'Our spam protection blocked the submission. Please send us an email instead.',
        server: 'Sending failed. Try again in a moment or send your application by email.',
      },
    },
  }[lang] || null;
  if (!words || !window.fetch || !window.FormData || typeof HTMLDialogElement !== 'function') return;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    // textContent, never innerHTML: job titles come from the feed.
    if (text) node.textContent = text;
    return node;
  }

  function field(label, input, options) {
    var wrapper = el('label', options && options.wide ? 'field-wide' : '');
    wrapper.appendChild(document.createTextNode(label));
    if (input.required) {
      var star = el('span', '', ' *');
      star.setAttribute('aria-hidden', 'true');
      wrapper.appendChild(star);
    }
    if (options && options.hint) {
      var hint = el('span', 'form-hint', options.hint);
      hint.id = 'apply-hint-' + input.name;
      input.setAttribute('aria-describedby', hint.id);
      wrapper.appendChild(hint);
    }
    wrapper.appendChild(input);
    return wrapper;
  }

  function input(name, type, autocomplete, maxLength, required) {
    var node = document.createElement(type === 'textarea' ? 'textarea' : 'input');
    if (type !== 'textarea') node.type = type;
    node.name = name;
    if (autocomplete) node.autocomplete = autocomplete;
    if (maxLength) node.maxLength = maxLength;
    node.required = !!required;
    return node;
  }

  // Built once, on first use.
  var dialog, form, title, subtitle, feedback, submit, done, inputs, current, opener, startedAt;

  function build() {
    dialog = el('dialog', 'apply-dialog');
    dialog.setAttribute('aria-labelledby', 'apply-title');
    var panel = el('div', 'apply-panel');

    var head = el('div', 'apply-head');
    var heading = el('div');
    title = el('h2', '');
    title.id = 'apply-title';
    subtitle = el('p', 'apply-job');
    heading.appendChild(title);
    heading.appendChild(subtitle);
    var closeButton = el('button', 'apply-close', '×');
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', words.close);
    closeButton.addEventListener('click', close);
    head.appendChild(heading);
    head.appendChild(closeButton);
    panel.appendChild(head);

    form = el('form', 'apply-form');
    form.noValidate = true;
    inputs = {
      first_name: input('first_name', 'text', 'given-name', 120, true),
      last_name: input('last_name', 'text', 'family-name', 120, true),
      email: input('email', 'email', 'email', 255, true),
      phone: input('phone', 'tel', 'tel', 40, true),
      cv: input('cv', 'file'),
      remark: input('remark', 'textarea', null, 2000),
      website: input('website', 'text', 'off', 200),
      consent: input('consent', 'checkbox', null, 0, true),
    };
    inputs.cv.accept = '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    inputs.remark.rows = 4;
    inputs.consent.value = 'yes';
    inputs.website.tabIndex = -1;

    feedback = el('p', 'form-feedback error field-wide');
    feedback.setAttribute('role', 'alert');
    feedback.hidden = true;
    form.appendChild(feedback);
    form.appendChild(field(words.firstName, inputs.first_name));
    form.appendChild(field(words.lastName, inputs.last_name));
    form.appendChild(field(words.email, inputs.email));
    form.appendChild(field(words.phone, inputs.phone));
    form.appendChild(field(words.cv, inputs.cv, { wide: true, hint: words.cvHint }));
    form.appendChild(field(words.remark, inputs.remark, { wide: true, hint: words.remarkHint }));

    // Hidden from people (and from screen readers); bots tend to fill every field in.
    var trap = el('div', 'apply-trap');
    trap.setAttribute('aria-hidden', 'true');
    trap.appendChild(field('Website', inputs.website));
    form.appendChild(trap);

    var consent = el('label', 'consent field-wide');
    consent.appendChild(inputs.consent);
    var consentText = el('span');
    consentText.appendChild(document.createTextNode(words.consentBefore));
    var privacy = el('a', '', words.consentLink);
    privacy.href = words.privacy;
    privacy.target = '_blank';
    privacy.rel = 'noopener noreferrer';
    consentText.appendChild(privacy);
    consentText.appendChild(document.createTextNode(words.consentAfter + ' *'));
    consent.appendChild(consentText);
    form.appendChild(consent);

    var actions = el('div', 'apply-actions field-wide');
    submit = el('button', 'btn btn-blue', words.send);
    submit.type = 'submit';
    var cancel = el('button', 'apply-cancel', words.cancel);
    cancel.type = 'button';
    cancel.addEventListener('click', close);
    actions.appendChild(submit);
    actions.appendChild(cancel);
    form.appendChild(actions);
    form.addEventListener('submit', onSubmit);
    panel.appendChild(form);

    done = el('div', 'apply-done');
    done.hidden = true;
    done.setAttribute('role', 'status');
    done.appendChild(el('h3', '', words.doneTitle));
    done.appendChild(el('p', '', words.done));
    var doneClose = el('button', 'btn btn-blue', words.close);
    doneClose.type = 'button';
    doneClose.addEventListener('click', close);
    done.appendChild(doneClose);
    panel.appendChild(done);

    dialog.appendChild(panel);
    dialog.addEventListener('close', function () {
      if (opener && document.contains(opener)) opener.focus();
    });
    document.body.appendChild(dialog);
  }

  function open(link) {
    if (!dialog) build();
    var jobId = link.getAttribute('data-apply-job');
    current = {
      jobId: jobId && /^\d+$/.test(jobId) ? jobId : '',
      jobTitle: link.getAttribute('data-apply-title') || '',
      mailto: link.getAttribute('href') || 'mailto:info@key4nova.com',
    };
    opener = link;
    if (!done.hidden) {
      form.reset();
      done.hidden = true;
      form.hidden = false;
    }
    title.textContent = current.jobId ? words.apply : words.spontaneous;
    subtitle.textContent = current.jobId ? current.jobTitle + ' · ' + words.ref + ' ' + current.jobId : '';
    subtitle.hidden = !current.jobId;
    showError(null);
    startedAt = Date.now();
    dialog.showModal();
    inputs.first_name.focus();
  }

  function close() {
    if (dialog && dialog.open) dialog.close();
  }

  function showError(code, fieldName) {
    Object.keys(inputs).forEach(function (name) { inputs[name].removeAttribute('aria-invalid'); });
    feedback.textContent = '';
    feedback.hidden = !code;
    if (!code) return;
    feedback.appendChild(document.createTextNode(words.errors[code]));
    // When the form cannot help, the email route still can.
    if (['server', 'rate_limited', 'rejected', 'job'].indexOf(code) >= 0) {
      feedback.appendChild(document.createTextNode(' '));
      var mail = el('a', '', words.byEmail);
      mail.href = current.mailto;
      feedback.appendChild(mail);
    }
    var target = fieldName && inputs[fieldName];
    if (target) {
      target.setAttribute('aria-invalid', 'true');
      target.focus();
    } else {
      feedback.setAttribute('tabindex', '-1');
      feedback.focus();
    }
  }

  // What the file really is, from its first bytes: a renamed file is caught here already.
  function cvKind(file) {
    return file.slice(0, 5).arrayBuffer().then(function (buffer) {
      var bytes = new Uint8Array(buffer);
      if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return 'pdf';
      if (bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04 &&
          /\.docx$/i.test(file.name)) return 'docx';
      return null;
    });
  }

  function check() {
    var value = function (name) { return inputs[name].value.trim(); };
    if (!value('first_name')) return Promise.resolve(['name', 'first_name']);
    if (!value('last_name')) return Promise.resolve(['name', 'last_name']);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value('email'))) return Promise.resolve(['email', 'email']);
    var digits = value('phone').replace(/\D/g, '').length;
    if (!/^\+?[0-9 ().\/-]+$/.test(value('phone')) || digits < 6 || digits > 20) {
      return Promise.resolve(['phone', 'phone']);
    }
    if (value('remark').length > 2000) return Promise.resolve(['remark', 'remark']);
    var file = inputs.cv.files && inputs.cv.files[0];
    var cvCheck = !file ? Promise.resolve(null)
      : file.size > MAX_CV_BYTES ? Promise.resolve(['cv_size', 'cv'])
      : cvKind(file).then(function (kind) { return kind ? null : ['cv_type', 'cv']; });
    return cvCheck.then(function (problem) {
      if (problem) return problem;
      if (!inputs.consent.checked) return ['consent', 'consent'];
      return null;
    });
  }

  var FIELD_FOR = { name: 'first_name', email: 'email', phone: 'phone', remark: 'remark',
    consent: 'consent', cv_type: 'cv', cv_size: 'cv' };

  function setSending(sending) {
    submit.disabled = sending;
    submit.textContent = sending ? words.sending : words.send;
    form.setAttribute('aria-busy', sending ? 'true' : 'false');
  }

  function onSubmit(event) {
    event.preventDefault();
    if (submit.disabled) return;
    setSending(true);
    check().then(function (problem) {
      if (problem) {
        setSending(false);
        showError(problem[0], problem[1]);
        return;
      }
      showError(null);
      var data = new FormData(form);
      if (!inputs.cv.files || !inputs.cv.files.length) data.delete('cv');
      data.append('job_id', current.jobId);
      data.append('language', lang);
      data.append('started_at', String(startedAt));
      var wait = Math.max(0, startedAt + MIN_FILL_MS - Date.now());
      setTimeout(function () { send(data); }, wait);
    });
  }

  function send(data) {
    var controller = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (controller) controller.abort(); }, TIMEOUT);
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { apikey: PUBLIC_KEY },
      body: data,
      signal: controller ? controller.signal : undefined,
    })
      .then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (body) {
          if (response.ok && body.ok) return null;
          return (body && body.code) || 'server';
        });
      }, function () { return 'server'; })
      .then(function (code) {
        clearTimeout(timer);
        setSending(false);
        if (code) {
          showError(words.errors[code] ? code : 'server', FIELD_FOR[code]);
          return;
        }
        form.hidden = true;
        done.hidden = false;
        done.querySelector('button').focus();
      });
  }

  // Delegated, so it also covers the cards job-feed.js adds after loading.
  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a[data-apply]');
    if (!link || event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    open(link);
  });
})();
