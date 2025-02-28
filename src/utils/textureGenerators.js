import * as THREE from 'three';

/**
 * Creates a texture for Jupiter's Great Red Spot
 */
export const createSpotTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Set background transparent
  ctx.fillStyle = 'rgba(0, 0, 0, 0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw a more circular spot shape below the equator
  ctx.fillStyle = 'rgba(170, 34, 17, 1.0)';
  ctx.beginPath();
  ctx.ellipse(
    canvas.width * 0.18,    // x at 18% position
    canvas.height * 0.65,   // y at 65% (below center/equator)
    canvas.width * 0.07,    // radiusX - more circular width
    canvas.height * 0.065,  // radiusY - more circular height
    0,                      // rotation
    0,                      // start angle
    Math.PI * 2             // end angle
  );
  ctx.fill();
  
  // Create a texture from the canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  
  return texture;
};

/**
 * Creates a texture for Jupiter's bands
 */
export const createJupiterTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Base color
  ctx.fillStyle = '#E3B982';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Create horizontal bands with varying colors
  const bands = [
    { y: 0.15, height: 0.1, color: '#d6ae79' },    // Lighter band near top
    { y: 0.3, height: 0.05, color: '#c19055' },    // Darker band
    { y: 0.4, height: 0.05, color: '#e8c090' },    // Light band
    { y: 0.5, height: 0.05, color: '#c19055' },    // Dark band at equator
    { y: 0.6, height: 0.05, color: '#e8c090' },    // Light band
    { y: 0.7, height: 0.1, color: '#c19055' },     // Darker band
    { y: 0.85, height: 0.1, color: '#d6ae79' }     // Lighter band near bottom
  ];
  
  // Draw the bands
  bands.forEach(band => {
    ctx.fillStyle = band.color;
    ctx.fillRect(0, canvas.height * band.y, canvas.width, canvas.height * band.height);
  });
  
  // Add some subtle texture/turbulence to the bands
  for (let i = 0; i < 100; i++) {
    const y = Math.random() * canvas.height;
    const bandIndex = bands.findIndex(band => 
      y >= band.y * canvas.height && y < (band.y + band.height) * canvas.height
    );
    
    if (bandIndex >= 0) {
      // Determine which band we're in and use a slightly lighter/darker color
      const bandColor = bands[bandIndex].color;
      const shade = Math.random() < 0.5 ? 20 : -20;
      
      // Convert hex to RGB and adjust
      const r = parseInt(bandColor.slice(1, 3), 16) + shade;
      const g = parseInt(bandColor.slice(3, 5), 16) + shade;
      const b = parseInt(bandColor.slice(5, 7), 16) + shade;
      
      // Draw a small turbulence swirl
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.beginPath();
      const width = Math.random() * 100 + 50;
      const height = Math.random() * 10 + 5;
      ctx.ellipse(
        Math.random() * canvas.width,
        y,
        width,
        height,
        0, 0, Math.PI * 2
      );
      ctx.fill();
    }
  }
  
  // Create the texture
  return new THREE.CanvasTexture(canvas);
};

/**
 * Creates a texture for Earth with continents and oceans
 */
