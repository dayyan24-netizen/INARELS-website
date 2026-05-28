/* ═══════════════════════════════════════════════════════════════
   INARELS — portal.js
   Login, panel navigation, accordion folders, upload zone
   W3Schools-compatible: var, for loops, no arrow functions
   ═══════════════════════════════════════════════════════════════ */

/* ─── User accounts (demo only — replace with real auth) ─── */
var DEMO_ACCOUNTS = [
  { email: "member@inarels.org",  password: "demo1234", name: "Demo Researcher",    initials: "DR", role: "Network Member",  isAdmin: false },
  { email: "admin@inarels.org",   password: "admin1234", name: "Desmond Odugu",     initials: "DO", role: "Network Coordinator", isAdmin: true }
];

var currentUser = null;

/* ─── Login ─── */
function initLogin() {
  var loginBtn   = document.getElementById("login-btn");
  var loginError = document.getElementById("login-error");

  if (!loginBtn) return;

  loginBtn.addEventListener("click", function() {
    var email    = document.getElementById("login-email").value.trim();
    var password = document.getElementById("login-password").value;
    var matched  = null;

    for (var i = 0; i < DEMO_ACCOUNTS.length; i++) {
      if (DEMO_ACCOUNTS[i].email === email && DEMO_ACCOUNTS[i].password === password) {
        matched = DEMO_ACCOUNTS[i];
        break;
      }
    }

    if (matched) {
      currentUser = matched;
      loginError.style.display = "none";
      loginBtn.textContent = "Signing in...";
      setTimeout(function() {
        showPortal();
      }, 700);
    } else {
      loginError.style.display = "block";
    }
  });

  /* Enter key on password field */
  var pwInput = document.getElementById("login-password");
  if (pwInput) {
    pwInput.addEventListener("keydown", function(e) {
      if (e.key === "Enter") { loginBtn.click(); }
    });
  }
}

function showPortal() {
  var loginScreen = document.getElementById("login-screen");
  var dashboard   = document.getElementById("portal-dashboard");
  if (loginScreen) loginScreen.style.display = "none";
  if (dashboard)   dashboard.style.display   = "flex";

  /* Populate user info */
  if (currentUser) {
    var welcomeName = document.getElementById("welcome-name");
    var chipName    = document.getElementById("user-chip-name");
    var chipRole    = document.getElementById("user-chip-role");
    var chipAvatar  = document.getElementById("user-chip-avatar");
    var mobileAv    = document.getElementById("portal-mobile-avatar");
    var profBig     = document.getElementById("profile-avatar-big");

    if (welcomeName) welcomeName.textContent = currentUser.name.split(" ")[0];
    if (chipName)    chipName.textContent    = currentUser.name;
    if (chipRole)    chipRole.textContent    = currentUser.role;
    if (chipAvatar)  chipAvatar.textContent  = currentUser.initials;
    if (mobileAv)    mobileAv.textContent    = currentUser.initials;
    if (profBig)     profBig.textContent     = currentUser.initials;

    /* Show admin nav item if admin */
    var adminNavItem = document.getElementById("admin-nav-item");
    if (adminNavItem) {
      adminNavItem.style.display = currentUser.isAdmin ? "block" : "none";
    }
  }
}

/* ─── Logout ─── */
function initLogout() {
  var logoutBtn = document.getElementById("logout-btn");
  if (!logoutBtn) return;
  logoutBtn.addEventListener("click", function() {
    currentUser = null;
    var loginScreen = document.getElementById("login-screen");
    var dashboard   = document.getElementById("portal-dashboard");
    if (dashboard)   dashboard.style.display   = "none";
    if (loginScreen) loginScreen.style.display  = "flex";
    var emailInput = document.getElementById("login-email");
    var pwInput    = document.getElementById("login-password");
    if (emailInput) emailInput.value = "";
    if (pwInput)    pwInput.value    = "";
    var loginBtn = document.getElementById("login-btn");
    if (loginBtn) loginBtn.textContent = "Sign In to Portal";
  });
}

/* ─── Panel navigation ─── */
function initPanelNav() {
  var navLinks = document.getElementsByClassName("portal-nav-link");
  if (!navLinks || navLinks.length === 0) return;

  for (var i = 0; i < navLinks.length; i++) {
    (function(link) {
      link.addEventListener("click", function(e) {
        e.preventDefault();
        var panelId = "panel-" + link.getAttribute("data-panel");
        switchPanel(panelId, link);
        /* Close mobile sidebar */
        var sidebar = document.getElementById("portal-sidebar");
        if (sidebar) sidebar.classList.remove("open");
      });
    })(navLinks[i]);
  }
}

