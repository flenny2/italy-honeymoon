// ═══════════════════════════════════════
// ROUTER — Hash-based page navigation
// ═══════════════════════════════════════

var Router = (function() {
  var currentPage = null;
  var currentParam = null;

  // Route definitions: hash → { render function name (string), tab to highlight }
  // Uses string names so functions don't need to exist yet at load time
  var routes = {
    'today':       { render: 'renderToday',       tab: 'today' },
    'explore':     { render: 'renderExplore',     tab: 'more' },
    'city':        { render: 'renderCity',        tab: 'more' },
    'place':       { render: 'renderDetail',      tab: 'more' },
    'phrasebook':  { render: 'renderPhrasebook',  tab: 'more' },
    'journal':     { render: 'renderJournal',     tab: 'journal' },
    'letters':     { render: 'renderLetters',     tab: 'letters' },
    'achievements':{ render: 'renderAchievements',tab: 'more' },
    'bookings':    { render: 'renderBookings',    tab: 'more' },
    'capsule':     { render: 'renderCapsule',     tab: 'more' },
    'map':         { render: 'renderFullMap',     tab: 'map' },
    'more':        { render: 'renderMore',        tab: 'more' },
    'settings':    { render: 'renderSettings',    tab: 'more' },
    'stats':       { render: 'renderStats',       tab: 'more' },
  };

  function navigate(hash) {
    if (hash) {
      location.hash = hash;
    } else {
      handleRoute();
    }
  }

  function handleRoute() {
    var hash = location.hash.slice(1) || 'today';
    var parts = hash.split('/');
    var page = parts[0];
    var param = parts[1] || null;

    // Find matching route
    var route = routes[page];
    if (!route) {
      page = 'today';
      route = routes['today'];
    }

    // Hide all pages
    var pages = document.querySelectorAll('.page');
    for (var i = 0; i < pages.length; i++) {
      pages[i].classList.remove('active');
    }

    // Show target page
    var target = document.getElementById('page-' + page);
    if (target) {
      target.classList.add('active');
    }

    // Update tab bar
    var tabs = document.querySelectorAll('.tab-btn');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.toggle('active', tabs[i].dataset.tab === route.tab);
    }

    // Call render function (looked up by name on window at call time)
    currentPage = page;
    currentParam = param;
    if (route.render && typeof window[route.render] === 'function') {
      window[route.render](param);
    }

    // Scroll to top
    if (target) target.scrollTop = 0;
  }

  // Initialize
  function init() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
  }

  return {
    navigate: navigate,
    init: init,
    getCurrentPage: function() { return currentPage; },
    getCurrentParam: function() { return currentParam; }
  };
})();