export const createEarthTexture = () => {
  // Create a canvas to draw on
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Base ocean color - deeper blue
  ctx.fillStyle = '#0a3d67';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Land masses with polygon style
  ctx.fillStyle = '#3c8c52'; // Brighter green land
  
  // North America
  ctx.beginPath();
  ctx.moveTo(190, 110);
  ctx.lineTo(225, 90);
  ctx.lineTo(260, 100);
  ctx.lineTo(285, 125);
  ctx.lineTo(280, 165);
  ctx.lineTo(250, 200);
  ctx.lineTo(225, 190);
  ctx.lineTo(200, 175);
  ctx.lineTo(190, 160);
  ctx.lineTo(185, 130);
  ctx.closePath();
  ctx.fill();
  
  // South America
  ctx.beginPath();
  ctx.moveTo(260, 275);
  ctx.lineTo(275, 300);
  ctx.lineTo(285, 350);
  ctx.lineTo(270, 390);
  ctx.lineTo(250, 410);
  ctx.lineTo(235, 395);
  ctx.lineTo(225, 340);
  ctx.lineTo(235, 300);
  ctx.lineTo(250, 275);
  ctx.closePath();
  ctx.fill();
  
  // Europe
  ctx.beginPath();
  ctx.moveTo(425, 125);
  ctx.lineTo(450, 115);
  ctx.lineTo(475, 125);
  ctx.lineTo(490, 145);
  ctx.lineTo(475, 160);
  ctx.lineTo(450, 170);
  ctx.lineTo(425, 160);
  ctx.lineTo(420, 140);
  ctx.closePath();
  ctx.fill();
  
  // Africa
  ctx.beginPath();
  ctx.moveTo(450, 190);
  ctx.lineTo(475, 175);
  ctx.lineTo(500, 185);
  ctx.lineTo(515, 225);
  ctx.lineTo(520, 275);
  ctx.lineTo(500, 325);
  ctx.lineTo(475, 350);
  ctx.lineTo(450, 335);
  ctx.lineTo(435, 300);
  ctx.lineTo(430, 260);
  ctx.lineTo(440, 225);
  ctx.closePath();
  ctx.fill();
  
  // Asia
  ctx.beginPath();
  ctx.moveTo(490, 150);
  ctx.lineTo(525, 135);
  ctx.lineTo(575, 125);
  ctx.lineTo(650, 140);
  ctx.lineTo(700, 165);
  ctx.lineTo(725, 190);
  ctx.lineTo(710, 225);
  ctx.lineTo(675, 235);
  ctx.lineTo(625, 225);
  ctx.lineTo(575, 215);
  ctx.lineTo(540, 200);
  ctx.lineTo(500, 175);
  ctx.closePath();
  ctx.fill();
  
  // Australia
  ctx.beginPath();
  ctx.moveTo(775, 325);
  ctx.lineTo(800, 315);
  ctx.lineTo(840, 325);
  ctx.lineTo(860, 350);
  ctx.lineTo(850, 375);
  ctx.lineTo(825, 390);
  ctx.lineTo(800, 380);
  ctx.lineTo(785, 360);
  ctx.lineTo(780, 340);
  ctx.closePath();
  ctx.fill();
  
  // Ice caps with polygon style
  ctx.fillStyle = '#f0f0f0'; // Snow white
  
  // Antarctica - polygon ring around the bottom
  ctx.beginPath();
  const centerX = 512;
  const centerY = 450;
  const radius = 60;
  const sides = 12; // Number of sides for the polygon
  
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  
  ctx.closePath();
  ctx.fill();
  
  // North pole - polygon
  ctx.beginPath();
  const npCenterX = 512;
  const npCenterY = 60;
  const npRadius = 75;
  const npSides = 12;
  
  for (let i = 0; i < npSides; i++) {
    const angle = (i / npSides) * Math.PI * 2;
    const x = npCenterX + Math.cos(angle) * npRadius;
    const y = npCenterY + Math.sin(angle) * npRadius;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  
  ctx.closePath();
  ctx.fill();
  
  // Greenland - polygon
  ctx.beginPath();
  ctx.moveTo(350, 90);
  ctx.lineTo(375, 80);
  ctx.lineTo(390, 90);
  ctx.lineTo(395, 105);
  ctx.lineTo(385, 120);
  ctx.lineTo(370, 125);
  ctx.lineTo(355, 115);
  ctx.lineTo(350, 100);
  ctx.closePath();
  ctx.fill();
  
  // Create a texture from the canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  
  return texture;
};

/**
 * Creates a cloud texture for Earth with minimal cloud formations
 */
export const createCloudTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Clear background to transparent
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw polygonal cloud formations
  ctx.fillStyle = '#ffffff';
  
  // Just a few cloud formations with sharp polygon shapes
  const cloudFormations = [
    // Formation 1 - North Pacific
    {
      points: [
        [250, 150], [275, 140], [300, 150], 
        [310, 170], [290, 190], [260, 185], [245, 170]
      ]
    },
    // Formation 2 - South Atlantic
    {
      points: [
        [325, 300], [350, 290], [370, 300], 
        [365, 325], [345, 335], [320, 325]
      ]
    },
    // Formation 3 - Europe/Atlantic
    {
      points: [
        [400, 150], [420, 140], [440, 145],
        [445, 165], [430, 175], [410, 170], [395, 160]
      ]
    }
  ];
  
  // Draw each cloud formation as a polygon
  cloudFormations.forEach(formation => {
    ctx.beginPath();
    const { points } = formation;
    
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0], points[i][1]);
    }
    
    ctx.closePath();
    ctx.fill();
  });
  
  // Add a few smaller polygon clouds
  const smallClouds = 4; // Very few clouds
  for (let i = 0; i < smallClouds; i++) {
    const centerX = Math.random() * canvas.width;
    const centerY = Math.random() * canvas.height;
    const sides = Math.floor(Math.random() * 3) + 5; // 5-7 sides
    const radius = Math.random() * 20 + 10;
    
    ctx.beginPath();
    
    for (let j = 0; j < sides; j++) {
      const angle = (j / sides) * Math.PI * 2;
      // Add some randomness to the radius for each point
      const pointRadius = radius * (0.8 + Math.random() * 0.4);
      const x = centerX + Math.cos(angle) * pointRadius;
      const y = centerY + Math.sin(angle) * pointRadius;
      
      if (j === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.closePath();
    ctx.fill();
  }
  
  // Create a texture from the canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.transparent = true;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  
  return texture;
};

/**
 * Creates a texture for Saturn's rings
 */
export const createDetailedSaturnRingsTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  
  // Clear canvas with full transparency
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Create ring bands with varying opacities and colors
  const rings = [
    { radius: 0.55, width: 0.03, color: 'rgba(180, 140, 100, 0.05)', name: 'D Ring' },
    { radius: 0.58, width: 0.03, color: 'rgba(210, 180, 130, 0.1)', name: 'C Ring' },
    { radius: 0.61, width: 0.01, color: 'rgba(100, 80, 60, 0.15)', name: 'Maxwell Gap' },
    { radius: 0.62, width: 0.05, color: 'rgba(210, 180, 130, 0.3)', name: 'B Ring (inner)' },
    { radius: 0.67, width: 0.05, color: 'rgba(240, 220, 170, 0.7)', name: 'B Ring (middle)' },
    { radius: 0.72, width: 0.03, color: 'rgba(220, 190, 140, 0.5)', name: 'B Ring (outer)' },
    { radius: 0.75, width: 0.02, color: 'rgba(150, 130, 100, 0.1)', name: 'Cassini Division' },
    { radius: 0.77, width: 0.08, color: 'rgba(240, 210, 160, 0.4)', name: 'A Ring' },
    { radius: 0.85, width: 0.01, color: 'rgba(120, 100, 80, 0.05)', name: 'Encke Gap' },
    { radius: 0.86, width: 0.04, color: 'rgba(220, 190, 150, 0.2)', name: 'A Ring (outer)' },
    { radius: 0.91, width: 0.04, color: 'rgba(200, 170, 130, 0.05)', name: 'F Ring' }
  ];
  
  // Draw center of the canvas as transparent
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const maxRadius = Math.min(centerX, centerY);
  
  // Draw the ring bands as concentric circles
  rings.forEach(ring => {
    const innerRadius = ring.radius * maxRadius;
    const outerRadius = (ring.radius + ring.width) * maxRadius;
    
    // Create a radial gradient for each ring
    const gradient = ctx.createRadialGradient(
      centerX, centerY, innerRadius,
      centerX, centerY, outerRadius
    );
    
    gradient.addColorStop(0, ring.color);
    
    // Add some variation within each ring - safely parse colors
    const colorMatch = ring.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    if (colorMatch) {
      const r = parseInt(colorMatch[1]);
      const g = parseInt(colorMatch[2]);
      const b = parseInt(colorMatch[3]);
      const a = parseFloat(colorMatch[4]);
      
      // Safely create middle color with adjusted opacity
      gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${a * 0.9})`);
      
      // Safely create end color with adjusted opacity
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${a * 0.7})`);
    } else {
      // Fallback if parsing fails
      gradient.addColorStop(0.5, ring.color);
      gradient.addColorStop(1, ring.color);
    }
    
    // Draw the ring
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2, true);
    ctx.fill();
  });
  
  // Add some particle detail/grain to the rings
  const numParticles = 5000;
  for (let i = 0; i < numParticles; i++) {
    // Random angle and distance from center
    const angle = Math.random() * Math.PI * 2;
    const minRadius = 0.55 * maxRadius; // Inner edge of rings
    const maxRingRadius = 0.95 * maxRadius; // Outer edge of rings
    const distance = minRadius + Math.random() * (maxRingRadius - minRadius);
    
    // Calculate position
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    
    // Vary particle brightness based on ring section
    const ringSection = rings.find(ring => {
      const r = distance / maxRadius;
      return r >= ring.radius && r < (ring.radius + ring.width);
    });
    
    let opacity = 0.7;
    if (ringSection) {
      // Extract opacity from the rgba color - safer parsing
      const match = ringSection.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
      if (match) {
        opacity = parseFloat(match[4]) * (Math.random() * 0.5 + 0.5);
      }
    }
    
    // Draw a small particle
    const size = Math.random() * 1.5 + 0.5;
    ctx.fillStyle = `rgba(255, 240, 220, ${opacity})`;
    ctx.fillRect(x - size/2, y - size/2, size, size);
  }
  
  // Add radial streaks for a more dynamic appearance
  const numStreaks = 200;
  for (let i = 0; i < numStreaks; i++) {
    const angle = Math.random() * Math.PI * 2;
    const minRadius = 0.55 * maxRadius;
    const maxRingRadius = 0.95 * maxRadius;
    
    // Create streaks of varying lengths
    const startDistance = minRadius + Math.random() * (maxRingRadius - minRadius);
    const length = Math.random() * 20 + 5;
    const endDistance = Math.min(startDistance + length, maxRingRadius);
    
    // Starting and ending points
    const startX = centerX + Math.cos(angle) * startDistance;
    const startY = centerY + Math.sin(angle) * startDistance;
    const endX = centerX + Math.cos(angle) * endDistance;
    const endY = centerY + Math.sin(angle) * endDistance;
    
    // Draw the streak
    ctx.strokeStyle = `rgba(255, 240, 220, ${Math.random() * 0.2})`;
    ctx.lineWidth = Math.random() * 1.5 + 0.5;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }
  
  // Clear center hole for the planet
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 0.4 * maxRadius, 0, Math.PI * 2);
  ctx.fill();
  
  // Reset composite operation
  ctx.globalCompositeOperation = 'source-over';
  
  // Create texture
  const texture = new THREE.CanvasTexture(canvas);
  texture.rotation = Math.PI / 2;
  texture.center = new THREE.Vector2(0.5, 0.5);
  
  return texture;
};

