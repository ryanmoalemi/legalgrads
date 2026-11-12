/* Claimed-profile layer for static attorney pages.
 * Shows owner edits (remote when /js/supabase-public.js exists, plus edits saved in this browser),
 * the request form for verified claims, and first-party cookieless counts for the owner's private stats. */
(function () {
  var KEY = 'legalgrads-owner-claims';
  var NAMES = {
    contracts: 'Contracts',
    'start-a-business': 'Start a Business',
    'real-estate': 'Real Estate',
    employment: 'Employment',
    'intellectual-property': 'Intellectual Property',
    'estate-planning': 'Estate Planning',
    'family-law': 'Family Law',
    'consumer-rights': 'Consumer Rights',
  };
  var BILLING = { hourly: 'Hourly', fixed: 'Fixed fee', quoted: 'Quoted per project' };
  var MODES = { phone: 'Phone', video: 'Video', 'in-person': 'In person' };
  var AVAIL = { accepting: 'Taking new clients', limited: 'Limited availability', not: 'Not taking new clients' };
  var NOTICE = 'Send a brief description only. Do not include confidential details or documents. Sending a request does not by itself hire a lawyer. The lawyer must confirm availability, check for conflicts, and agree to represent you.';
  var UNCLAIMED = /unclaimed|not yet claimed/i;
  var BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|embedly/i;
  var path = location.pathname.endsWith('/') ? location.pathname : location.pathname + '/';
  var FIELDS = ['bio', 'services', 'phone', 'contactLink', 'photoDataUrl', 'consultFee', 'consultPrice', 'availability', 'availabilityUpdatedAt', 'contactPref'];
  var LISTS = ['practiceAreas', 'serviceList', 'clientTypes', 'consultModes', 'billing', 'fixedFees'];

  function readLocal() {
    try {
      var all = JSON.parse(localStorage.getItem(KEY) || '{}');
      return all && all[path] ? all[path] : null;
    } catch (error) {
      return null;
    }
  }

  function merge(remote, local) {
    if (!remote && !local) return null;
    var claim = {};
    var source = remote || {};
    FIELDS.forEach(function (field) { claim[field] = source[field] || ''; });
    LISTS.forEach(function (field) { claim[field] = Array.isArray(source[field]) ? source[field] : []; });
    claim.inquiriesEnabled = source.inquiriesEnabled !== false;
    if (!local) return claim;
    FIELDS.forEach(function (field) { if (local[field]) claim[field] = local[field]; });
    LISTS.forEach(function (field) { if (Array.isArray(local[field]) && local[field].length) claim[field] = local[field]; });
    if (local.inquiriesEnabled === false) claim.inquiriesEnabled = false;
    return claim;
  }

  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (name) { node.setAttribute(name, attrs[name]); });
    if (text) node.textContent = text;
    return node;
  }

  function addText(parent, value) {
    parent.appendChild(el('p', {}, value));
  }

  function shortDate(iso) {
    var date = new Date(iso);
    if (!iso || isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/Los_Angeles' });
  }

  function setFact(id, label, value) {
    var list = document.querySelector('.lgp .facts');
    if (!list || !value) return;
    var row = document.getElementById(id);
    if (!row) {
      row = el('li', { id: id });
      row.appendChild(el('span', {}, label));
      row.appendChild(el('span', {}));
      list.appendChild(row);
    }
    row.lastChild.textContent = value;
  }

  function setClaimState(text, about) {
    var state = document.getElementById('claim-state');
    if (state) state.textContent = text;
    var line = document.getElementById('about-claim');
    if (line && about) line.textContent = about;
  }

  function track(kind) {
    var cfg = window.LEGALGRADS_SUPABASE;
    if (!cfg || !cfg.url || !cfg.key || navigator.webdriver || BOT.test(navigator.userAgent || '') || readLocal()) return;
    try {
      fetch(String(cfg.url).replace(/\/$/, '') + '/rest/v1/rpc/record_profile_event', {
        method: 'POST',
        keepalive: true,
        headers: { 'content-type': 'application/json', apikey: cfg.key, authorization: 'Bearer ' + cfg.key },
        body: JSON.stringify({ p_path: path, p_kind: kind }),
      }).catch(function () {});
    } catch (error) { /* counting never blocks the page */ }
  }

  function markClaimed(verified) {
    var chip = document.querySelector('.lgp .chip.solid');
    if (chip && UNCLAIMED.test(chip.textContent || '')) chip.textContent = verified ? 'Claimed profile' : 'Claim pending review';
    setClaimState(verified ? 'Yes' : 'Pending review', verified
      ? 'The attorney has claimed this profile on LegalGrads.'
      : 'A claim for this profile is pending review.');
    // Claimed or pending, the record already has a claim, so the claim card and its steps go away.
    ['.lgp .card.claim', '#example-slot', '#claim-benefits'].forEach(function (selector) {
      var node = document.querySelector(selector);
      if (node) node.hidden = true;
    });
    var aside = document.querySelector('.lgp aside');
    if (!verified && aside && !document.getElementById('claim-pending')) {
      var pending = el('div', { class: 'card', id: 'claim-pending', 'data-testid': 'claim-pending' });
      pending.appendChild(el('h2', {}, 'Claim pending review'));
      pending.appendChild(el('p', {}, 'A claim for this profile was submitted and is being checked against the official licensing record. Details on this page stay as published until the check is done.'));
      aside.insertBefore(pending, aside.firstChild);
    }
    // Someone already claimed this record, so the header action goes to the generic lookup instead.
    var headerClaim = document.querySelector('.lg-header a.lg-btn');
    if (headerClaim) headerClaim.setAttribute('href', '/claim/');
    var host = document.querySelector('.lgp aside');
    if (!host || document.getElementById('report-claim')) return;
    var p = el('p', { class: 'small', id: 'report-claim' });
    var a = el('a', { href: '/claim/?profile=' + encodeURIComponent(path) + '&report=1' }, "This isn't me? Report a wrong claim");
    p.appendChild(a);
    host.appendChild(p);
  }

  function actionLabel(claim) {
    return claim.consultModes && claim.consultModes.length ? 'Request a consultation' : 'Ask about your legal needs';
  }

  function inquiryForm(cfg, firstName, claim) {
    var card = el('div', { class: 'card', id: 'inquiry' });
    var h1 = document.querySelector('.lgp h1');
    card.appendChild(el('h2', {}, actionLabel(claim)));
    card.appendChild(el('p', { class: 'small', 'data-testid': 'inquiry-recipient' }, 'Your request is emailed to ' + (h1 ? h1.textContent : firstName) + ', who replies to you directly. LegalGrads does not keep a copy.'));
    card.appendChild(el('p', { class: 'note', 'data-testid': 'inquiry-notice' }, NOTICE));
    var form = el('form', { 'data-testid': 'inquiry-form', novalidate: '' });
    var started = Date.now();
    function field(label, name, type, required) {
      var wrap = el('label', { class: 'field' }, label + (required ? '' : ' (optional)'));
      var input = type === 'textarea' ? el('textarea', { name: name, rows: '4', maxlength: '1000' }) : el('input', { name: name, type: type, maxlength: '200' });
      if (required) input.required = true;
      if (name === 'email') input.setAttribute('autocomplete', 'email');
      if (name === 'name') input.setAttribute('autocomplete', 'name');
      wrap.appendChild(input);
      form.appendChild(wrap);
      return input;
    }
    var name = field('Your name', 'name', 'text', true);
    var email = field('Your email', 'email', 'email', true);
    var phone = field('Phone', 'phone', 'tel', false);
    var business = field('Business name', 'business', 'text', false);
    var message = field('What do you need help with?', 'message', 'textarea', true);
    var trap = el('div', { class: 'trap', 'aria-hidden': 'true' });
    var trapInput = el('input', { name: 'website', type: 'text', tabindex: '-1', autocomplete: 'off' });
    trap.appendChild(trapInput);
    form.appendChild(trap);
    var button = el('button', { type: 'submit', class: 'btn pink' }, 'Send request');
    form.appendChild(button);
    var status = el('p', { class: 'small', role: 'status', 'data-testid': 'inquiry-status' });
    form.appendChild(status);
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      status.textContent = '';
      status.className = 'small';
      if (!name.value.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim()) || message.value.trim().length < 20) {
        status.className = 'small err';
        status.textContent = 'Add your name, a valid email, and a sentence or two about what you need.';
        return;
      }
      button.disabled = true;
      button.textContent = 'Sending…';
      fetch(String(cfg.url).replace(/\/$/, '') + '/functions/v1/owner-tools', {
        method: 'POST',
        headers: { 'content-type': 'application/json', apikey: cfg.key, authorization: 'Bearer ' + cfg.key },
        body: JSON.stringify({ action: 'inquiry', profilePath: path, name: name.value, email: email.value, phone: phone.value, business: business.value, message: message.value, website: trapInput.value, startedAt: started }),
      }).then(function (response) { return response.json(); }).then(function (data) {
        if (data && data.ok) {
          form.replaceWith(el('p', { 'data-testid': 'inquiry-sent' }, 'Sent. ' + firstName + ' will reply by email if they can help. Nothing is agreed until they confirm.'));
          return;
        }
        button.disabled = false;
        button.textContent = 'Send request';
        status.className = 'small err';
        status.textContent = (data && data.message) || 'We could not send your request. Try again in a few minutes.';
      }).catch(function () {
        button.disabled = false;
        button.textContent = 'Send request';
        status.className = 'small err';
        status.textContent = 'We could not send your request. Check your connection and try again.';
      });
    });
    card.appendChild(form);
    return card;
  }

  function contactCard(claim, cfg, verified) {
    var aside = document.querySelector('.lgp aside');
    if (!aside || document.getElementById('owner-contact')) return;
    var h1 = document.querySelector('.lgp h1');
    var firstName = h1 ? (h1.textContent || '').split(' ')[0] : 'The attorney';
    var box = el('div', { id: 'owner-contact' });
    var digits = String(claim.phone || '').replace(/\D/g, '');
    var hasLink = typeof claim.contactLink === 'string' && /^https:\/\/\S+$/.test(claim.contactLink);
    if (digits.length >= 10 || hasLink) {
      var card = el('div', { class: 'card' });
      card.appendChild(el('h2', {}, 'Contact ' + firstName));
      if (digits.length >= 10) {
        var tel = el('a', { class: 'btn out', href: 'tel:' + digits, 'data-testid': 'owner-phone-link' }, claim.phone);
        tel.addEventListener('click', function () { track('phone_click'); });
        card.appendChild(tel);
      }
      if (hasLink) {
        var site = el('a', { class: 'btn out', href: claim.contactLink, rel: 'nofollow noopener', target: '_blank', 'data-testid': 'owner-website-link' }, 'Visit website');
        site.addEventListener('click', function () { track('website_click'); });
        card.appendChild(site);
      }
      box.appendChild(card);
    }
    if (verified && cfg && claim.inquiriesEnabled !== false) box.insertBefore(inquiryForm(cfg, firstName, claim), claim.contactPref === 'inquiry' || !claim.contactPref ? box.firstChild : null);
    aside.insertBefore(box, aside.firstChild);
    var sticky = document.querySelector('.lgp .sticky a');
    if (verified && sticky) {
      if (document.getElementById('inquiry')) {
        sticky.textContent = actionLabel(claim);
        sticky.setAttribute('href', '#inquiry');
      } else if (digits.length >= 10) {
        sticky.textContent = 'Call ' + firstName;
        sticky.setAttribute('href', 'tel:' + digits);
      } else if (hasLink) {
        sticky.textContent = 'Visit website';
        sticky.setAttribute('href', claim.contactLink);
      }
    }
  }

  function apply(claim, opts) {
    if (!claim) return;
    var verified = Boolean(opts && opts.verified);
    var chip = document.querySelector('.lgp .chip.solid');
    if (!verified) {
      if (chip && UNCLAIMED.test(chip.textContent || '')) chip.textContent = 'Claimed on this device';
      setClaimState('On this device', '');
    }
    var host = document.querySelector('.lgp .grid > div');
    if (!host || document.getElementById('owner-edit')) return;
    var card = el('div', { class: 'card', id: 'owner-edit' });
    card.appendChild(el('h2', {}, 'From this attorney'));
    if (claim.bio) addText(card, claim.bio);
    var services = (claim.serviceList || []).slice();
    if (services.length) {
      card.appendChild(el('h3', {}, 'Services'));
      var list = el('ul', { class: 'list' });
      services.forEach(function (item) { list.appendChild(el('li', {}, item)); });
      card.appendChild(list);
    }
    if (claim.services) addText(card, (services.length ? 'Also: ' : 'Services: ') + claim.services);
    if (claim.clientTypes && claim.clientTypes.length) addText(card, 'Works with: ' + claim.clientTypes.join(', '));
    if (claim.practiceAreas && claim.practiceAreas.length) {
      addText(card, 'Practice areas: ' + claim.practiceAreas.map(function (slug) {
        return NAMES[slug] || slug;
      }).join(', '));
    }
    var fixed = (claim.billing || []).indexOf('fixed') >= 0 ? (claim.fixedFees || []) : [];
    if (fixed.length) {
      card.appendChild(el('h3', {}, 'Fixed fees'));
      var fees = el('ul', { class: 'list', 'data-testid': 'owner-fixed-fees' });
      fixed.forEach(function (fee) { fees.appendChild(el('li', {}, fee.service + ': ' + fee.price)); });
      card.appendChild(fees);
    }
    // Pending or empty claims have nothing approved to show, so no empty "From this attorney" card.
    if (card.childNodes.length > 1) host.insertBefore(card, host.firstChild);
    var billing = (claim.billing || []).map(function (value) { return BILLING[value]; }).filter(Boolean);
    // Fees show only when the attorney supplied them.
    if (billing.length) setFact('fees-state', 'Fees', billing.join(', '));
    var modes = (claim.consultModes || []).map(function (value) { return MODES[value]; }).filter(Boolean);
    var fee = claim.consultFee === 'free' ? 'Free' : claim.consultFee === 'paid' ? ('Paid' + (claim.consultPrice ? ' (' + claim.consultPrice + ')' : '')) : '';
    if (modes.length || fee) setFact('fact-consult', 'Consultations', [fee, modes.join(', ')].filter(Boolean).join(' · '));
    if (AVAIL[claim.availability]) setFact('fact-availability', 'Availability', AVAIL[claim.availability] + (claim.availabilityUpdatedAt ? ' (updated ' + shortDate(claim.availabilityUpdatedAt) + ')' : ''));
    contactCard(claim, opts && opts.cfg, verified);
    if (typeof claim.photoDataUrl === 'string' && claim.photoDataUrl.indexOf('data:image/') === 0) {
      var avatar = document.querySelector('.lgp .avatar');
      if (avatar) {
        var img = document.createElement('img');
        img.className = 'avatar';
        img.alt = 'Profile photo';
        img.src = claim.photoDataUrl;
        avatar.replaceWith(img);
      }
    }
  }

  function remoteThen(local) {
    var cfg = window.LEGALGRADS_SUPABASE;
    if (!cfg || !cfg.url || !cfg.key) {
      apply(local);
      return;
    }
    track('view');
    fetch(String(cfg.url).replace(/\/$/, '') + '/functions/v1/owner-tools', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        apikey: cfg.key,
        authorization: 'Bearer ' + cfg.key,
      },
      body: JSON.stringify({ action: 'public', profilePath: path }),
    }).then(function (response) {
      return response.json();
    }).then(function (data) {
      var verified = Boolean(data && data.claimed && data.verified);
      if (data && data.claimed) markClaimed(verified);
      apply(merge(data && data.edit, local), { verified: verified, cfg: cfg });
    }).catch(function () {
      apply(local);
    });
  }

  // Clearly labeled example of a finished profile. Same markup on every page, so it lives here
  // instead of in 55k HTML files. Nothing in it is about the attorney on the page.
  var EXAMPLE = "<section class=\"card example\" id=\"example-profile\" aria-labelledby=\"example-h\"><div class=\"ex-top\"><h2 id=\"example-h\">See what your free profile can include</h2><span class=\"ex-tag\">Example profile</span></div><p class=\"small ex-note\">This is a made-up example to show the layout. It is not this attorney and not a real LegalGrads lawyer.</p><div class=\"ex-card\"><div class=\"ex-id\"><img class=\"ex-photo\" src=\"/images/examples/example-profile-headshot-v3-192.webp\" srcset=\"/images/examples/example-profile-headshot-v3-192.webp 1x, /images/examples/example-profile-headshot-v3-384.webp 2x\" width=\"96\" height=\"96\" loading=\"lazy\" alt=\"Example profile photo (stock model)\"><div><p class=\"ex-name\">Jordan Example</p><p class=\"ex-head\">Business and contracts attorney \u00b7 Example City</p><span class=\"ex-pill\">Taking new clients</span></div></div><div class=\"ex-grid\"><div><h3>About</h3><p>I help small business owners set up their companies and get contracts right the first time. Plain English, quick replies, and clear prices.</p></div><div><h3>Services</h3><ul class=\"ex-list\"><li>LLC formation and operating agreements</li><li>Contract review before you sign</li><li>Demand and collection letters</li></ul></div><div><h3>Consultation and fees</h3><ul class=\"ex-list\"><li>Free 15-minute consultation by phone or video</li><li>Fixed fee: LLC setup $650</li><li>Fixed fee: contract review $300</li></ul></div><div><h3>Contact options</h3><div class=\"ex-btns\" aria-hidden=\"true\"><span class=\"ex-btn pink\">Request a consultation</span><span class=\"ex-btn\">Call</span><span class=\"ex-btn\">Visit website</span></div><p class=\"small\">Clients reach you directly. LegalGrads takes no fee.</p></div></div></div><p class=\"ex-credit\">Example photo: Mikhail Nilov on <a href=\"https://www.pexels.com/photo/a-man-in-blue-suit-smiling-while-holding-his-notebook-7582898/\" target=\"_blank\" rel=\"nofollow noopener\">Pexels</a> (stock model).</p></section>";
  // The example photo follows the first name on the page: a clearly female or male name (90%+
  // one sex in SSA baby-name data, see scripts/build_example_names.py) gets a matching photo,
  // anything else gets the neutral one.
  var EXAMPLE_PHOTOS = {
    m: { file: 'v3', name: 'Michael Example', by: 'Mikhail Nilov', href: 'https://www.pexels.com/photo/a-man-in-blue-suit-smiling-while-holding-his-notebook-7582898/' },
    f: { file: 'f1', name: 'Sarah Example', by: 'RDNE Stock project', href: 'https://www.pexels.com/photo/a-portrait-of-a-woman-wearing-a-blazer-7648247/' },
    n: { file: 'n1', name: 'Jordan Example', by: 'MART PRODUCTION', href: 'https://www.pexels.com/photo/serious-woman-wearing-a-blazer-7223011/' },
  };
  function firstName() {
    var h = document.querySelector('.who h1') || document.querySelector('h1');
    var parts = ((h && h.textContent) || '').trim().split(/\s+/);
    for (var i = 0; i < parts.length; i++) {
      var t = parts[i].normalize ? parts[i].normalize('NFKD').replace(/[\u0300-\u036f]/g, '') : parts[i];
      t = t.toLowerCase().replace(/[^a-z'-]/g, '');
      if (t.length > 1 && !/\.$/.test(parts[i])) return t.split('-')[0];
    }
    return '';
  }
  function exampleFor(kind) {
    var ph = EXAMPLE_PHOTOS[kind] || EXAMPLE_PHOTOS.n;
    return EXAMPLE
      .split('example-profile-headshot-v3-').join('example-profile-headshot-' + ph.file + '-')
      .replace('>Jordan Example<', '>' + ph.name + '<')
      .replace(/Example photo: [^<]* on <a href="[^"]*"/, 'Example photo: ' + ph.by + ' on <a href="' + ph.href + '"');
  }
  function drawExample() {
    var slot = document.getElementById('example-slot');
    if (!slot || document.getElementById('example-profile')) return;
    var name = firstName();
    var done = false;
    function draw(kind) {
      if (done || document.getElementById('example-profile')) return;
      done = true;
      slot.innerHTML = exampleFor(kind);
    }
    if (!name || !window.fetch) { draw('n'); return; }
    fetch('/data/example-names.json').then(function (r) { return r.json(); }).then(function (lists) {
      var pad = ',' + name + ',';
      draw((',' + lists.f + ',').indexOf(pad) >= 0 ? 'f' : (',' + lists.m + ',').indexOf(pad) >= 0 ? 'm' : 'n');
    }).catch(function () { draw('n'); });
  }
  drawExample();

  var local = readLocal();
  if (window.LEGALGRADS_SUPABASE) {
    remoteThen(local);
    return;
  }
  var script = document.createElement('script');
  script.src = '/js/supabase-public.js';
  script.onload = function () { remoteThen(local); };
  script.onerror = function () { apply(local); };
  document.head.appendChild(script);
})();
