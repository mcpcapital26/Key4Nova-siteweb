/*
 * Live job offers from Key4Nova's CRM on the careers pages (/offres/, /nl/vacatures/,
 * /en/careers/). Replaces the page's static "no offers right now" message with the offers
 * recruiters published ("Website: Published" on a job), newest first, in the site's card
 * markup, then asks site.js to rebuild its filters.
 *
 * The feed is a read-only Supabase view (public_job_offers) exposing title, sector, place,
 * contract details and the recruiter-reviewed text per language - never the client.
 * When the feed is empty, unreachable or too slow, the static message stays.
 */
(function () {
  'use strict';

  var FEED_URL = 'https://vouupibtbcxlcuwqrnhq.supabase.co/rest/v1/public_job_offers';
  // Supabase's publishable key: designed to sit in a web page. It can read the published
  // offers and nothing else in the CRM. Never put any other Supabase key in this site.
  var PUBLIC_KEY = 'sb_publishable_rYbBlhO4y_hpiwNG3NggRQ_2ZjCtQVs';
  var EXCERPT = 220;
  var TIMEOUT = 8000;

  var list = document.getElementById('job-list');
  if (!list || !window.fetch) return;

  var lang = document.documentElement.lang || 'fr';
  var words = {
    fr: { via: 'Via Key4Nova', read: 'Lire la suite', apply: 'Postuler', subject: 'Candidature', ref: 'réf.',
          modes: { Remote: 'Télétravail', Hybrid: 'Hybride', 'On-site': 'Sur site' } },
    nl: { via: 'Via Key4Nova', read: 'Meer lezen', apply: 'Solliciteren', subject: 'Sollicitatie', ref: 'ref.',
          modes: { Remote: 'Op afstand', Hybrid: 'Hybride', 'On-site': 'Op locatie' } },
    en: { via: 'Via Key4Nova', read: 'Read more', apply: 'Apply', subject: 'Application', ref: 'ref.',
          modes: {} },
  }[lang] || null;
  if (!words) return;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    // textContent, never innerHTML: the feed is data, not markup.
    if (text) node.textContent = text;
    return node;
  }

  // The reviewed text in the page's language, else another language; texts exist only
  // once someone generated "Job content" for the job in the CRM.
  function textFor(offer) {
    var order = [lang, 'fr', 'nl', 'en'];
    for (var i = 0; i < order.length; i++) {
      var text = offer['text_' + order[i]];
      if (typeof text === 'string' && text.trim()) return text.trim();
    }
    return '';
  }

  function flat(text) {
    return text.replace(/\s+/g, ' ').trim();
  }

  // Short texts keep their line breaks; long ones become a one-paragraph excerpt.
  function excerpt(text) {
    if (flat(text).length <= EXCERPT) return text;
    var cut = flat(text).slice(0, EXCERPT);
    var space = cut.lastIndexOf(' ');
    return (space > 0 ? cut.slice(0, space) : cut) + '…';
  }

  function card(offer) {
    var place = offer.location || offer.region || '';
    var mode = offer.work_mode ? words.modes[offer.work_mode] || offer.work_mode : '';
    var text = textFor(offer);
    var article = el('article', 'offer-card');
    article.setAttribute('data-job-card', '');
    article.dataset.sector = offer.sector || '';
    article.dataset.contract = offer.contract_type || '';
    article.dataset.search = [offer.title, place, offer.sector, offer.contract_type, mode, offer.seniority, text]
      .filter(Boolean).join(' ').toLocaleLowerCase(lang);

    var facts = [place, offer.sector, offer.contract_type, mode].filter(Boolean);
    if (facts.length) {
      var meta = el('div', 'offer-meta');
      facts.forEach(function (fact) { meta.appendChild(el('span', '', fact)); });
      article.appendChild(meta);
    }
    article.appendChild(el('h3', '', offer.title));
    article.appendChild(el('div', 'offer-company', words.via));
    if (text) {
      article.appendChild(el('p', 'offer-excerpt', excerpt(text)));
      if (flat(text).length > EXCERPT) {
        var details = el('details', 'offer-full');
        details.appendChild(el('summary', '', words.read));
        details.appendChild(el('p', 'offer-body', text));
        article.appendChild(details);
      }
    }
    var apply = el('a', 'text-link', words.apply + ' ');
    apply.href = 'mailto:info@key4nova.com?subject=' +
      encodeURIComponent(words.subject + ' – ' + offer.title + ' (' + words.ref + ' ' + offer.id + ')');
    var arrow = el('span', '', '↗');
    arrow.setAttribute('aria-hidden', 'true');
    apply.appendChild(arrow);
    article.appendChild(apply);
    return article;
  }

  function render(offers) {
    if (!Array.isArray(offers)) throw new Error('Unexpected feed');
    offers = offers.filter(function (offer) { return offer && typeof offer.title === 'string' && offer.title; });
    if (!offers.length) return; // keep the static "no offers right now" message
    // Cards are built first, so a bad entry cannot leave the list half emptied.
    var cards = document.createDocumentFragment();
    offers.forEach(function (offer) { cards.appendChild(card(offer)); });
    list.textContent = '';
    list.appendChild(cards);
    document.dispatchEvent(new CustomEvent('key4nova:jobs-updated'));
  }

  function done() {
    list.removeAttribute('aria-busy');
  }

  // Hidden while loading so the static message does not flash before the live offers.
  list.setAttribute('aria-busy', 'true');
  var controller = window.AbortController ? new AbortController() : null;
  var timer = setTimeout(function () {
    if (controller) controller.abort();
    done();
  }, TIMEOUT);

  fetch(FEED_URL + '?select=*&order=published_at.desc', {
    headers: { apikey: PUBLIC_KEY },
    signal: controller ? controller.signal : undefined,
  })
    .then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    })
    .then(render)
    .catch(function () { /* keep the static message */ })
    .then(function () {
      clearTimeout(timer);
      done();
    });
})();
