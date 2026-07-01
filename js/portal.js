/* ═══════════════════════════════════════════════════════════════
   INARELS — portal.js  (Supabase real auth)
   Dependencies: Supabase JS v2 loaded via CDN in portal.html
   ═══════════════════════════════════════════════════════════════ */

/* ─── Supabase config ─── */
var SUPABASE_URL = "https://babodomengagmkskkudb.supabase.co";
var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhYm9kb21lbmdhZ21rc2trdWRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MjA1MTQsImV4cCI6MjA5ODQ5NjUxNH0.NivDi7twbmJj0T4RYvirxYoEyryrFqI2XN5VwUKIXrc";

var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ─── State ─── */
var currentUser    = null;
var currentProfile = null;

/* ═══════════════════════════════════════════════════════════════
   BOOT — check session on page load
   ═══════════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", function() {
  supabase.auth.getSession().then(function(result) {
    var session = result.data.session;
    if (session && session.user) {
      loadUserAndShowDashboard(session.user);
    } else {
      showLoginScreen();
    }
  });

  /* Listen for auth changes (logout from another tab, etc.) */
  supabase.auth.onAuthStateChange(function(event, session) {
    if (event === "SIGNED_OUT") {
      currentUser    = null;
      currentProfile = null;
      showLoginScreen();
    }
    if (event === "SIGNED_IN" && session) {
      loadUserAndShowDashboard(session.user);
    }
  });

  initLoginForm();
  initLogout();
  initPanelNav();
  initMobileMenu();
  initUploadForm();
  initAccessRequestForm();
  initProfileForm();
  initAdminButtons();
});

/* ═══════════════════════════════════════════════════════════════
   AUTH — Login
   ═══════════════════════════════════════════════════════════════ */
function initLoginForm() {
  var loginBtn   = document.getElementById("login-btn");
  var loginError = document.getElementById("login-error");
  var emailInput = document.getElementById("login-email");
  var passInput  = document.getElementById("login-password");

  if (!loginBtn) return;

  loginBtn.addEventListener("click", function() {
    handleLogin();
  });

  if (passInput) {
    passInput.addEventListener("keydown", function(e) {
      if (e.key === "Enter") { handleLogin(); }
    });
  }
  if (emailInput) {
    emailInput.addEventListener("keydown", function(e) {
      if (e.key === "Enter") { handleLogin(); }
    });
  }

  function handleLogin() {
    var email    = emailInput ? emailInput.value.trim() : "";
    var password = passInput  ? passInput.value : "";

    if (!email || !password) {
      showLoginError("Please enter your email and password.");
      return;
    }

    loginBtn.disabled    = true;
    loginBtn.textContent = "Signing in...";
    if (loginError) loginError.style.display = "none";

    supabase.auth.signInWithPassword({
      email: email,
      password: password
    }).then(function(result) {
      if (result.error) {
        loginBtn.disabled    = false;
        loginBtn.textContent = "Sign In to Portal";
        showLoginError(result.error.message || "Invalid email or password. Please try again.");
      }
      /* If success, onAuthStateChange fires and calls loadUserAndShowDashboard */
    });
  }

  function showLoginError(msg) {
    if (loginError) {
      loginError.textContent    = msg;
      loginError.style.display  = "block";
    }
  }
}

/* ─── Logout ─── */
function initLogout() {
  var logoutBtn = document.getElementById("logout-btn");
  if (!logoutBtn) return;
  logoutBtn.addEventListener("click", function() {
    supabase.auth.signOut();
  });
}

/* ═══════════════════════════════════════════════════════════════
   PROFILE — load user profile from Supabase
   ═══════════════════════════════════════════════════════════════ */
function loadUserAndShowDashboard(user) {
  currentUser = user;

  supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()
    .then(function(result) {
      if (result.data) {
        currentProfile = result.data;
      } else {
        /* Profile may not exist yet (first login race condition) */
        currentProfile = {
          id:        user.id,
          full_name: user.user_metadata ? user.user_metadata.full_name : user.email,
          role:      "pending",
          is_admin:  false
        };
      }
      renderDashboard();
      showDashboardScreen();
      loadMyProjects();
    });
}

