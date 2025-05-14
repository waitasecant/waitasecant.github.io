// Continuous scrolling based on cursor position
// Cursor position acts as a "throttle" controlling direction and speed
// Stops movement when background reaches either end (0% or 100%)

document.addEventListener('DOMContentLoaded', function() {
  const body = document.querySelector('body.p404');
  if (!body) {
    return; // Skip the animation completely for pages without the p404 class
  }
  const maxSpeed = 0.5; // Maximum speed of background movement per frame
  const deadZoneWidth = 100; // pixels around center where no movement occurs
  let isMouseOver = false;
  let currentPosX = 50; // Current background position X percentage
  let speed = 0; // Current speed of background movement
  
  function animate() {
    // Update position continuously based on current speed
    if (speed !== 0) {
      const nextPosX = currentPosX + speed;
      // Stop movement if next position goes beyond bounds
      if (nextPosX > 100) {
        currentPosX = 100;
        speed = 0;
      } else if (nextPosX < 0) {
        currentPosX = 0;
        speed = 0;
      } else {
        currentPosX = nextPosX;
      }
      
      // Apply position
      body.style.backgroundPosition = `${currentPosX}% 50%`;
    }
    
    // Continue animation
    requestAnimationFrame(animate);
  }
  
  // Start animation loop
  animate();
  
  document.addEventListener('mousemove', function(e) {
    if (!isMouseOver) return;
    
    const mouseX = e.clientX;
    const centerX = window.innerWidth / 2;
    const distanceFromCenter = mouseX - centerX;
    
    // Check if inside dead zone
    if (Math.abs(distanceFromCenter) < deadZoneWidth / 2) {
      // Inside dead zone - no movement
      speed = 0;
      return;
    }
    
    // Calculate speed based on position (not movement)
    if (distanceFromCenter > 0) {
      // In right half: move left (negative speed)
      const percentToEdge = (distanceFromCenter - deadZoneWidth / 2) / (centerX - deadZoneWidth / 2);
      speed = -maxSpeed * Math.min(1, percentToEdge);
    } else {
      // In left half: move right (positive speed)
      const percentToEdge = (Math.abs(distanceFromCenter) - deadZoneWidth / 2) / (centerX - deadZoneWidth / 2);
      speed = maxSpeed * Math.min(1, percentToEdge);
    }
  });
  
  document.addEventListener('mouseenter', function() {
    isMouseOver = true;
  });
  
  document.addEventListener('mouseleave', function() {
    isMouseOver = false;
    speed = 0; // Stop movement when mouse leaves
  });
  
  document.addEventListener('touchmove', function(e) {
    if (e.touches.length === 1) {
      const touch = e.touches[0]; // Fixed: access first touch element
      const mouseX = touch.clientX;
      const centerX = window.innerWidth / 2;
      const distanceFromCenter = mouseX - centerX;
      
      if (Math.abs(distanceFromCenter) < deadZoneWidth / 2) {
        speed = 0;
        return;
      }
      
      if (distanceFromCenter > 0) {
        const percentToEdge = (distanceFromCenter - deadZoneWidth / 2) / (centerX - deadZoneWidth / 2);
        speed = -maxSpeed * Math.min(1, percentToEdge);
      } else {
        const percentToEdge = (Math.abs(distanceFromCenter) - deadZoneWidth / 2) / (centerX - deadZoneWidth / 2);
        speed = maxSpeed * Math.min(1, percentToEdge);
      }
    }
  });
});
