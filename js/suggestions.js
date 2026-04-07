// ═══════════════════════════════════════
// SMART SUGGESTIONS — Context-aware tips
// ═══════════════════════════════════════

function getSmartSuggestions(city) {
  var tips = [];
  var now = new Date();
  var hour = now.getHours();
  var places = Storage.getPlaces();
  var phase = getTripPhase();
  var cityPlaces = city && city !== 'all'
    ? places.filter(function(p) { return p.city === city && isVisiblePlace(p); })
    : places.filter(isVisiblePlace);

  if (cityPlaces.length === 0) return tips;

  // ── Booking reminders (before trip) ──
  if (phase.phase === 'before') {
    var bState = getBookingState();
    var urgent = BOOKINGS.filter(function(b) { return b.urgency === 'now' && !bState[b.id]; });
    if (urgent.length > 0) {
      var pick = urgent[0];
      tips.push({ icon: '📋', text: pick.title + ' needs booking — sells out in June!', placeId: pick.placeId, color: '#CE2B37' });
    }
  }

  // ── Time-based suggestions ──
  if (hour >= 6 && hour < 10) {
    var coffeeSpots = cityPlaces.filter(function(p) { return autoTag(p).indexOf('quick-bite') !== -1; });
    if (coffeeSpots.length > 0) {
      var pick = coffeeSpots[Math.floor(Math.random() * coffeeSpots.length)];
      tips.push({ icon: '☕', text: 'Morning start — try ' + pick.name, placeId: pick.id, color: '#F97316' });
    }
  } else if (hour >= 11 && hour < 14) {
    var lunch = cityPlaces.filter(function(p) { return p.category === 'dining'; });
    if (lunch.length > 0) {
      var pick = lunch[Math.floor(Math.random() * lunch.length)];
      tips.push({ icon: '🍝', text: 'Lunchtime — try ' + pick.name, placeId: pick.id, color: '#CE2B37' });
    }
  } else if (hour >= 17 && hour < 20) {
    var evening = cityPlaces.filter(function(p) { var t = autoTag(p); return t.indexOf('evening') !== -1 || t.indexOf('romantic') !== -1; });
    if (evening.length > 0) {
      var pick = evening[Math.floor(Math.random() * evening.length)];
      tips.push({ icon: '🌙', text: 'Evening vibes — ' + pick.name + ' is perfect right now', placeId: pick.id, color: '#8B5CF6' });
    }
  } else if (hour >= 20) {
    var dinner = cityPlaces.filter(function(p) { return p.category === 'dining'; });
    if (dinner.length > 0) {
      var pick = dinner[Math.floor(Math.random() * dinner.length)];
      tips.push({ icon: '🍽️', text: 'Dinner time — ' + pick.name + ' awaits', placeId: pick.id, color: '#CE2B37' });
    }
  }

  // ── Closing soon warnings ──
  if (hour >= 14) {
    cityPlaces.forEach(function(p) {
      if (!p.hours_close) return;
      var parts = p.hours_close.split(':').map(Number);
      var closeMin = parts[0] * 60 + (parts[1] || 0);
      var nowMin = hour * 60 + now.getMinutes();
      var remaining = closeMin - nowMin;
      if (remaining > 0 && remaining <= 90) {
        tips.push({ icon: '⚠️', text: p.name + ' closes in ' + remaining + ' min', placeId: p.id, color: '#E8B931' });
      }
    });
  }

  // ── Balance suggestions (during trip) ──
  if (phase.phase === 'during') {
    var landmarks = cityPlaces.filter(function(p) { return p.category === 'landmark'; });
    var dining = cityPlaces.filter(function(p) { return p.category === 'dining'; });

    // Nudge toward food if heavy on landmarks
    if (landmarks.length > 3 && dining.length > 0 && hour >= 12) {
      var pick = dining[Math.floor(Math.random() * dining.length)];
      tips.push({ icon: '🍕', text: 'Enough sightseeing — time for ' + pick.name + '?', placeId: pick.id, color: '#008C45' });
    }

    // Hidden gems nudge
    var gems = cityPlaces.filter(function(p) { return p.verdict === 'hidden-gem'; });
    if (gems.length > 0 && Math.random() > 0.6) {
      var pick = gems[Math.floor(Math.random() * gems.length)];
      tips.push({ icon: '💎', text: 'Hidden gem nearby: ' + pick.name, placeId: pick.id, color: '#8B5CF6' });
    }
  }

  // ── Achievement nudge ──
  var achCounts = Storage.getAchievementCount();
  if (achCounts.unlocked < achCounts.total && Math.random() > 0.7) {
    var state = Storage.getAchievements();
    var locked = ACHIEVEMENTS.filter(function(a) { return !state[a.id] || !state[a.id].unlocked; });
    if (locked.length > 0) {
      var pick = locked[Math.floor(Math.random() * locked.length)];
      tips.push({ icon: '🏆', text: 'Achievement: ' + pick.challenge, color: '#E8B931' });
    }
  }

  // ── Default ──
  if (tips.length === 0) {
    tips.push({ icon: '🇮🇹', text: 'Explore ' + (city || 'Italy') + ' — tap a place to learn more!', color: '#008C45' });
  }

  return tips.slice(0, 3);
}