function switchPanel(panelId, activeLink) {
  /* Hide all panels */
  var panels = document.getElementsByClassName("portal-panel");
  for (var i = 0; i < panels.length; i++) {
    panels[i].classList.remove("active");
  }
  /* Deactivate all nav links */
  var links = document.getElementsByClassName("portal-nav-link");
  for (var j = 0; j < links.length; j++) {
    links[j].classList.remove("active");
  }
  /* Show target panel */
  var target = document.getElementById(panelId);
  if (target) target.classList.add("active");
  /* Activate nav link */
  if (activeLink) activeLink.classList.add("active");
}

/* ─── Quick folder cards click → files panel ─── */
function initQuickFolders() {
  var cards = document.getElementsByClassName("quick-folder-card");
  for (var i = 0; i < cards.length; i++) {
    (function(card) {
      if (card.classList.contains("qf-locked")) return;
      card.addEventListener("click", function() {
        var filesLink = document.querySelector(".portal-nav-link[data-panel='files']");
        if (filesLink) switchPanel("panel-files", filesLink);
      });
    })(cards[i]);
  }
}

/* ─── My Projects panel — open folder buttons ─── */
function initProjectButtons() {
  var buttons = document.getElementsByClassName("ppi-btn");
  for (var i = 0; i < buttons.length; i++) {
    (function(btn) {
      if (btn.classList.contains("ppi-btn-disabled") ||
          btn.classList.contains("ppi-btn-ghost")) return;
      var panel = btn.getAttribute("data-panel");
      if (!panel) return;
      btn.addEventListener("click", function() {
        var filesLink = document.querySelector(".portal-nav-link[data-panel='" + panel + "']");
        if (filesLink) switchPanel("panel-" + panel, filesLink);
      });
    })(buttons[i]);
  }
}

/* ─── Folder accordion ─── */
function initFolderAccordion() {
  var headers = document.getElementsByClassName("folder-group-header");
  for (var i = 0; i < headers.length; i++) {
    (function(header) {
      header.addEventListener("click", function() {
        var folderId = header.getAttribute("data-folder");
        var content  = document.getElementById(folderId);
        if (!content) return;
        var isOpen = content.classList.contains("open");
        if (isOpen) {
          content.classList.remove("open");
          header.classList.remove("open");
        } else {
          content.classList.add("open");
          header.classList.add("open");
        }
      });
    })(headers[i]);
  }
}

/* ─── Subfolder tabs ─── */
function initSubfolderTabs() {
  var tabGroups = document.getElementsByClassName("subfolder-tabs");
  for (var i = 0; i < tabGroups.length; i++) {
    (function(group) {
      var tabs = group.getElementsByClassName("subfolder-tab");
      for (var j = 0; j < tabs.length; j++) {
        (function(tab) {
          tab.addEventListener("click", function() {
            var subId = tab.getAttribute("data-sub");
            /* Deactivate all tabs in this group */
            for (var k = 0; k < tabs.length; k++) {
              tabs[k].classList.remove("active");
            }
            tab.classList.add("active");
            /* Hide all subfolder contents in parent folder */
            var folderContents = group.parentNode;
            var contents = folderContents.getElementsByClassName("subfolder-content");
            for (var m = 0; m < contents.length; m++) {
              contents[m].classList.remove("active");
            }
            /* Show target */
            var target = document.getElementById(subId);
            if (target) target.classList.add("active");
          });
        })(tabs[j]);
      }
    })(tabGroups[i]);
  }
}