/**
 * Creates a texture for the moon's surface with craters
 */
export const createMoonTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Base color - brighter white/gray
  ctx.fillStyle = '#E8E8E8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add darker base regions for maria (lunar seas)
  const maria = [
    { x: 400, y: 200, radius: 120 }, // Mare Imbrium
    { x: 550, y: 280, radius: 80 },  // Mare Serenitatis
    { x: 600, y: 380, radius: 70 },  // Mare Tranquillitatis
    { x: 650, y: 200, radius: 60 },  // Mare Frigoris
    { x: 480, y: 350, radius: 90 },  // Mare Nubium
  ];
  
  // Fill maria with slightly darker color - lighter than before
  ctx.fillStyle = '#C0C0C0';
  maria.forEach(mare => {
    ctx.beginPath();
    ctx.arc(mare.x, mare.y, mare.radius, 0, Math.PI * 2);
    ctx.fill();
  });
  
  // Add craters
  const craters = 100;
  for (let i = 0; i < craters; i++) {
    const size = Math.random() * 30 + 5;
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    
    // Crater outer rim - slightly brighter
    ctx.fillStyle = '#DDDDDD';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Crater inner area - darker
    ctx.fillStyle = '#999999';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.85, 0, Math.PI * 2);
    ctx.fill();
    
    // Crater floor - darkest
    ctx.fillStyle = '#888888';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Add some small craters for detail
  for (let i = 0; i < 200; i++) {
    const size = Math.random() * 8 + 1;
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    
    // Small crater with simple design
    ctx.fillStyle = '#999999';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
};

