function getLevels(x) {
  if (x > 0 && x < 5) {
    return 1;
  } else if (x >= 5 && x < 7.5) {
    return 2;
  } else if (x >= 7.5 && x < 10) {
    return 3;
  } else if (x >= 10 && x < 15) {
    return 4;
  } else if (x >= 15 && x < 18) {
    return 5;
  } else if (x >= 18 && x < 21.1) {
    return 6;
  } else if (x >= 21.1 && x < 25) {
    return 7;
  } else if (x >= 25 && x < 30) {
    return 8;
  } else if (x >= 30 && x < 42.2) {
    return 9;
  } else if (x >= 42.2) {
    return 10;
  } else {
    return 0;
  }
}

function isRun(x){
  if (x>0) {
    return 1;
  } else {
    return 0;
  }
}

function makeSquares(myList, dateLinks, squares, id, offset) {
    // For text giving details of the year
    let sumrun = myList.reduce((total, val) => total + isRun(val[1]), 0);
    let sumkm = myList.reduce((total, val) => total + val[1], 0);
    let summin = myList.reduce((total, val) => total + val[2], 0);
    document.getElementById(id).textContent = `${sumrun} runs this year for a total of ${Math.round(sumkm*100)/100} km clocking ${Math.floor(summin/60)}h ${summin%60}m`;

    // -1 for adding empty sqaures as an offset for the starting week 
    for(let i of Array(offset).fill(-1)) {
    let li = document.createElement('li');
    li.dataset.level = i;
    squares.appendChild(li);
    }

    // Filling the colors and tool tip
    for(let i of myList) {
    const level = getLevels(i[1]);
    let li = document.createElement('li');
    li.dataset.level = level;
    li.title = "Date: " + i[0] + "\n" + "Distance: " + i[1] + " km";

    if (i[1] > 0) {
        if (dateLinks[i[0]]) {
        li.style.cursor = "pointer";
        li.addEventListener("click", function () {
            window.open(dateLinks[i[0]], "_blank");
        });
        }
    }

    squares.appendChild(li);
    }
}


fetch('/running/data.json')
  .then(response => response.json())
  .then(data => {
    const myList25 = data.myList25;
    const dateLinks25 = data.dateLinks25;
    const squares25 = document.querySelector('#run25 .squares'); 
    makeSquares(myList25, dateLinks25, squares25, 'sum25', 2);

    // const myList26 = data.myList26;
    // const dateLinks26 = data.dateLinks26;
    // const squares26 = document.querySelector('#run26 .squares'); 
    // makeSquares(myList26, dateLinks26, squares26, 'sum26', 4);
});

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