/* ─── Upload drag & drop ─── */
function initUploadZone() {
  var dropzone  = document.getElementById("upload-dropzone");
  var fileInput = document.getElementById("file-input");
  var browseBtn = document.getElementById("browse-btn");
  var queue     = document.getElementById("upload-queue");
  var queueList = document.getElementById("upload-queue-list");
  var clearBtn  = document.getElementById("upload-queue-clear");
  var submitBtn = document.getElementById("upload-submit-btn");

  if (!dropzone || !fileInput) return;

  browseBtn.addEventListener("click", function() { fileInput.click(); });

  fileInput.addEventListener("change", function() {
    addFilesToQueue(fileInput.files, queueList, queue);
    fileInput.value = "";
  });

  dropzone.addEventListener("dragover", function(e) {
    e.preventDefault();
    dropzone.classList.add("drag-over");
  });
  dropzone.addEventListener("dragleave", function() {
    dropzone.classList.remove("drag-over");
  });
  dropzone.addEventListener("drop", function(e) {
    e.preventDefault();
    dropzone.classList.remove("drag-over");
    addFilesToQueue(e.dataTransfer.files, queueList, queue);
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", function() {
      queueList.innerHTML = "";
      queue.style.display = "none";
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener("click", function() {
      submitBtn.textContent = "Uploading...";
      submitBtn.disabled = true;
      setTimeout(function() {
        queueList.innerHTML = "";
        queue.style.display = "none";
        submitBtn.textContent = "Upload All Files";
        submitBtn.disabled = false;
        showUploadSuccess();
      }, 1800);
    });
  }
}

function addFilesToQueue(files, queueList, queue) {
  if (!files || files.length === 0) return;
  queue.style.display = "block";
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    var item = document.createElement("div");
    item.className = "file-item";
    var sizeKB = Math.round(file.size / 1024);
    var sizeStr = sizeKB > 1024 ? (Math.round(sizeKB / 1024 * 10) / 10) + " MB" : sizeKB + " KB";
    item.innerHTML = '<svg viewBox="0 0 20 20" fill="none" width="16" height="16" style="color:rgba(255,255,255,0.4);flex-shrink:0;"><path d="M4 3h8l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" stroke-width="1.5"/></svg>'
      + '<span class="file-name">' + file.name + '</span>'
      + '<span class="file-meta">' + sizeStr + '</span>'
      + '<div class="file-actions"><button class="file-btn remove-file-btn">Remove</button></div>';
    queueList.appendChild(item);
    /* Remove button */
    var removeBtn = item.getElementsByClassName("remove-file-btn")[0];
    (function(el) {
      removeBtn.addEventListener("click", function() {
        el.parentNode.removeChild(el);
        if (queueList.children.length === 0) {
          queue.style.display = "none";
        }
      });
    })(item);
  }
}

function showUploadSuccess() {
  var desc = document.getElementById("upload-desc");
  if (desc) {
    desc.value = "";
    desc.placeholder = "Files uploaded successfully. They are pending review by the project lead.";
  }
}

/* ─── Policy panel smooth scroll ─── */
function initPolicyLinks() {
  var links = document.querySelectorAll(".policy-toc a");
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener("click", function(e) {
      var href = this.getAttribute("href");
      if (href && href.indexOf("#") === 0) {
        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  }
}

/* ─── Portal panel links (e.g. in upload sidebar) ─── */
function initPortalPanelLinks() {
  var links = document.getElementsByClassName("portal-panel-link");
  for (var i = 0; i < links.length; i++) {
    (function(link) {
      var panel = link.getAttribute("data-panel");
      if (!panel) return;
      link.addEventListener("click", function(e) {
        e.preventDefault();
        var navLink = document.querySelector(".portal-nav-link[data-panel='" + panel + "']");
        if (navLink) switchPanel("panel-" + panel, navLink);
      });
    })(links[i]);
  }
}

/* ─── Mobile sidebar toggle ─── */
function initMobileSidebar() {
  var menuBtn = document.getElementById("portal-menu-btn");
  var sidebar = document.getElementById("portal-sidebar");
  if (!menuBtn || !sidebar) return;
  menuBtn.addEventListener("click", function() {
    sidebar.classList.toggle("open");
  });
}

/* ─── Admin button feedback ─── */
function initAdminButtons() {
  var approveBtns = document.getElementsByClassName("admin-btn-approve");
  var rejectBtns  = document.getElementsByClassName("admin-btn-reject");

  for (var i = 0; i < approveBtns.length; i++) {
    (function(btn) {
      btn.addEventListener("click", function() {
        var row = btn.closest(".admin-request-item");
        if (row) {
          row.style.opacity = "0.4";
          row.style.transition = "opacity 0.4s";
          btn.textContent = "Approved";
          btn.disabled = true;
        }
      });
    })(approveBtns[i]);
  }

  for (var j = 0; j < rejectBtns.length; j++) {
    (function(btn) {
      btn.addEventListener("click", function() {
        var row = btn.closest(".admin-request-item");
        if (row) {
          row.style.opacity = "0.4";
          row.style.transition = "opacity 0.4s";
          btn.textContent = "Declined";
          btn.disabled = true;
        }
      });
    })(rejectBtns[j]);
  }
}

/* ─── Boot ─── */
document.addEventListener("DOMContentLoaded", function() {
  initLogin();
  initLogout();
  initPanelNav();
  initQuickFolders();
  initProjectButtons();
  initFolderAccordion();
  initSubfolderTabs();
  initUploadZone();
  initPolicyLinks();
  initPortalPanelLinks();
  initMobileSidebar();
  initAdminButtons();
});
