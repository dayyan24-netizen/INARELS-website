/* ═══════════════════════════════════════════════════════════════
   INARELS — projects.js
   Projects directory: tab filter, grid/list toggle, scroll reveal
   W3Schools-compatible: var, for loops, no arrow functions
   ═══════════════════════════════════════════════════════════════ */

/* ─── Tab Filter ─── */
function initProjectFilter() {
  var tabs     = document.getElementsByClassName("ftab");
  var cards    = document.getElementsByClassName("proj-card");
  var noResult = document.getElementById("no-results");
  var resetBtn = document.getElementById("reset-filter");

  if (!tabs || tabs.length === 0) return;

  for (var t = 0; t < tabs.length; t++) {
    (function(tab) {
      tab.addEventListener("click", function() {
        /* Deactivate all tabs */
        for (var i = 0; i < tabs.length; i++) {
          tabs[i].classList.remove("active");
          tabs[i].setAttribute("aria-selected", "false");
        }
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");

        var filter = tab.getAttribute("data-filter");
        applyFilter(filter, cards, noResult);
      });
    })(tabs[t]);
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", function() {
      for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove("active");
        tabs[i].setAttribute("aria-selected", "false");
      }
      tabs[0].classList.add("active");
      tabs[0].setAttribute("aria-selected", "true");
      applyFilter("all", cards, noResult);
    });
  }
}

function applyFilter(filter, cards, noResult) {
  var visibleCount = 0;
  for (var c = 0; c < cards.length; c++) {
    var card   = cards[c];
    var themes = card.getAttribute("data-themes") || "";
    if (filter === "all" || themes.indexOf(filter) !== -1) {
      card.classList.remove("hidden");
      visibleCount++;
    } else {
      card.classList.add("hidden");
    }
  }
  if (noResult) {
    noResult.style.display = (visibleCount === 0) ? "block" : "none";
  }
}

/* ─── Grid / List View Toggle ─── */
function initViewToggle() {
  var gridBtn  = document.getElementById("view-grid");
  var listBtn  = document.getElementById("view-list");
  var grid     = document.getElementById("proj-grid");

  if (!gridBtn || !listBtn || !grid) return;

  gridBtn.addEventListener("click", function() {
    grid.classList.remove("list-view");
    gridBtn.classList.add("active");
    listBtn.classList.remove("active");
  });

  listBtn.addEventListener("click", function() {
    grid.classList.add("list-view");
    listBtn.classList.add("active");
    gridBtn.classList.remove("active");
  });
}

/* ─── Map marker tooltips (simple title-based) ─── */
function initMapMarkers() {
  var markers = document.getElementsByClassName("map-marker");
  for (var i = 0; i < markers.length; i++) {
    var marker  = markers[i];
    var project = marker.getAttribute("data-project");
    if (project) {
      marker.style.cursor = "pointer";
      (function(m, p) {
        m.setAttribute("title", p);
      })(marker, project);
    }
  }
}

/* ─── Scroll reveal for project cards ─── */
function initScrollReveal() {
  var cards = document.getElementsByClassName("proj-card");
  if (!cards || cards.length === 0) return;

  for (var i = 0; i < cards.length; i++) {
    cards[i].style.opacity    = "0";
    cards[i].style.transform  = "translateY(24px)";
    cards[i].style.transition = "opacity 0.55s ease, transform 0.55s ease";
  }

  function checkCards() {
    var windowH = window.innerHeight;
    for (var j = 0; j < cards.length; j++) {
      if (cards[j].classList.contains("hidden")) continue;
      var rect = cards[j].getBoundingClientRect();
      if (rect.top < windowH - 60) {
        cards[j].style.opacity   = "1";
        cards[j].style.transform = "translateY(0)";
      }
    }
  }

  window.addEventListener("scroll", checkCards);
  checkCards();
}

/* ─── Boot ─── */
document.addEventListener("DOMContentLoaded", function() {
  initProjectFilter();
  initViewToggle();
  initMapMarkers();
  initScrollReveal();
});