/**
 * Creates a detailed texture for Jupiter's Great Red Spot with highlights
 */
export const createDetailedRedSpotTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  
  // Clear the canvas and make transparent
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(0, 0, 0, 0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Create the red spot with more vibrant color and proper shape/position
  ctx.fillStyle = 'rgba(204, 34, 0, 0.9)';
  
  // Draw a more circular spot below the equator
  ctx.beginPath();
  ctx.ellipse(
    canvas.width * 0.25,     // x position - quarter from left
    canvas.height * 0.65,    // below equator (65% down)
    canvas.width * 0.09,     // x radius - more circular
    canvas.height * 0.085,   // y radius - more circular
    0, 0, Math.PI * 2        // rotation, start angle, end angle
  );
  ctx.fill();
  
  // Add a highlight to give it some depth
  ctx.fillStyle = 'rgba(240, 60, 30, 0.6)';
  ctx.beginPath();
  ctx.ellipse(
    canvas.width * 0.24,     // slightly offset from center
    canvas.height * 0.64,    // slightly offset from center
    canvas.width * 0.05,     // smaller radius
    canvas.height * 0.045,   // smaller radius
    0, 0, Math.PI * 2
  );
  ctx.fill();
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.premultiplyAlpha = true;
  
  return texture;
};

/**
 * Creates a texture with Jupiter's horizontal bands
 */