/* ═══════════════════════════════════════════════════════════════
   UI — show / hide screens
   ═══════════════════════════════════════════════════════════════ */
function showLoginScreen() {
  var loginScreen = document.getElementById("login-screen");
  var dashboard   = document.getElementById("portal-dashboard");
  if (loginScreen) loginScreen.style.display = "flex";
  if (dashboard)   dashboard.style.display   = "none";

  /* Remove demo note now that we have real auth */
  var demoNote = document.querySelector(".login-demo-note");
  if (demoNote) demoNote.style.display = "none";
}

function showDashboardScreen() {
  var loginScreen = document.getElementById("login-screen");
  var dashboard   = document.getElementById("portal-dashboard");
  if (loginScreen) loginScreen.style.display = "none";
  if (dashboard)   dashboard.style.display   = "flex";
}

/* ─── Populate dashboard with real user data ─── */
function renderDashboard() {
  if (!currentProfile) return;

  var name     = currentProfile.full_name || (currentUser ? currentUser.email : "Researcher");
  var role     = currentProfile.role      || "pending";
  var isAdmin  = currentProfile.is_admin  || false;

  /* Welcome name */
  var welcomeEl = document.getElementById("welcome-name");
  if (welcomeEl) welcomeEl.textContent = name.split(" ")[0];

  /* Sidebar user chip */
  var chipName = document.getElementById("user-chip-name");
  var chipRole = document.getElementById("user-chip-role");
  var chipAvtr = document.getElementById("user-chip-avatar");
  var mobAvtr  = document.getElementById("portal-mobile-avatar");

  if (chipName) chipName.textContent = name;
  if (chipRole) chipRole.textContent = getRoleLabel(role, isAdmin);

  var initials = getInitials(name);
  if (chipAvtr) chipAvtr.textContent = initials;
  if (mobAvtr)  mobAvtr.textContent  = initials;

  /* Show admin nav if admin */
  var adminNav = document.getElementById("admin-nav-item");
  if (adminNav) adminNav.style.display = isAdmin ? "block" : "none";

  /* Show pending banner if not yet approved */
  if (role === "pending") {
    showPendingBanner();
  }

  /* Populate profile form with real data */
  populateProfileForm();
}

function getRoleLabel(role, isAdmin) {
  if (isAdmin)          return "Network Admin";
  if (role === "approved") return "Network Member";
  if (role === "pending")  return "Pending Approval";
  return "Network Member";
}

function getInitials(name) {
  if (!name) return "?";
  var parts = name.split(" ");
  if (parts.length >= 2) return parts[0][0].toUpperCase() + parts[1][0].toUpperCase();
  return name[0].toUpperCase();
}

/* ─── Pending approval banner ─── */
function showPendingBanner() {
  var main = document.getElementById("portal-main");
  if (!main) return;

  /* Only add once */
  if (document.getElementById("pending-banner")) return;

  var banner = document.createElement("div");
  banner.id = "pending-banner";
  banner.style.cssText = "background:#fff8e8;border:1px solid rgba(201,146,42,0.4);border-radius:8px;padding:16px 20px;margin:0 0 24px;display:flex;gap:14px;align-items:flex-start;";
  banner.innerHTML = '<svg viewBox="0 0 20 20" fill="none" width="20" height="20" style="flex-shrink:0;margin-top:2px;"><circle cx="10" cy="10" r="8" stroke="#C9922A" stroke-width="1.5"/><path d="M10 6v4M10 13h.01" stroke="#C9922A" stroke-width="1.5" stroke-linecap="round"/></svg>'
    + '<div><strong style="font-size:0.9rem;color:#0B1120;">Membership pending approval</strong>'
    + '<p style="font-size:0.85rem;color:#6b6b8a;margin:4px 0 0;line-height:1.55;">Your application is under review by the INARELS Leadership Team. You will receive an email once approved. Some features are restricted until then.</p></div>';

  var firstPanel = document.getElementById("panel-dashboard");
  if (firstPanel && firstPanel.firstChild) {
    firstPanel.insertBefore(banner, firstPanel.firstChild);
  }
}

