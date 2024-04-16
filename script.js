function toggleSidebar() {
    var sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("active");
    var overlay = document.getElementById("overlay");
    overlay.style.display = (overlay.style.display == "block") ? "none" : "block";
  }