/* Shows owner edits saved in this browser. Remote edits load only when /js/supabase-public.js exists. */
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
  var path = location.pathname.endsWith('/') ? location.pathname : location.pathname + '/';

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
    claim.bio = source.bio || '';
    claim.services = source.services || '';
    claim.phone = source.phone || '';
    claim.contactLink = source.contactLink || '';
    claim.photoDataUrl = source.photoDataUrl || '';
    claim.practiceAreas = source.practiceAreas || [];
    if (!local) return claim;
    ['bio', 'services', 'phone', 'contactLink', 'photoDataUrl'].forEach(function (field) {
      if (local[field]) claim[field] = local[field];
    });
    if (local.practiceAreas && local.practiceAreas.length) claim.practiceAreas = local.practiceAreas;
    return claim;
  }

  function addText(parent, value) {
    var p = document.createElement('p');
    p.textContent = value;
    parent.appendChild(p);
  }

  function apply(claim) {
    if (!claim) return;
    var chip = document.querySelector('.lgp .chip.solid');
    if (chip && /unclaimed/i.test(chip.textContent || '')) chip.textContent = 'Claimed on this device';
    var host = document.querySelector('.lgp .grid > div');
    if (!host || document.getElementById('owner-edit')) return;
    var card = document.createElement('div');
    card.className = 'card';
    card.id = 'owner-edit';
    var title = document.createElement('h2');
    title.textContent = 'From this attorney';
    card.appendChild(title);
    if (claim.bio) addText(card, claim.bio);
    if (claim.services) addText(card, 'Services: ' + claim.services);
    if (claim.practiceAreas && claim.practiceAreas.length) {
      addText(card, 'Practice areas: ' + claim.practiceAreas.map(function (slug) {
        return NAMES[slug] || slug;
      }).join(', '));
    }
    if (typeof claim.contactLink === 'string' && /^https:\/\/\S+$/.test(claim.contactLink)) {
      var link = document.createElement('a');
      link.href = claim.contactLink;
      link.rel = 'nofollow noopener';
      link.target = '_blank';
      link.textContent = 'Website';
      card.appendChild(link);
    }
    var digits = String(claim.phone || '').replace(/\D/g, '');
    if (digits.length >= 10) addText(card, claim.phone);
    host.insertBefore(card, host.firstChild);
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
    fetch(String(cfg.url).replace(/\/$/, '') + '/functions/v1/claim-notify', {
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
      apply(merge(data && data.edit, local));
    }).catch(function () {
      apply(local);
    });
  }

  var local = readLocal();
  var script = document.createElement('script');
  script.src = '/js/supabase-public.js';
  script.onload = function () { remoteThen(local); };
  script.onerror = function () { apply(local); };
  document.head.appendChild(script);
})();
