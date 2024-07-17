function toggleSidebar() {
    var sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("active");
    var overlay = document.getElementById("overlay");
    overlay.style.display = (overlay.style.display == "block") ? "none" : "block";
  }

// document.addEventListener('DOMContentLoaded', function () {
//   const contactForm = document.getElementById('contact-form');
//   if (contactForm) {
//     contactForm.addEventListener('submit', function (event) {
//     const nameInput = document.querySelector('[name="name"]');
//     const emailInput = document.querySelector('[name="email"]');
//     const messageInput = document.querySelector('[name="text"]');
//     let isValid = true;

//     if (nameInput.value.trim() === '') {
//       isValid = false;
//       nameInput.classList.add('error');
//     } else {
//       nameInput.classList.remove('error');
//     }

//     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailPattern.test(emailInput.value)) {
//       isValid = false;
//       emailInput.classList.add('error');
//     } else {
//       emailInput.classList.remove('error');
//     }

//     if (messageInput.value.trim() === '') {
//       isValid = false;
//       messageInput.classList.add('error');
//     } else {
//       messageInput.classList.remove('error');
//     }

//     if (!isValid) {
//       event.preventDefault();
//     }

//     });
//   } else {
//     console.error("Form element with ID 'contact-form' not found.");
//   }
// });