/* ═══════════════════════════════════════════════════════════════
   PROJECTS — load member's project access from Supabase
   ═══════════════════════════════════════════════════════════════ */
function loadMyProjects() {
  if (!currentUser) return;

  supabase
    .from("project_access")
    .select("project_id, projects(id, slug, title, region, status)")
    .eq("user_id", currentUser.id)
    .then(function(result) {
      var accessedProjects = result.data || [];
      renderMyProjectsPanel(accessedProjects);
      updateDashboardStats(accessedProjects.length);
    });
}

function renderMyProjectsPanel(accessedProjects) {
  var grid = document.getElementById("my-projects-grid");
  if (!grid) return;

  /* All 4 INARELS projects for display */
  var allProjects = [
    { slug: "historicizing-history-education",  title: "Historicizing History Education",                   region: "West & East Africa", themes: "Education · History" },
    { slug: "language-historical-literacies",   title: "Language, Historical Literacies & Civic Engagement", region: "Pan-African",         themes: "Language · History · Society" },
    { slug: "agird",                            title: "Achievement Gap & Intra-racial Dynamics (AGIRD)",    region: "USA / Diaspora",      themes: "Education · Society · Diaspora" },
    { slug: "language-education-development",   title: "Language, Education, and Development",               region: "Africa-wide",         themes: "Language · Education · Society" }
  ];

  /* Build set of accessible project slugs */
  var accessible = {};
  for (var i = 0; i < accessedProjects.length; i++) {
    if (accessedProjects[i].projects) {
      accessible[accessedProjects[i].projects.slug] = true;
    }
  }

  var html = "";
  for (var j = 0; j < allProjects.length; j++) {
    var proj    = allProjects[j];
    var hasAccess = accessible[proj.slug] || (currentProfile && currentProfile.is_admin);
    var statusClass = hasAccess ? "proj-access-open" : "proj-access-locked";
    var statusText  = hasAccess ? "Access Granted" : "Access Pending";
    var btnHtml = hasAccess
      ? '<a href="../pages/project-' + proj.slug + '.html" class="portal-proj-btn portal-proj-btn-open">Open Folder</a>'
      : '<button class="portal-proj-btn portal-proj-btn-locked" onclick="requestProjectAccess(\'' + proj.slug + '\')">Request Access</button>';

    html += '<div class="portal-proj-card">'
      + '<div class="portal-proj-card-header">'
      + '<span class="portal-proj-status ' + statusClass + '">' + statusText + '</span>'
      + '</div>'
      + '<h3 class="portal-proj-title">' + proj.title + '</h3>'
      + '<p class="portal-proj-meta"><strong>Region:</strong> ' + proj.region + '</p>'
      + '<p class="portal-proj-meta">' + proj.themes + '</p>'
      + '<div class="portal-proj-actions">' + btnHtml
      + '<a href="../pages/project-' + proj.slug + '.html" class="portal-proj-btn portal-proj-btn-secondary" target="_blank">Public Page</a>'
      + '</div></div>';
  }
  grid.innerHTML = html;
}

function updateDashboardStats(projectCount) {
  var el = document.querySelector(".dash-stat-card:nth-child(2) .dash-stat-num");
  if (el) el.textContent = projectCount;
}

/* ─── Request project access ─── */
function requestProjectAccess(slug) {
  if (!currentUser) return;

  /* Find project id from slug by querying Supabase */
  supabase
    .from("projects")
    .select("id")
    .eq("slug", slug)
    .single()
    .then(function(result) {
      if (!result.data) return;
      var projectId = result.data.id;

      supabase
        .from("project_access")
        .insert({ user_id: currentUser.id, project_id: projectId })
        .then(function(res) {
          if (res.error && res.error.code === "23505") {
            alert("You have already requested access to this project.");
          } else if (res.error) {
            alert("Request failed: " + res.error.message);
          } else {
            alert("Access request submitted. The project lead will review your request.");
            loadMyProjects();
          }
        });
    });
}

