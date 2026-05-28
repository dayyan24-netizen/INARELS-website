/* ═══════════════════════════════════════════════════════════════
   INARELS — about.js
   Subnav active state highlighting as user scrolls
   W3Schools-compatible: var, for loops, no arrow functions
   ═══════════════════════════════════════════════════════════════ */

function initSubnav() {
  var subnav = document.querySelector(".about-subnav");
  if (!subnav) return;

  var links   = subnav.getElementsByTagName("a");
  var targets = [];

  /* Build list of target sections */
  for (var i = 0; i < links.length; i++) {
    var href = links[i].getAttribute("href");
    if (href && href.indexOf("#") === 0) {
      var section = document.querySelector(href);
      if (section) {
        targets.push({ link: links[i], section: section });
      }
    }
  }

  function updateActive() {
    var scrollY      = window.pageYOffset;
    var windowHeight = window.innerHeight;
    var activeIndex  = 0;

    for (var j = 0; j < targets.length; j++) {
      var top = targets[j].section.getBoundingClientRect().top + scrollY;
      if (scrollY >= top - windowHeight / 3) {
        activeIndex = j;
      }
    }

    for (var k = 0; k < targets.length; k++) {
      if (k === activeIndex) {
        targets[k].link.classList.add("active");
      } else {
        targets[k].link.classList.remove("active");
      }
    }
  }

  window.addEventListener("scroll", updateActive);
  updateActive();
}

/* ─── Smooth scroll for subnav anchor links ─── */
function initSmoothScroll() {
  var links = document.querySelectorAll(".about-subnav a");
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener("click", function(e) {
      var href = this.getAttribute("href");
      if (href && href.indexOf("#") === 0) {
        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          var offset     = 88; /* navbar height */
          var targetTop  = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: targetTop, behavior: "smooth" });
        }
      }
    });
  }
}

/* ─── Boot ─── */
document.addEventListener("DOMContentLoaded", function() {
  initSubnav();
  initSmoothScroll();
});
