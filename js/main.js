/* ═══════════════════════════════════════════════════════════════
   INARELS — main.js
   W3Schools-compatible: var, for loops, no arrow functions,
   no template literals, no const/let, no forEach
   ═══════════════════════════════════════════════════════════════ */

/* ─── Navbar scroll behavior ─── */
function initNavbar() {
  var header = document.getElementById("site-header");
  if (!header) return;

  function onScroll() {
    if (window.pageYOffset > 60) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }
  window.addEventListener("scroll", onScroll);
  onScroll();
}

/* ─── Mobile nav toggle ─── */
function initMobileNav() {
  var toggle = document.getElementById("nav-toggle");
  var nav    = document.getElementById("main-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", function() {
    nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", nav.classList.contains("open") ? "true" : "false");
  });

  /* Close when a link is clicked */
  var links = nav.getElementsByTagName("a");
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener("click", function() {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  }
}

/* ─── Hero Slider ─── */
var sliderTimer   = null;
var progressTimer = null;
var currentSlide  = 0;
var SLIDE_DURATION = 6000; /* ms per slide */
var progressStart  = 0;
var slides, dots, progressBar;

function initSlider() {
  slides      = document.getElementsByClassName("slide");
  dots        = document.getElementsByClassName("dot");
  progressBar = document.getElementById("slider-progress");

  if (!slides || slides.length === 0) return;

  var prevBtn = document.getElementById("arrow-prev");
  var nextBtn = document.getElementById("arrow-next");

  if (prevBtn) {
    prevBtn.addEventListener("click", function() {
      var prev = (currentSlide - 1 + slides.length) % slides.length;
      goToSlide(prev);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", function() {
      var next = (currentSlide + 1) % slides.length;
      goToSlide(next);
    });
  }

  /* Dot clicks */
  for (var d = 0; d < dots.length; d++) {
    (function(index) {
      dots[index].addEventListener("click", function() {
        goToSlide(index);
      });
    })(d);
  }

  /* Keyboard navigation */
  document.addEventListener("keydown", function(e) {
    if (e.key === "ArrowLeft") {
      goToSlide((currentSlide - 1 + slides.length) % slides.length);
    } else if (e.key === "ArrowRight") {
      goToSlide((currentSlide + 1) % slides.length);
    }
  });

  startAutoplay();
}

function goToSlide(index) {
  if (index === currentSlide) return;

  /* Remove active from current */
  slides[currentSlide].classList.remove("active");
  if (dots[currentSlide]) dots[currentSlide].classList.remove("active");

  currentSlide = index;

  /* Activate new */
  slides[currentSlide].classList.add("active");
  if (dots[currentSlide]) dots[currentSlide].classList.add("active");

  resetAutoplay();
}

function startAutoplay() {
  clearTimeout(sliderTimer);
  clearInterval(progressTimer);
  startProgressBar();
  sliderTimer = setTimeout(function() {
    goToSlide((currentSlide + 1) % slides.length);
  }, SLIDE_DURATION);
}

function resetAutoplay() {
  clearTimeout(sliderTimer);
  clearInterval(progressTimer);
  startProgressBar();
  sliderTimer = setTimeout(function() {
    goToSlide((currentSlide + 1) % slides.length);
  }, SLIDE_DURATION);
}

function startProgressBar() {
  if (!progressBar) return;
  progressBar.style.width = "0%";
  progressBar.style.transition = "none";
  progressStart = Date.now();

  clearInterval(progressTimer);
  progressTimer = setInterval(function() {
    var elapsed = Date.now() - progressStart;
    var pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
    progressBar.style.width = pct + "%";
    if (pct >= 100) {
      clearInterval(progressTimer);
    }
  }, 50);
}

/* ─── Project Tab Filtering ─── */
function initProjectTabs() {
  var tabs      = document.getElementsByClassName("ptab");
  var cards     = document.getElementsByClassName("project-card");
  if (!tabs || tabs.length === 0) return;

  for (var t = 0; t < tabs.length; t++) {
    (function(tab) {
      tab.addEventListener("click", function() {
        /* Remove active from all tabs */
        for (var i = 0; i < tabs.length; i++) {
          tabs[i].classList.remove("active");
          tabs[i].setAttribute("aria-selected", "false");
        }
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");

        var filter = tab.getAttribute("data-filter");
        filterCards(filter, cards);
      });
    })(tabs[t]);
  }
}

function filterCards(filter, cards) {
  for (var c = 0; c < cards.length; c++) {
    var card  = cards[c];
    var theme = card.getAttribute("data-theme") || "";
    if (filter === "all" || theme.indexOf(filter) !== -1) {
      card.classList.remove("hidden");
    } else {
      card.classList.add("hidden");
    }
  }
}

/* ─── Scroll-triggered fade-in animations ─── */
function initScrollReveal() {
  var targets = document.querySelectorAll(
    ".feature-card, .project-card, .stat-item, .section-intro"
  );
  if (!targets || targets.length === 0) return;

  /* Add base hidden state */
  for (var i = 0; i < targets.length; i++) {
    targets[i].style.opacity = "0";
    targets[i].style.transform = "translateY(28px)";
    targets[i].style.transition = "opacity 0.6s ease, transform 0.6s ease";
  }

  function checkVisibility() {
    var windowHeight = window.innerHeight;
    for (var j = 0; j < targets.length; j++) {
      var rect = targets[j].getBoundingClientRect();
      if (rect.top < windowHeight - 80) {
        targets[j].style.opacity = "1";
        targets[j].style.transform = "translateY(0)";
      }
    }
  }

  window.addEventListener("scroll", checkVisibility);
  checkVisibility();
}

/* ─── Boot ─── */
document.addEventListener("DOMContentLoaded", function() {
  initNavbar();
  initMobileNav();
  initSlider();
  initProjectTabs();
  initScrollReveal();
});