export const createJupiterBandsTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  
  // Base color - light tan base
  ctx.fillStyle = '#E3B982';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Define the horizontal bands with varying colors - softened edges
  const bands = [
    { y: 0.05, height: 0.05, color: '#ddb277' },   // North polar region - light tan
    { y: 0.1, height: 0.1, color: '#c19865' },     // North temperate belt - darker brown
    { y: 0.2, height: 0.05, color: '#e8c090' },    // North temperate zone - lighter
    { y: 0.25, height: 0.08, color: '#ba8550' },   // North tropical belt - dark orange-brown
    { y: 0.33, height: 0.1, color: '#e8c090' },    // Equatorial zone - light tan
    { y: 0.43, height: 0.07, color: '#9a7550' },   // South equatorial belt - dark brown (widest)
    { y: 0.5, height: 0.08, color: '#e3b982' },    // South tropical zone - medium tan
    { y: 0.58, height: 0.07, color: '#ba8550' },   // South temperate belt - orange-brown
    { y: 0.65, height: 0.15, color: '#ddb277' },   // South temperate zone - light tan
    { y: 0.8, height: 0.15, color: '#c19865' }     // South polar region - medium tan
  ];
  
  // Draw the bands with gradient transitions to avoid hard edges
  bands.forEach((band, index) => {
    // For each band, create a gradient transition to the next band
    const yStart = canvas.height * band.y;
    const yEnd = yStart + (canvas.height * band.height);
    
    // Create gradient for smooth transition between bands
    const gradient = ctx.createLinearGradient(0, yStart, 0, yEnd);
    gradient.addColorStop(0, band.color);
    
    // Blend with next band color at the edge (if not the last band)
    if (index < bands.length - 1) {
      gradient.addColorStop(1, bands[index + 1].color);
    } else {
      gradient.addColorStop(1, band.color);
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, yStart, canvas.width, yEnd - yStart);
  });
  
  // Add subtle turbulence and swirls to each band - softer than before
  bands.forEach(band => {
    const yStart = canvas.height * band.y;
    const height = canvas.height * band.height;
    
    // Parse the band color and determine a slightly lighter and darker shade
    const r = parseInt(band.color.slice(1, 3), 16);
    const g = parseInt(band.color.slice(3, 5), 16);
    const b = parseInt(band.color.slice(5, 7), 16);
    
    // Add swirls and turbulence within each band - fewer, more subtle
    const numSwirls = Math.floor(height / 15); // Fewer swirls
    for (let i = 0; i < numSwirls; i++) {
      const y = yStart + Math.random() * height;
      
      // Use more subtle color variations
      const shade = Math.random() < 0.5 ? 10 : -10; // Less contrast
      const swirl_r = Math.min(255, Math.max(0, r + shade));
      const swirl_g = Math.min(255, Math.max(0, g + shade)); 
      const swirl_b = Math.min(255, Math.max(0, b + shade));
      
      // Draw elongated ellipse for turbulent flow pattern with reduced opacity
      ctx.fillStyle = `rgba(${swirl_r}, ${swirl_g}, ${swirl_b}, 0.7)`; // More transparent
      ctx.beginPath();
      
      // Vary the width of swirls a lot, but keep them very flat
      const width = Math.random() * 250 + 100;
      const swirlHeight = Math.random() * 6 + 2; // Much flatter
      
      ctx.ellipse(
        Math.random() * canvas.width,
        y,
        width,
        swirlHeight,
        0, 0, Math.PI * 2
      );
      ctx.fill();
    }
  });
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
};

