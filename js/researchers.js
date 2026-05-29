/* ═══════════════════════════════════════════════════════════════
   INARELS — researchers.js
   Region filter, form validation, scroll reveal
   W3Schools-compatible: var, for loops, no arrow functions
   ═══════════════════════════════════════════════════════════════ */

/* ─── Region Filter ─── */
function initRegionFilter() {
  var filters   = document.getElementsByClassName("rfil");
  var cards1    = document.getElementById("researchers-grid");
  var cards2    = document.getElementById("researchers-grid-2");
  var noResult  = document.getElementById("researchers-no-results");
  var resetBtn  = document.getElementById("reset-rfil");

  if (!filters || filters.length === 0) return;

  for (var i = 0; i < filters.length; i++) {
    (function(btn) {
      btn.addEventListener("click", function() {
        for (var j = 0; j < filters.length; j++) {
          filters[j].classList.remove("active");
        }
        btn.classList.add("active");
        var region = btn.getAttribute("data-filter");
        applyRegionFilter(region, cards1, cards2, noResult);
      });
    })(filters[i]);
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", function() {
      for (var k = 0; k < filters.length; k++) {
        filters[k].classList.remove("active");
      }
      filters[0].classList.add("active");
      applyRegionFilter("all", cards1, cards2, noResult);
    });
  }
}

function applyRegionFilter(region, grid1, grid2, noResult) {
  var allCards = [];
  if (grid1) {
    var c1 = grid1.getElementsByClassName("researcher-card");
    for (var i = 0; i < c1.length; i++) { allCards.push(c1[i]); }
  }
  if (grid2) {
    var c2 = grid2.getElementsByClassName("researcher-card");
    for (var j = 0; j < c2.length; j++) { allCards.push(c2[j]); }
  }

  var visible = 0;
  for (var k = 0; k < allCards.length; k++) {
    var card       = allCards[k];
    var cardRegion = card.getAttribute("data-region") || "";
    if (region === "all" || cardRegion === region) {
      card.classList.remove("hidden");
      visible++;
    } else {
      card.classList.add("hidden");
    }
  }

  if (noResult) {
    noResult.style.display = (visible === 0) ? "block" : "none";
  }
}

/* ─── Form Validation & Submission ─── */
function initJoinForm() {
  var form       = document.getElementById("join-form");
  var submitBtn  = document.getElementById("form-submit-btn");
  var successMsg = document.getElementById("form-success");
  var errorMsg   = document.getElementById("form-error-msg");

  if (!form || !submitBtn) return;

  form.addEventListener("submit", function(e) {
    e.preventDefault();

    /* Hide previous messages */
    if (successMsg) successMsg.style.display = "none";
    if (errorMsg)   errorMsg.style.display   = "none";

    /* Clear previous error styling */
    var inputs = document.querySelectorAll(".form-input, .form-textarea");
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].classList.remove("error");
    }

    /* Validate first — only submit if clean */
    var valid = validateForm();
    if (!valid) {
      if (errorMsg) errorMsg.style.display = "block";
      return;
    }

    /* Lock button while submitting */
    submitBtn.disabled    = true;
    submitBtn.textContent = "Submitting...";

    /* Encode form data for Netlify */
    var formData = new FormData(form);
    var encoded  = new URLSearchParams(formData).toString();

    /* Send to Netlify Forms endpoint */
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/");
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.onload = function() {
      if (xhr.status === 200 || xhr.status === 303) {
        /* Success */
        submitBtn.style.display = "none";
        if (successMsg) successMsg.style.display = "flex";
        clearForm();
      } else {
        /* Netlify returned an error */
        submitBtn.disabled    = false;
        submitBtn.textContent = "Submit Application";
        if (errorMsg) {
          errorMsg.querySelector("p").textContent = "Submission failed (error " + xhr.status + "). Please try again or email INARELSresearch@dr.com directly.";
          errorMsg.style.display = "block";
        }
      }
    };

    xhr.onerror = function() {
      /* Network error */
      submitBtn.disabled    = false;
      submitBtn.textContent = "Submit Application";
      if (errorMsg) {
        errorMsg.querySelector("p").textContent = "Network error. Please check your connection and try again.";
        errorMsg.style.display = "block";
      }
    };

    xhr.send(encoded);
  });
}

function validateForm() {
  var valid = true;

  /* Required text inputs */
  var requiredIds = ["f-name", "f-email", "f-country", "f-bio", "f-research-title", "f-research-desc", "f-statement"];
  for (var i = 0; i < requiredIds.length; i++) {
    var el = document.getElementById(requiredIds[i]);
    if (el && el.value.trim() === "") {
      el.classList.add("error");
      valid = false;
    }
  }

  /* Email format check */
  var emailEl = document.getElementById("f-email");
  if (emailEl && emailEl.value.indexOf("@") === -1) {
    emailEl.classList.add("error");
    valid = false;
  }

  /* Agreement checkbox */
  var agreeEl = document.getElementById("f-agree");
  if (agreeEl && !agreeEl.checked) {
    valid = false;
  }

  return valid;
}

function clearForm() {
  var inputs    = document.querySelectorAll(".join-form .form-input");
  var textareas = document.querySelectorAll(".join-form .form-textarea");
  var checkboxes = document.querySelectorAll(".join-form input[type='checkbox']");

  for (var i = 0; i < inputs.length; i++)    { inputs[i].value = ""; }
  for (var j = 0; j < textareas.length; j++) { textareas[j].value = ""; }
  for (var k = 0; k < checkboxes.length; k++) { checkboxes[k].checked = false; }
}

/* ─── Scroll reveal for cards ─── */
function initScrollReveal() {
  var cards = document.getElementsByClassName("researcher-card");
  if (!cards || cards.length === 0) return;

  for (var i = 0; i < cards.length; i++) {
    cards[i].style.opacity    = "0";
    cards[i].style.transform  = "translateY(20px)";
    cards[i].style.transition = "opacity 0.5s ease, transform 0.5s ease";
  }

  function checkCards() {
    var wh = window.innerHeight;
    for (var j = 0; j < cards.length; j++) {
      if (cards[j].classList.contains("hidden")) continue;
      var rect = cards[j].getBoundingClientRect();
      if (rect.top < wh - 60) {
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
  initRegionFilter();
  initJoinForm();
  initScrollReveal();
});