/* ═══════════════════════════════════════════════════════════════
   UPLOAD — real file upload to Supabase Storage
   ═══════════════════════════════════════════════════════════════ */
function initUploadForm() {
  var uploadBtn  = document.getElementById("upload-submit-btn");
  var dropZone   = document.getElementById("upload-drop-zone");
  var fileInput  = document.getElementById("upload-file-input");
  var progressBar = document.getElementById("upload-progress-bar");
  var progressWrap = document.getElementById("upload-progress-wrap");
  var uploadStatus = document.getElementById("upload-status");

  if (!uploadBtn) return;

  /* Drag and drop */
  if (dropZone) {
    dropZone.addEventListener("dragover", function(e) {
      e.preventDefault();
      dropZone.classList.add("drag-over");
    });
    dropZone.addEventListener("dragleave", function() {
      dropZone.classList.remove("drag-over");
    });
    dropZone.addEventListener("drop", function(e) {
      e.preventDefault();
      dropZone.classList.remove("drag-over");
      if (e.dataTransfer.files.length && fileInput) {
        fileInput.files = e.dataTransfer.files;
        updateDropZoneLabel(e.dataTransfer.files[0].name);
      }
    });
    dropZone.addEventListener("click", function() {
      if (fileInput) fileInput.click();
    });
  }

  if (fileInput) {
    fileInput.addEventListener("change", function() {
      if (fileInput.files.length) {
        updateDropZoneLabel(fileInput.files[0].name);
      }
    });
  }

  uploadBtn.addEventListener("click", function() {
    if (!currentUser) { alert("Please sign in first."); return; }

    var file        = fileInput && fileInput.files[0];
    var projectSel  = document.getElementById("upload-project-select");
    var folderSel   = document.getElementById("upload-folder-select");
    var descInput   = document.getElementById("upload-description");

    if (!file) { alert("Please select a file to upload."); return; }
    if (!projectSel || !projectSel.value) { alert("Please select a project."); return; }

    var projectSlug  = projectSel.value;
    var folder       = folderSel ? folderSel.value : "documents";
    var description  = descInput ? descInput.value.trim() : "";
    var fileName     = Date.now() + "_" + file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    var storagePath  = projectSlug + "/" + folder + "/" + fileName;

    uploadBtn.disabled    = true;
    uploadBtn.textContent = "Uploading...";
    if (progressWrap) progressWrap.style.display = "block";
    if (progressBar)  progressBar.style.width    = "10%";

    supabase.storage
      .from("research-files")
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false
      })
      .then(function(result) {
        uploadBtn.disabled    = false;
        uploadBtn.textContent = "Upload File";

        if (result.error) {
          if (progressBar) progressBar.style.width = "0%";
          if (uploadStatus) {
            uploadStatus.textContent  = "Upload failed: " + result.error.message;
            uploadStatus.style.color  = "#c62828";
            uploadStatus.style.display = "block";
          }
        } else {
          if (progressBar) progressBar.style.width = "100%";
          if (uploadStatus) {
            uploadStatus.textContent  = "File uploaded successfully.";
            uploadStatus.style.color  = "#2db45a";
            uploadStatus.style.display = "block";
          }
          /* Reset form */
          if (fileInput)  fileInput.value   = "";
          if (descInput)  descInput.value   = "";
          updateDropZoneLabel("Drag and drop a file here, or click to select");

          /* Hide progress after 3s */
          setTimeout(function() {
            if (progressWrap) progressWrap.style.display = "none";
            if (uploadStatus) uploadStatus.style.display = "none";
            if (progressBar)  progressBar.style.width    = "0%";
          }, 3000);
        }
      });
  });
}

function updateDropZoneLabel(text) {
  var label = document.getElementById("drop-zone-label");
  if (label) label.textContent = text;
}