/**
 * Creates a texture for Io (Galilean moon of Jupiter)
 * Yellowish with sulfur volcano features
 */
export const createIoTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Base color - yellowish sulfur surface
  ctx.fillStyle = '#E8D14C';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add volcanic regions
  const volcanicSpots = 30;
  for (let i = 0; i < volcanicSpots; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 40 + 20;
    
    // Dark volcanic deposits
    ctx.fillStyle = `rgba(80, 30, 10, ${Math.random() * 0.6 + 0.3})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Add bright sulfur deposits
  const sulfurDeposits = 50;
  for (let i = 0; i < sulfurDeposits; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 20 + 5;
    
    // Bright sulfur colors
    ctx.fillStyle = `rgba(255, 240, 130, ${Math.random() * 0.5 + 0.3})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Add some reddish areas (sulfur allotropes)
  const redAreas = 15;
  for (let i = 0; i < redAreas; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 60 + 30;
    
    ctx.fillStyle = `rgba(200, 50, 10, ${Math.random() * 0.4 + 0.1})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
};

/**
 * Creates a texture for Europa (Galilean moon of Jupiter)
 * Icy surface with distinctive linear features
 */
export const createEuropaTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Base color - white icy surface
  ctx.fillStyle = '#F0F8FF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add subtle blue-tinted regions
  const icyRegions = 20;
  for (let i = 0; i < icyRegions; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 100 + 50;
    
    ctx.fillStyle = `rgba(220, 230, 255, ${Math.random() * 0.3 + 0.1})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Add Europan "linea" (crack features in the ice)
  const lineCount = 40;
  for (let i = 0; i < lineCount; i++) {
    const startX = Math.random() * canvas.width;
    const startY = Math.random() * canvas.height;
    const length = Math.random() * 200 + 100;
    const angle = Math.random() * Math.PI * 2;
    
    // Calculate end point
    const endX = startX + Math.cos(angle) * length;
    const endY = startY + Math.sin(angle) * length;
    
    // Draw a reddish-brown line
    ctx.strokeStyle = `rgba(160, 80, 50, ${Math.random() * 0.6 + 0.3})`;
    ctx.lineWidth = Math.random() * 3 + 1;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }
  
  // Add subtle craters
  const craterCount = 15;
  for (let i = 0; i < craterCount; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 15 + 5;
    
    // Subtle crater rim
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Darker crater interior
    ctx.fillStyle = `rgba(180, 190, 210, 0.6)`;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
};

/**
 * Creates a texture for Ganymede (Galilean moon of Jupiter)
 * Mix of darker and lighter terrain with groove features
 */
export const createGanymedeTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Base color - light gray
  ctx.fillStyle = '#C0C8D0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add dark terrain regions
  const darkRegions = 12;
  for (let i = 0; i < darkRegions; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 150 + 80;
    
    ctx.fillStyle = '#707890';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Add light terrain (grooved terrain)
  const lightRegions = 15;
  for (let i = 0; i < lightRegions; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 120 + 60;
    
    ctx.fillStyle = '#D8E0E8';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Add groove patterns
  const grooveCount = 60;
  for (let i = 0; i < grooveCount; i++) {
    const startX = Math.random() * canvas.width;
    const startY = Math.random() * canvas.height;
    const length = Math.random() * 100 + 50;
    const angle = Math.random() * Math.PI * 2;
    
    // Calculate end point
    const endX = startX + Math.cos(angle) * length;
    const endY = startY + Math.sin(angle) * length;
    
    // Draw groove
    ctx.strokeStyle = `rgba(120, 130, 150, ${Math.random() * 0.5 + 0.3})`;
    ctx.lineWidth = Math.random() * 2 + 1;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }
  
  // Add craters
  const craterCount = 30;
  for (let i = 0; i < craterCount; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 20 + 5;
    
    // Crater rim
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Crater interior
    ctx.fillStyle = '#909090';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
};

/**
 * Creates a texture for Callisto (Galilean moon of Jupiter)
 * Heavily cratered dark surface
 */
export const createCallistoTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Base color - medium gray
  ctx.fillStyle = '#8A8A98';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add lighter regions
  const lightRegions = 12;
  for (let i = 0; i < lightRegions; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 120 + 100;
    
    ctx.fillStyle = '#A0A0B0';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Add even lighter patches
  const brighterRegions = 5;
  for (let i = 0; i < brighterRegions; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 80 + 40;
    
    ctx.fillStyle = '#C0C0C8';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Add many small craters
  const smallCraterCount = 300;
  for (let i = 0; i < smallCraterCount; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 8 + 2;
    
    // Crater rim
    ctx.fillStyle = '#808080';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Crater interior
    ctx.fillStyle = '#404050';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Add large, more prominent craters
  const largeCraterCount = 50;
  for (let i = 0; i < largeCraterCount; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 25 + 15;
    
    // Crater rim - brighter
    ctx.fillStyle = '#C0C0C8';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Crater wall
    ctx.fillStyle = '#7A7A88';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.85, 0, Math.PI * 2);
    ctx.fill();
    
    // Crater floor
    ctx.fillStyle = '#656575';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Add Valhalla impact basin (largest crater on Callisto)
  const valhallaX = canvas.width * 0.7;
  const valhallaY = canvas.height * 0.4;
  const valhallaSize = canvas.width * 0.15;
  
  // Multiple rings for Valhalla impact basin
  for (let i = 0; i < 5; i++) {
    const ringSize = valhallaSize * (1 + i * 0.2);
    ctx.strokeStyle = `rgba(120, 120, 140, ${0.7 - i * 0.12})`;
    ctx.lineWidth = 2 + i;
    ctx.beginPath();
    ctx.arc(valhallaX, valhallaY, ringSize, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
};

/**
 * Creates a texture for Titan (Saturn's largest moon)
 * Orange-yellow hazy atmosphere with methane lakes
 */
export const createTitanTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Base color - orange-yellow for the hazy atmosphere
  ctx.fillStyle = '#E8A952';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Create atmospheric haze effect
  for (let i = 0; i < 20; i++) {
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, 
      canvas.height / 2, 
      0,
      canvas.width / 2, 
      canvas.height / 2, 
      canvas.width / 2 + Math.random() * 100
    );
    
    gradient.addColorStop(0, 'rgba(232, 169, 82, 0)');
    gradient.addColorStop(0.5, `rgba(232, 169, 82, ${Math.random() * 0.05})`);
    gradient.addColorStop(1, 'rgba(232, 169, 82, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  // Add darker terrain variations
  const darkPatches = 15;
  for (let i = 0; i < darkPatches; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 150 + 50;
    
    ctx.fillStyle = `rgba(200, 140, 60, ${Math.random() * 0.3 + 0.1})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Add methane lakes (dark bluish patches)
  const lakeCount = 8;
  for (let i = 0; i < lakeCount; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 60 + 30;
    
    // Dark methane lake
    ctx.fillStyle = `rgba(40, 60, 80, ${Math.random() * 0.5 + 0.3})`;
    
    // Draw lake with uneven edges to look more natural
    ctx.beginPath();
    
    // Create an irregular polygon for the lake
    const points = 10 + Math.floor(Math.random() * 8);
    for (let j = 0; j < points; j++) {
      const angle = (j / points) * Math.PI * 2;
      const radius = size * (0.7 + Math.random() * 0.6); // Vary the radius
      const lakeX = x + Math.cos(angle) * radius;
      const lakeY = y + Math.sin(angle) * radius;
      
      if (j === 0) {
        ctx.moveTo(lakeX, lakeY);
      } else {
        ctx.lineTo(lakeX, lakeY);
      }
    }
    
    ctx.closePath();
    ctx.fill();
  }
  
  // Add lighter highland regions
  const highlandCount = 10;
  for (let i = 0; i < highlandCount; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 100 + 80;
    
    ctx.fillStyle = `rgba(255, 200, 130, ${Math.random() * 0.2 + 0.1})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Create the haze layer effect by adding a semi-transparent overlay
  ctx.fillStyle = 'rgba(240, 180, 100, 0.15)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add subtle cloud formations in the upper atmosphere
  const cloudCount = 12;
  for (let i = 0; i < cloudCount; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const width = Math.random() * 200 + 100;
    const height = Math.random() * 40 + 20;
    
    ctx.fillStyle = `rgba(255, 220, 180, ${Math.random() * 0.15 + 0.05})`;
    ctx.beginPath();
    ctx.ellipse(x, y, width, height, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
};