/* ═══════════════════════════════════════════════════════════════
   ACCESS REQUESTS — submit & list
   ═══════════════════════════════════════════════════════════════ */
function initAccessRequestForm() {
  var submitBtn = document.getElementById("access-request-submit");
  if (!submitBtn) return;

  submitBtn.addEventListener("click", function() {
    var projectSel = document.getElementById("access-project-select");
    var reasonEl   = document.getElementById("access-reason");
    if (!projectSel || !projectSel.value) { alert("Please select a project."); return; }

    requestProjectAccess(projectSel.value);

    if (reasonEl) reasonEl.value = "";
    if (projectSel) projectSel.value = "";

    var successMsg = document.getElementById("access-request-success");
    if (successMsg) {
      successMsg.style.display = "block";
      setTimeout(function() { successMsg.style.display = "none"; }, 4000);
    }
  });
}

/* ═══════════════════════════════════════════════════════════════
   PROFILE FORM — read and update
   ═══════════════════════════════════════════════════════════════ */
function populateProfileForm() {
  if (!currentProfile) return;

  var fields = {
    "profile-name":        currentProfile.full_name    || "",
    "profile-email":       currentUser ? currentUser.email : "",
    "profile-institution": currentProfile.institution  || "",
    "profile-country":     currentProfile.country      || "",
    "profile-bio":         currentProfile.bio          || "",
    "profile-research":    currentProfile.research_title || ""
  };

  for (var id in fields) {
    var el = document.getElementById(id);
    if (el) el.value = fields[id];
  }
}

function initProfileForm() {
  var saveBtn = document.getElementById("profile-save-btn");
  if (!saveBtn) return;

  saveBtn.addEventListener("click", function() {
    if (!currentUser) return;

    var updates = {
      full_name:      getVal("profile-name"),
      institution:    getVal("profile-institution"),
      country:        getVal("profile-country"),
      bio:            getVal("profile-bio"),
      research_title: getVal("profile-research")
    };

    saveBtn.disabled    = true;
    saveBtn.textContent = "Saving...";

    supabase
      .from("profiles")
      .update(updates)
      .eq("id", currentUser.id)
      .then(function(result) {
        saveBtn.disabled    = false;
        saveBtn.textContent = "Save Changes";

        var statusEl = document.getElementById("profile-save-status");
        if (statusEl) {
          if (result.error) {
            statusEl.textContent = "Error saving: " + result.error.message;
            statusEl.style.color = "#c62828";
          } else {
            statusEl.textContent = "Profile updated successfully.";
            statusEl.style.color = "#2db45a";
            /* Update local profile */
            for (var k in updates) { currentProfile[k] = updates[k]; }
            renderDashboard();
          }
          statusEl.style.display = "block";
          setTimeout(function() { statusEl.style.display = "none"; }, 3000);
        }
      });
  });
}

function getVal(id) {
  var el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN — load pending members, approve / reject
   ═══════════════════════════════════════════════════════════════ */
function loadAdminPanel() {
  if (!currentProfile || !currentProfile.is_admin) return;

  supabase
    .from("profiles")
    .select("*")
    .eq("role", "pending")
    .then(function(result) {
      renderAdminRequests(result.data || []);
    });
}

function renderAdminRequests(pendingMembers) {
  var container = document.getElementById("admin-requests-list");
  if (!container) return;

  if (pendingMembers.length === 0) {
    container.innerHTML = '<p style="color:var(--text-light);font-size:0.9rem;">No pending membership requests.</p>';
    return;
  }

  var html = "";
  for (var i = 0; i < pendingMembers.length; i++) {
    var m = pendingMembers[i];
    html += '<div class="admin-request-item" id="admin-req-' + m.id + '">'
      + '<div class="admin-req-info">'
      + '<strong class="admin-req-name">' + (m.full_name || "Unknown") + '</strong>'
      + '<span class="admin-req-meta">' + (m.institution || "No institution") + ' &mdash; ' + (m.country || "") + '</span>'
      + '<p class="admin-req-bio">' + (m.bio ? m.bio.substring(0, 180) + "..." : "No bio provided.") + '</p>'
      + '</div>'
      + '<div class="admin-req-actions">'
      + '<button class="admin-btn-approve" data-uid="' + m.id + '">Approve</button>'
      + '<button class="admin-btn-reject"  data-uid="' + m.id + '">Decline</button>'
      + '</div></div>';
  }
  container.innerHTML = html;

  /* Wire up buttons */
  var approveBtns = container.getElementsByClassName("admin-btn-approve");
  var rejectBtns  = container.getElementsByClassName("admin-btn-reject");

  for (var a = 0; a < approveBtns.length; a++) {
    (function(btn) {
      btn.addEventListener("click", function() {
        approveMember(btn.getAttribute("data-uid"), btn);
      });
    })(approveBtns[a]);
  }
  for (var r = 0; r < rejectBtns.length; r++) {
    (function(btn) {
      btn.addEventListener("click", function() {
        rejectMember(btn.getAttribute("data-uid"), btn);
      });
    })(rejectBtns[r]);
  }
}

function approveMember(uid, btn) {
  supabase
    .from("profiles")
    .update({ role: "approved" })
    .eq("id", uid)
    .then(function(result) {
      if (result.error) { alert("Error: " + result.error.message); return; }
      var row = document.getElementById("admin-req-" + uid);
      if (row) {
        row.style.opacity = "0.4";
        btn.textContent   = "Approved ✓";
        btn.disabled      = true;
      }
    });
}

function rejectMember(uid, btn) {
  supabase
    .from("profiles")
    .update({ role: "rejected" })
    .eq("id", uid)
    .then(function(result) {
      if (result.error) { alert("Error: " + result.error.message); return; }
      var row = document.getElementById("admin-req-" + uid);
      if (row) {
        row.style.opacity = "0.4";
        btn.textContent   = "Declined";
        btn.disabled      = true;
      }
    });
}

function initAdminButtons() {
  /* Admin panel loads dynamically when panel is switched to */
}

/* ═══════════════════════════════════════════════════════════════
   PANEL NAVIGATION
   ═══════════════════════════════════════════════════════════════ */
function initPanelNav() {
  var navLinks = document.getElementsByClassName("portal-nav-link");

  for (var i = 0; i < navLinks.length; i++) {
    (function(link) {
      link.addEventListener("click", function(e) {
        e.preventDefault();
        var panelId = link.getAttribute("data-panel");
        if (!panelId) return;
        switchPanel(panelId);

        /* Close mobile menu */
        var sidebar = document.getElementById("portal-sidebar");
        if (sidebar) sidebar.classList.remove("open");
      });
    })(navLinks[i]);
  }
}

function switchPanel(panelId) {
  /* Deactivate all nav links */
  var navLinks = document.getElementsByClassName("portal-nav-link");
  for (var i = 0; i < navLinks.length; i++) {
    navLinks[i].classList.remove("active");
  }

  /* Hide all panels */
  var panels = document.getElementsByClassName("portal-panel");
  for (var j = 0; j < panels.length; j++) {
    panels[j].classList.remove("active");
  }

  /* Activate selected */
  var targetLink  = document.querySelector('[data-panel="' + panelId + '"]');
  var targetPanel = document.getElementById("panel-" + panelId);

  if (targetLink)  targetLink.classList.add("active");
  if (targetPanel) targetPanel.classList.add("active");

  /* Load admin panel data when switching to it */
  if (panelId === "admin") { loadAdminPanel(); }
}

/* ═══════════════════════════════════════════════════════════════
   MOBILE MENU
   ═══════════════════════════════════════════════════════════════ */
function initMobileMenu() {
  var menuBtn  = document.getElementById("portal-menu-btn");
  var sidebar  = document.getElementById("portal-sidebar");
  if (!menuBtn || !sidebar) return;

  menuBtn.addEventListener("click", function() {
    sidebar.classList.toggle("open");
  });
}
