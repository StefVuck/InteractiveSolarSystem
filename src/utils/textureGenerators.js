import * as THREE from 'three';

/**
 * Creates enhanced Earth texture with realistic continents, oceans and terrain
 */
export const createEnhancedEarthTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  
  // Base ocean color (deep blue)
  const oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGradient.addColorStop(0, '#0A3265'); // Darker blue at poles
  oceanGradient.addColorStop(0.3, '#0E4C95'); // Mid blue at mid latitudes
  oceanGradient.addColorStop(0.5, '#1265C0'); // Bright blue at equator
  oceanGradient.addColorStop(0.7, '#0E4C95'); // Mid blue at mid latitudes
  oceanGradient.addColorStop(1, '#0A3265'); // Darker blue at poles
  
  ctx.fillStyle = oceanGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Use the existing detailed continents drawing function which already has
  // all continents with proper detail and placement
  drawDetailedContinents(ctx, canvas.width, canvas.height);
  
 
  // Create a texture from the canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  
  return texture;
};

/**
 * Creates a sparse cloud texture with subtle formations
 */
export const createEnhancedCloudTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  
  // Clear canvas with transparency
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Helper function to create a cloud formation
  const createCloudFormation = (x, y, width, height, density) => {
    ctx.save();
    
    // Create cloud cluster with varied opacity - significantly reduced opacity
    for (let i = 0; i < density; i++) {
      const cloudX = x + (Math.random() - 0.5) * width * 0.8;
      const cloudY = y + (Math.random() - 0.5) * height * 0.8;
      const cloudSize = (Math.random() * 0.5 + 0.5) * Math.min(width, height) * 0.3; // Smaller clouds
      const opacity = Math.random() * 0.15 + 0.15; // Much more transparent clouds
      
      // Create gradient for softer cloud edges
      const gradient = ctx.createRadialGradient(
        cloudX, cloudY, 0,
        cloudX, cloudY, cloudSize
      );
      gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
      gradient.addColorStop(0.7, `rgba(255, 255, 255, ${opacity * 0.7})`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cloudX, cloudY, cloudSize, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  };
  
  // Create just a few major cloud formations - significantly reduced count
  createCloudFormation(canvas.width * 0.2, canvas.height * 0.3, canvas.width * 0.12, canvas.height * 0.08, 15);
  createCloudFormation(canvas.width * 0.7, canvas.height * 0.7, canvas.width * 0.1, canvas.height * 0.07, 12);
  
  // Create minimal cloud bands - reduced count
  for (let i = 0; i < 5; i++) {
    // Tropical and temperate cloud bands - more sparse
    const y1 = canvas.height * (0.5 + (Math.random() * 0.2 - 0.1)); // Equatorial
    const y2 = Math.random() > 0.5 ? 
               canvas.height * (0.3 + (Math.random() * 0.1 - 0.05)) : // Northern temperate
               canvas.height * (0.7 + (Math.random() * 0.1 - 0.05));  // Southern temperate
    
    createCloudFormation(
      canvas.width * Math.random(),
      y1,
      canvas.width * (Math.random() * 0.08 + 0.04),
      canvas.height * 0.04,
      8
    );
    
    createCloudFormation(
      canvas.width * Math.random(),
      y2,
      canvas.width * (Math.random() * 0.12 + 0.06),
      canvas.height * 0.05,
      10
    );
  }
  
  // Create a few frontal systems - reduced count
  for (let i = 0; i < 3; i++) {
    const y = canvas.height * (Math.random() * 0.6 + 0.2);
    const width = canvas.width * (Math.random() * 0.2 + 0.1); // Shorter
    const height = canvas.height * (Math.random() * 0.02 + 0.01); // Thinner
    const x = canvas.width * Math.random();
    
    // Draw elongated cloud formation - more transparent
    for (let j = 0; j < 10; j++) {
      const cloudX = x + (j / 10) * width;
      const cloudY = y + (Math.random() - 0.5) * height * 2;
      const cloudSize = height * (Math.random() * 0.5 + 0.5);
      
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.2 + 0.2})`; // Lower opacity
      ctx.beginPath();
      ctx.ellipse(
        cloudX, 
        cloudY, 
        cloudSize * 2, 
        cloudSize, 
        0, 0, Math.PI * 2
      );
      ctx.fill();
    }
  }
  
  // Create a texture from the canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  
  return texture;
};

/**
 * Creates Earth bump map for mountain ranges and terrain
 */
export const createEarthBumpMap = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  
  // Start with black background (no displacement)
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Helper function to create mountain range
  const createMountainRange = (points, maxHeight, blur) => {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    ctx.closePath();
    
    // Create gradient for mountains with height falloff
    const gradient = ctx.createLinearGradient(
      points[0].x, points[0].y,
      points[Math.floor(points.length/2)].x, points[Math.floor(points.length/2)].y
    );
    gradient.addColorStop(0, `rgba(255, 255, 255, ${maxHeight * 0.4})`);
    gradient.addColorStop(0.5, `rgba(255, 255, 255, ${maxHeight})`);
    gradient.addColorStop(1, `rgba(255, 255, 255, ${maxHeight * 0.3})`);
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Apply blur if specified
    if (blur) {
      ctx.filter = `blur(${blur}px)`;
      ctx.fill();
      ctx.filter = 'none';
    }
  };
  
  
  // Add randomized small terrain features across all continents
  for (let i = 0; i < 50; i++) {
    const x = canvas.width * Math.random();
    const y = canvas.height * Math.random();
    const size = Math.random() * 30 + 10;
    const height = Math.random() * 0.3 + 0.1;
    
    ctx.fillStyle = `rgba(255, 255, 255, ${height})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Apply blur for smoother appearance
    ctx.filter = 'blur(10px)';
    ctx.fill();
    ctx.filter = 'none';
  }
  
  // Create texture
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  
  return texture;
};

/**
 * Creates Earth specular map for water reflections
 */
export const createEarthSpecularMap = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  
  // Full black base (no specular by default)
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Helper function to create rough continent shapes
  // These shapes should match the shapes in createEnhancedEarthTexture
  const drawContinentShape = (points) => {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    ctx.closePath();
    ctx.fill();
  };
  
  // Set fill style for land (black = no specular)
  ctx.fillStyle = '#000000';
  
  // Invert the canvas to make water reflective (white = high specular)
  // This creates a negative of the image, where oceans are white (reflective)
  // and land is black (not reflective)
  ctx.globalCompositeOperation = 'difference';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Create the texture
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  
  return texture;
};

/**
 * Creates Earth night lights map for illuminated cities
 */
export const createEarthLightsMap = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  
  // Start with black background (dark night side)
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Helper function to create city light
  const createCityLight = (x, y, size, intensity) => {
    const gradient = ctx.createRadialGradient(
      x, y, 0,
      x, y, size
    );
    gradient.addColorStop(0, `rgba(255, 240, 190, ${intensity})`);
    gradient.addColorStop(0.4, `rgba(255, 240, 190, ${intensity * 0.6})`);
    gradient.addColorStop(1, 'rgba(255, 240, 190, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  };
  
  // Helper function to create urban area
  const createUrbanArea = (centerX, centerY, radius, density) => {
    for (let i = 0; i < density; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      const size = Math.random() * 10 + 2;
      const intensity = Math.random() * 0.7 + 0.3; // Increased brightness
      
      createCityLight(x, y, size, intensity);
    }
  };
  
  // Define major urban areas around the world with updated coordinates to match 
  // our new continent shapes
  const urbanAreas = [
    // North America
    { x: canvas.width * 0.23, y: canvas.height * 0.27, radius: 25, density: 70 }, // US East Coast/New York
    { x: canvas.width * 0.19, y: canvas.height * 0.29, radius: 20, density: 50 }, // US Midwest/Chicago
    { x: canvas.width * 0.16, y: canvas.height * 0.3, radius: 20, density: 40 },  // US West Coast/LA & SF
    { x: canvas.width * 0.20, y: canvas.height * 0.37, radius: 15, density: 30 }, // Mexico City
    { x: canvas.width * 0.23, y: canvas.height * 0.23, radius: 15, density: 25 }, // Toronto/Montreal
    
    // Europe
    { x: canvas.width * 0.42, y: canvas.height * 0.22, radius: 25, density: 70 }, // Western Europe/Paris
    { x: canvas.width * 0.46, y: canvas.height * 0.22, radius: 20, density: 60 }, // Central Europe/Germany
    { x: canvas.width * 0.48, y: canvas.height * 0.19, radius: 20, density: 50 }, // Eastern Europe
    { x: canvas.width * 0.38, y: canvas.height * 0.19, radius: 10, density: 20 }, // UK/London
    { x: canvas.width * 0.47, y: canvas.height * 0.27, radius: 15, density: 35 }, // Italy/Rome
    
    // Asia
    { x: canvas.width * 0.77, y: canvas.height * 0.27, radius: 30, density: 80 }, // Eastern China/Shanghai
    { x: canvas.width * 0.79, y: canvas.height * 0.25, radius: 20, density: 60 }, // Japan/Tokyo
    { x: canvas.width * 0.74, y: canvas.height * 0.31, radius: 20, density: 50 }, // Southern China/Hong Kong
    { x: canvas.width * 0.62, y: canvas.height * 0.37, radius: 25, density: 60 }, // India/Delhi/Mumbai
    { x: canvas.width * 0.70, y: canvas.height * 0.38, radius: 15, density: 40 }, // Southeast Asia/Bangkok
    { x: canvas.width * 0.56, y: canvas.height * 0.32, radius: 20, density: 45 }, // Middle East/Saudi Arabia
    
    // South America
    { x: canvas.width * 0.25, y: canvas.height * 0.62, radius: 20, density: 40 }, // Brazil/São Paulo
    { x: canvas.width * 0.27, y: canvas.height * 0.59, radius: 15, density: 30 }, // Brazil/Rio
    { x: canvas.width * 0.23, y: canvas.height * 0.72, radius: 10, density: 25 }, // Argentina/Buenos Aires
    
    // Africa
    { x: canvas.width * 0.46, y: canvas.height * 0.32, radius: 15, density: 35 }, // North Africa/Cairo
    { x: canvas.width * 0.49, y: canvas.height * 0.62, radius: 15, density: 25 }, // South Africa/Johannesburg
    { x: canvas.width * 0.42, y: canvas.height * 0.42, radius: 10, density: 20 }, // West Africa/Lagos
    
    // Australia
    { x: canvas.width * 0.84, y: canvas.height * 0.63, radius: 15, density: 30 }, // Eastern Australia/Sydney
    { x: canvas.width * 0.79, y: canvas.height * 0.58, radius: 10, density: 20 }  // Western Australia/Perth
  ];
  
  // Draw all urban areas
  urbanAreas.forEach(area => {
    createUrbanArea(area.x, area.y, area.radius, area.density);
  });
  
  // Add shipping lanes and flight routes as dimmer lines of lights
  const routes = [
    // Major shipping lanes
    { start: {x: 0.25, y: 0.25}, end: {x: 0.43, y: 0.22}, intensity: 0.15 }, // North Atlantic route
    { start: {x: 0.17, y: 0.30}, end: {x: 0.76, y: 0.27}, intensity: 0.15 }, // Pacific route
    { start: {x: 0.47, y: 0.30}, end: {x: 0.70, y: 0.38}, intensity: 0.15 }, // Suez Canal route
    
    // Major flight corridors
    { start: {x: 0.22, y: 0.27}, end: {x: 0.45, y: 0.22}, intensity: 0.2 }, // Transatlantic
    { start: {x: 0.16, y: 0.30}, end: {x: 0.79, y: 0.25}, intensity: 0.2 }, // Transpacific
    { start: {x: 0.45, y: 0.22}, end: {x: 0.62, y: 0.37}, intensity: 0.2 }, // Europe to Asia
  ];
  
  // Draw routes as series of small lights
  routes.forEach(route => {
    const pointCount = 40;
    for (let i = 0; i < pointCount; i++) {
      const ratio = i / pointCount;
      const x = canvas.width * (route.start.x + (route.end.x - route.start.x) * ratio);
      const y = canvas.height * (route.start.y + (route.end.y - route.start.y) * ratio);
      
      // Only draw some points for a dotted line effect
      if (Math.random() < 0.4) {
        const size = Math.random() * 3 + 1;
        createCityLight(x, y, size, route.intensity * (Math.random() * 0.5 + 0.5));
      }
    }
  });
  
  // Add additional scattered lights for smaller cities and villages
  for (let i = 0; i < 500; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 3 + 0.5;
    const intensity = Math.random() * 0.3 + 0.1;
    
    createCityLight(x, y, size, intensity);
  }
  
  // Add subtle blue glow for atmosphere on night side
  ctx.fillStyle = 'rgba(20, 40, 80, 0.15)';
  ctx.filter = 'blur(50px)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.filter = 'none';
  
  // Add very subtle star field in background
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 1 + 0.5;
    
    ctx.fillStyle = `rgba(200, 200, 255, ${Math.random() * 0.1 + 0.05})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Create texture with optimization settings
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  
  return texture;
};

/**
 * Creates atmosphere glow texture for Earth
 */
export const createAtmosphereGlowTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  
  // Create a radial gradient for atmospheric glow
  const gradient = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 0,
    canvas.width / 2, canvas.height / 2, canvas.width / 2
  );
  
  // Blue atmosphere with less opacity at center, more at edge
  gradient.addColorStop(0, 'rgba(70, 130, 240, 0)');
  gradient.addColorStop(0.5, 'rgba(70, 130, 240, 0.1)');
  gradient.addColorStop(0.7, 'rgba(70, 130, 240, 0.2)');
  gradient.addColorStop(0.85, 'rgba(70, 130, 240, 0.4)');
  gradient.addColorStop(1, 'rgba(70, 130, 240, 0)');
  
  // Fill with gradient
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Create texture
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  
  return texture;
};

/**
 * Creates aurora texture for polar light displays
 */
export const createAuroraTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  
  // Clear with transparency
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Helper function to create aurora arc
  const createAuroraArc = (centerX, centerY, radius, startAngle, endAngle, color) => {
    const gradient = ctx.createLinearGradient(
      centerX, centerY - radius,
      centerX, centerY + radius
    );
    
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.2, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
    gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`);
    gradient.addColorStop(0.8, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = radius * 0.3;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.stroke();
  };
  
  // Northern Lights (green and blue)
  for (let i = 0; i < 10; i++) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height * 0.3; // North pole
    const radius = canvas.height * (0.1 + Math.random() * 0.2);
    const startAngle = Math.PI + Math.random() * 0.5;
    const endAngle = Math.PI * 2 - Math.random() * 0.5;
    
    // Green aurora
    createAuroraArc(
      centerX, 
      centerY, 
      radius,
      startAngle, 
      endAngle,
      { r: 40, g: 200, b: 100, a: 0.4 + Math.random() * 0.2 }
    );
  }
  
  // Southern Lights (more blue/purple)
  for (let i = 0; i < 8; i++) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height * 0.7; // South pole
    const radius = canvas.height * (0.08 + Math.random() * 0.18);
    const startAngle = Math.random() * 0.5;
    const endAngle = Math.PI - Math.random() * 0.5;
    
    // Blue-purple aurora
    createAuroraArc(
      centerX, 
      centerY, 
      radius,
      startAngle, 
      endAngle,
      { r: 60, g: 100, b: 220, a: 0.35 + Math.random() * 0.2 }
    );
  }
  
  // Add vertical ray structures for more realistic aurora
  const addAuroraRays = (baseY, colorR, colorG, colorB) => {
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * canvas.width;
      const height = canvas.height * (0.05 + Math.random() * 0.1);
      const width = canvas.width * 0.01;
      
      const gradient = ctx.createLinearGradient(x, baseY, x, baseY - height);
      gradient.addColorStop(0, `rgba(${colorR}, ${colorG}, ${colorB}, 0.5)`);
      gradient.addColorStop(1, `rgba(${colorR}, ${colorG}, ${colorB}, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x - width/2, baseY - height, width, height);
    }
  };
  
  // Add rays to north and south pole
  addAuroraRays(canvas.height * 0.35, 40, 200, 100); // North pole green
  addAuroraRays(canvas.height * 0.65, 60, 100, 220); // South pole blue
  
  // Blur the entire canvas for a softer glow
  ctx.filter = 'blur(10px)';
  ctx.drawImage(canvas, 0, 0);
  ctx.filter = 'none';
  
  // Create texture
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  
  return texture;
};

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

// Note: All duplicate Earth-related texture functions have been removed
// in favor of the enhanced implementations defined earlier in this file

// The duplicate aurora texture function has been removed
// in favor of the implementation earlier in this file

// === Helper functions for texture generation ===

/**
 * These functions support the texture generators above
 */



/**
 * Draws detailed continents with more realistic shapes
 */
function drawDetailedContinents(ctx, width, height) {
  const baseGreen = '#3c8c52';
  // North America with more detailed coastlines
  ctx.fillStyle = baseGreen;
  ctx.beginPath();
  ctx.moveTo(width * 0.17, height * 0.18); // Alaska
  ctx.lineTo(width * 0.175, height * 0.16); // Northwest Alaska
  ctx.lineTo(width * 0.19, height * 0.15);
  ctx.lineTo(width * 0.205, height * 0.14); // Arctic Canada
  ctx.lineTo(width * 0.22, height * 0.14);
  ctx.lineTo(width * 0.235, height * 0.15);
  ctx.lineTo(width * 0.25, height * 0.16);  // Northeastern Canada
  ctx.lineTo(width * 0.265, height * 0.17);
  ctx.lineTo(width * 0.27, height * 0.19);  // Labrador
  ctx.lineTo(width * 0.29, height * 0.17);  // Newfoundland
  ctx.lineTo(width * 0.31, height * 0.19);  // East Coast
  ctx.lineTo(width * 0.3, height * 0.22);   
  ctx.lineTo(width * 0.29, height * 0.24);  // East Coast contour
  ctx.lineTo(width * 0.28, height * 0.27);
  ctx.lineTo(width * 0.275, height * 0.3);  // Florida peninsula
  ctx.lineTo(width * 0.26, height * 0.32);
  ctx.lineTo(width * 0.25, height * 0.34);
  ctx.lineTo(width * 0.235, height * 0.37); // Gulf Coast
  ctx.lineTo(width * 0.225, height * 0.4);  // Southern Gulf
  ctx.lineTo(width * 0.2, height * 0.42);   // Mexico
  ctx.lineTo(width * 0.195, height * 0.45); // Central America
  ctx.lineTo(width * 0.19, height * 0.48);
  ctx.lineTo(width * 0.18, height * 0.5);   // Panama isthmus
  ctx.lineTo(width * 0.175, height * 0.47);
  ctx.lineTo(width * 0.17, height * 0.45);  
  ctx.lineTo(width * 0.165, height * 0.42); // Mexico West Coast
  ctx.lineTo(width * 0.16, height * 0.38);
  ctx.lineTo(width * 0.16, height * 0.35);  // Baja California
  ctx.lineTo(width * 0.165, height * 0.32); // California Coast
  ctx.lineTo(width * 0.155, height * 0.29); // Pacific Northwest
  ctx.lineTo(width * 0.15, height * 0.25);  // Vancouver/BC coast
  ctx.lineTo(width * 0.145, height * 0.23);
  ctx.lineTo(width * 0.15, height * 0.19);  // Alaska Coast
  ctx.lineTo(width * 0.16, height * 0.18);  // Back to start
  ctx.closePath();
  ctx.fill();
  
  // Add Great Lakes
  ctx.fillStyle = '#0a3d67';  // Deep ocean color
  
  // Lake Superior
  ctx.beginPath();
  ctx.ellipse(width * 0.25, height * 0.25, width * 0.02, height * 0.015, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Lake Michigan
  ctx.beginPath();
  ctx.ellipse(width * 0.255, height * 0.28, width * 0.01, height * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Other Great Lakes (simplified)
  ctx.beginPath();
  ctx.ellipse(width * 0.272, height * 0.26, width * 0.015, height * 0.015, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Reset fill to land color
  ctx.fillStyle = baseGreen;
  
  // Central America with more detail
  ctx.beginPath();
  ctx.moveTo(width * 0.18, height * 0.5);   // Panama
  ctx.lineTo(width * 0.185, height * 0.51);
  ctx.lineTo(width * 0.19, height * 0.52);  // Colombia connection
  ctx.lineTo(width * 0.195, height * 0.53);
  ctx.lineTo(width * 0.2, height * 0.53);
  ctx.closePath();
  ctx.fill();
  
  // South America with more detailed coastline
  ctx.beginPath();
  ctx.moveTo(width * 0.2, height * 0.53);   // Colombia
  ctx.lineTo(width * 0.22, height * 0.55);  // Venezuela
  ctx.lineTo(width * 0.235, height * 0.56);
  ctx.lineTo(width * 0.24, height * 0.58);  // Guyana/Suriname
  ctx.lineTo(width * 0.245, height * 0.59);
  ctx.lineTo(width * 0.26, height * 0.6);   // Northern Brazil
  ctx.lineTo(width * 0.28, height * 0.62);  // Northeastern Brazil
  ctx.lineTo(width * 0.29, height * 0.645); // Brazil bulge
  ctx.lineTo(width * 0.285, height * 0.67);
  ctx.lineTo(width * 0.28, height * 0.7);
  ctx.lineTo(width * 0.27, height * 0.73);  // Eastern Brazil
  ctx.lineTo(width * 0.26, height * 0.76);
  ctx.lineTo(width * 0.25, height * 0.78);
  ctx.lineTo(width * 0.245, height * 0.81); // Southern Brazil
  ctx.lineTo(width * 0.235, height * 0.85); // Uruguay
  ctx.lineTo(width * 0.23, height * 0.87);  // Argentina
  ctx.lineTo(width * 0.22, height * 0.89);
  ctx.lineTo(width * 0.215, height * 0.92); // Tierra del Fuego
  ctx.lineTo(width * 0.21, height * 0.95);
  ctx.lineTo(width * 0.2, height * 0.92);
  ctx.lineTo(width * 0.195, height * 0.89); // Southern Chile
  ctx.lineTo(width * 0.19, height * 0.85);
  ctx.lineTo(width * 0.185, height * 0.8);  // Central Chile
  ctx.lineTo(width * 0.19, height * 0.75);
  ctx.lineTo(width * 0.195, height * 0.7);  // Northern Chile
  ctx.lineTo(width * 0.2, height * 0.65);   // Peru
  ctx.lineTo(width * 0.19, height * 0.61);  // Peru indent
  ctx.lineTo(width * 0.195, height * 0.57); // Ecuador
  ctx.lineTo(width * 0.19, height * 0.55);  // Colombia coast
  ctx.lineTo(width * 0.2, height * 0.53);   // Back to start
  ctx.closePath();
  ctx.fill();
  
  // Europe with more detail
  ctx.beginPath();
  ctx.moveTo(width * 0.41, height * 0.16);  // Norway
  ctx.lineTo(width * 0.425, height * 0.15); // Scandinavian peninsula
  ctx.lineTo(width * 0.44, height * 0.16);
  ctx.lineTo(width * 0.45, height * 0.17);  // Finland
  ctx.lineTo(width * 0.47, height * 0.17);  // Baltic states
  ctx.lineTo(width * 0.48, height * 0.18);  // Russia border
  ctx.lineTo(width * 0.485, height * 0.19);
  ctx.lineTo(width * 0.49, height * 0.21);  // Eastern Europe
  ctx.lineTo(width * 0.485, height * 0.24); // Central Europe
  ctx.lineTo(width * 0.47, height * 0.26);  // Italy/Alps
  ctx.lineTo(width * 0.45, height * 0.27);  // Mediterranean
  ctx.lineTo(width * 0.44, height * 0.28);  // Iberia
  ctx.lineTo(width * 0.425, height * 0.29); // Portugal
  ctx.lineTo(width * 0.415, height * 0.28); // Northern Spain
  ctx.lineTo(width * 0.41, height * 0.26);  // Bay of Biscay
  ctx.lineTo(width * 0.4, height * 0.24);   // France
  ctx.lineTo(width * 0.39, height * 0.22);  // English Channel
  
  // British Isles - detailed
  ctx.lineTo(width * 0.38, height * 0.2);   // England
  ctx.lineTo(width * 0.385, height * 0.18); // Scotland
  ctx.lineTo(width * 0.38, height * 0.16);  // North Scotland
  
  // Add Ireland as separate shape
  ctx.moveTo(width * 0.37, height * 0.19);
  ctx.lineTo(width * 0.375, height * 0.18);
  ctx.lineTo(width * 0.365, height * 0.18);
  ctx.lineTo(width * 0.36, height * 0.19);
  ctx.lineTo(width * 0.365, height * 0.2);
  ctx.lineTo(width * 0.37, height * 0.19);
  
  // Back to mainland
  ctx.moveTo(width * 0.39, height * 0.22);
  ctx.lineTo(width * 0.4, height * 0.21);   // English Channel
  ctx.lineTo(width * 0.41, height * 0.16);  // Back to start
  ctx.fill();
  
  // Italy as peninsula
  ctx.beginPath();
  ctx.moveTo(width * 0.47, height * 0.26);  // Alps connection
  ctx.lineTo(width * 0.48, height * 0.27);  // Northern Italy
  ctx.lineTo(width * 0.475, height * 0.29); // Central Italy
  ctx.lineTo(width * 0.48, height * 0.31);  // Southern Italy
  ctx.lineTo(width * 0.475, height * 0.33); // Sicily
  ctx.lineTo(width * 0.465, height * 0.32);
  ctx.lineTo(width * 0.46, height * 0.3);
  ctx.lineTo(width * 0.465, height * 0.27); // Back to mainland
  ctx.closePath();
  ctx.fill();
  
  // Africa with more detailed coastline and wider Mediterranean gap
  ctx.beginPath();
  // North Africa with clearer Mediterranean separation
  ctx.moveTo(width * 0.41, height * 0.31);  // Morocco coast (big gap at Gibraltar)
  ctx.lineTo(width * 0.43, height * 0.31);  // Morocco north coast  
  ctx.lineTo(width * 0.45, height * 0.315); // Algeria coast
  ctx.lineTo(width * 0.47, height * 0.33);  // Tunisia
  ctx.lineTo(width * 0.49, height * 0.34);  // Libya
  ctx.lineTo(width * 0.51, height * 0.345); // Eastern Libya 
  ctx.lineTo(width * 0.52, height * 0.35);  // Egypt coast
  ctx.lineTo(width * 0.54, height * 0.36);  // Sinai
  
  // Horn of Africa and East Africa
  ctx.lineTo(width * 0.55, height * 0.37);  // Horn of Africa
  ctx.lineTo(width * 0.555, height * 0.39); // Somalia
  ctx.lineTo(width * 0.552, height * 0.42); // East Africa coast
  ctx.lineTo(width * 0.54, height * 0.46);  // Kenya
  ctx.lineTo(width * 0.53, height * 0.5);   // Tanzania
  ctx.lineTo(width * 0.525, height * 0.54); // Mozambique
  
  // Southern Africa
  ctx.lineTo(width * 0.52, height * 0.58);  // South Africa east
  ctx.lineTo(width * 0.51, height * 0.62);  // South Africa southeast
  ctx.lineTo(width * 0.49, height * 0.65);  // Cape of Good Hope
  ctx.lineTo(width * 0.47, height * 0.67);  // South Africa west
  ctx.lineTo(width * 0.455, height * 0.66); // Namibia south
  ctx.lineTo(width * 0.445, height * 0.62); // Namibia
  ctx.lineTo(width * 0.44, height * 0.57);  // Angola
  
  // West Africa
  ctx.lineTo(width * 0.43, height * 0.52);  // Congo coast
  ctx.lineTo(width * 0.415, height * 0.47); // Guinea Gulf
  ctx.lineTo(width * 0.41, height * 0.43);  // West Africa bulge
  ctx.lineTo(width * 0.42, height * 0.4);   // Ivory Coast
  ctx.lineTo(width * 0.425, height * 0.38); // Senegal
  ctx.lineTo(width * 0.43, height * 0.35);  // Western Sahara
  ctx.lineTo(width * 0.42, height * 0.33);  // Morocco northwest
  ctx.lineTo(width * 0.41, height * 0.31);  // Back to Morocco coast
  ctx.closePath();
  ctx.fill();
  
  // Madagascar
  ctx.beginPath();
  ctx.moveTo(width * 0.54, height * 0.55);  // Northern Madagascar
  ctx.lineTo(width * 0.55, height * 0.57);
  ctx.lineTo(width * 0.55, height * 0.59);  // Southern Madagascar
  ctx.lineTo(width * 0.54, height * 0.6);
  ctx.lineTo(width * 0.535, height * 0.57); // Western Madagascar
  ctx.lineTo(width * 0.54, height * 0.55);  // Back to start
  ctx.closePath();
  ctx.fill();
  
  // Full Eurasia as a single connected landmass
  ctx.beginPath();
  
  // Western Europe
  ctx.moveTo(width * 0.41, height * 0.16);  // Norway west coast
  ctx.lineTo(width * 0.425, height * 0.15); // Norway north
  ctx.lineTo(width * 0.44, height * 0.16);  // Finland
  ctx.lineTo(width * 0.45, height * 0.17);  // Finland/Russia border
  
  // Northern Asia (Russia/Siberia) - northern coast
  ctx.lineTo(width * 0.49, height * 0.16);  // Northern Russia 
  ctx.lineTo(width * 0.55, height * 0.15);  // Siberia north
  ctx.lineTo(width * 0.65, height * 0.14);  // Central Siberia north
  ctx.lineTo(width * 0.75, height * 0.15);  // Eastern Siberia north
  ctx.lineTo(width * 0.78, height * 0.18);  // Kamchatka
  
  // East Asia coastline
  ctx.lineTo(width * 0.79, height * 0.22);  // Northeast Asia
  ctx.lineTo(width * 0.79, height * 0.25);  // Northeast China
  ctx.lineTo(width * 0.77, height * 0.28);  // Eastern China
  ctx.lineTo(width * 0.75, height * 0.3);   // Southeast China
  ctx.lineTo(width * 0.74, height * 0.32);  // Southern China
  ctx.lineTo(width * 0.725, height * 0.34); // South China coast
  
  // Southeast Asia
  ctx.lineTo(width * 0.71, height * 0.37);  // Vietnam coast
  ctx.lineTo(width * 0.7, height * 0.39);   // Southern Vietnam
  ctx.lineTo(width * 0.695, height * 0.42); // Southern Indochina
  ctx.lineTo(width * 0.685, height * 0.43); // Malay Peninsula
  ctx.lineTo(width * 0.67, height * 0.425); // Thailand/Malaysia
  ctx.lineTo(width * 0.665, height * 0.45); // Southern Malaysia
  
  // Indian subcontinent
  ctx.lineTo(width * 0.64, height * 0.415); // Southern India
  ctx.lineTo(width * 0.63, height * 0.44);  // Tamil Nadu
  ctx.lineTo(width * 0.615, height * 0.45); // Southern tip of India
  ctx.lineTo(width * 0.6, height * 0.43);   // Western India
  ctx.lineTo(width * 0.59, height * 0.4);   // Gujarat
  ctx.lineTo(width * 0.585, height * 0.36); // Pakistan coast
  
  // Middle East
  ctx.lineTo(width * 0.58, height * 0.35);  // Iran coast
  ctx.lineTo(width * 0.57, height * 0.34);  // Persian Gulf
  ctx.lineTo(width * 0.56, height * 0.33);  // Arabian Peninsula
  ctx.lineTo(width * 0.54, height * 0.32);  // Middle East coast
  
  // Southern Europe (Mediterranean coast)
  ctx.lineTo(width * 0.52, height * 0.3);   // Turkey south
  ctx.lineTo(width * 0.5, height * 0.29);   // Greece east
  ctx.lineTo(width * 0.458, height * 0.28); // Greece southern tip
  ctx.lineTo(width * 0.45, height * 0.275); // Western Greece
  ctx.lineTo(width * 0.44, height * 0.26);  // Southern Europe
  ctx.lineTo(width * 0.43, height * 0.265); // Mediterranean coast
  ctx.lineTo(width * 0.42, height * 0.27);  // Spain south coast
  ctx.lineTo(width * 0.405, height * 0.275);// Gibraltar (gap to Africa)
  ctx.lineTo(width * 0.4, height * 0.27);   // Spain southwest corner
  ctx.lineTo(width * 0.39, height * 0.265); // Portugal south
  ctx.lineTo(width * 0.385, height * 0.255);// Portugal west
  
  // Western Europe coastline
  ctx.lineTo(width * 0.39, height * 0.24);  // Spain west coast
  ctx.lineTo(width * 0.395, height * 0.23); // Bay of Biscay
  ctx.lineTo(width * 0.39, height * 0.22);  // France west coast
  ctx.lineTo(width * 0.39, height * 0.21);  // Brittany
  ctx.lineTo(width * 0.395, height * 0.19); // English Channel
  ctx.lineTo(width * 0.41, height * 0.16);  // Back to Norway
  ctx.closePath();
  ctx.fill();
  
  // Italy as a separate peninsula (connected to mainland)
  ctx.beginPath();
  ctx.moveTo(width * 0.465, height * 0.24);  // Italy north (Alps connection)
  ctx.lineTo(width * 0.47, height * 0.245);  // Northern Italy
  ctx.lineTo(width * 0.465, height * 0.26);  // Central Italy
  ctx.lineTo(width * 0.47, height * 0.28);   // Italy "ankle"
  ctx.lineTo(width * 0.48, height * 0.3);    // Italy "heel"
  ctx.lineTo(width * 0.47, height * 0.29);   // Italy "arch"
  ctx.lineTo(width * 0.463, height * 0.31);  // Italy "toe"
  ctx.lineTo(width * 0.455, height * 0.29);  // Italy west coast
  ctx.lineTo(width * 0.46, height * 0.26);   // Italy mid-west coast
  ctx.lineTo(width * 0.465, height * 0.24);  // Back to north
  ctx.closePath();
  ctx.fill();
  
  // Sicily (separate from mainland Italy)
  ctx.beginPath();
  ctx.moveTo(width * 0.463, height * 0.32);  // Sicily northeast
  ctx.lineTo(width * 0.47, height * 0.325);  // Sicily southeast
  ctx.lineTo(width * 0.465, height * 0.33);  // Sicily south
  ctx.lineTo(width * 0.46, height * 0.325);  // Sicily west
  ctx.lineTo(width * 0.463, height * 0.32);  // Back to northeast
  ctx.closePath();
  ctx.fill();

  // British Isles (separate from mainland)
  ctx.beginPath();
  ctx.moveTo(width * 0.38, height * 0.2);   // England
  ctx.lineTo(width * 0.385, height * 0.18); // Scotland
  ctx.lineTo(width * 0.38, height * 0.16);  // Northern Scotland
  ctx.lineTo(width * 0.375, height * 0.17); // Northwest Scotland
  ctx.lineTo(width * 0.365, height * 0.19); // Western Britain
  ctx.lineTo(width * 0.37, height * 0.22);  // Southwest England
  ctx.lineTo(width * 0.38, height * 0.2);   // Back to England
  ctx.closePath();
  ctx.fill();
  
  // Ireland (separate island)
  ctx.beginPath();
  ctx.moveTo(width * 0.35, height * 0.19);  // Eastern Ireland
  ctx.lineTo(width * 0.345, height * 0.17); // Northern Ireland
  ctx.lineTo(width * 0.335, height * 0.18); // Northwestern Ireland
  ctx.lineTo(width * 0.33, height * 0.19);  // Western Ireland
  ctx.lineTo(width * 0.335, height * 0.21); // Southern Ireland
  ctx.lineTo(width * 0.35, height * 0.19);  // Back to Eastern Ireland
  ctx.closePath();
  ctx.fill();
  
  // Japan (separate islands)
  ctx.beginPath();
  ctx.moveTo(width * 0.8, height * 0.24);   // Hokkaido
  ctx.lineTo(width * 0.81, height * 0.25);
  ctx.lineTo(width * 0.805, height * 0.26);
  ctx.lineTo(width * 0.8, height * 0.27);   // Northern Honshu
  ctx.lineTo(width * 0.81, height * 0.29);  // Central Japan
  ctx.lineTo(width * 0.805, height * 0.31); // Southern Japan
  ctx.lineTo(width * 0.795, height * 0.3);
  ctx.lineTo(width * 0.79, height * 0.28);  // Western Japan
  ctx.lineTo(width * 0.8, height * 0.24);   // Back to Hokkaido
  ctx.closePath();
  ctx.fill();
  
  // Korean Peninsula (attached to mainland but distinctive)
  ctx.beginPath();
  ctx.moveTo(width * 0.77, height * 0.28);  // Connection to mainland
  ctx.lineTo(width * 0.775, height * 0.29); // Northern Korea
  ctx.lineTo(width * 0.78, height * 0.3);   // Southern Korea
  ctx.lineTo(width * 0.77, height * 0.315); // Korean Peninsula
  ctx.lineTo(width * 0.76, height * 0.31);  // Yellow Sea
  ctx.lineTo(width * 0.77, height * 0.28);  // Back to mainland
  ctx.closePath();
  ctx.fill();
  
  // Sri Lanka (separate island)
  ctx.beginPath();
  ctx.moveTo(width * 0.63, height * 0.45);  // Northern Sri Lanka
  ctx.lineTo(width * 0.635, height * 0.46); // Eastern Sri Lanka
  ctx.lineTo(width * 0.63, height * 0.47);  // Southern Sri Lanka
  ctx.lineTo(width * 0.625, height * 0.46); // Western Sri Lanka
  ctx.lineTo(width * 0.63, height * 0.45);  // Back to start
  ctx.closePath();
  ctx.fill();
  
  // Indonesian archipelago - detailed
  // Sumatra
  ctx.moveTo(width * 0.665, height * 0.45); // Connection to Malaysia
  ctx.lineTo(width * 0.67, height * 0.47);  // Northern Sumatra
  ctx.lineTo(width * 0.66, height * 0.5);   // Central Sumatra
  ctx.lineTo(width * 0.65, height * 0.53);  // Southern Sumatra
  ctx.lineTo(width * 0.645, height * 0.51); // Western Sumatra
  ctx.lineTo(width * 0.655, height * 0.48); // Northwest Sumatra
  ctx.lineTo(width * 0.665, height * 0.45); // Back to Malaysia
  
  // Java
  ctx.moveTo(width * 0.65, height * 0.53);  // Connection to Sumatra
  ctx.lineTo(width * 0.67, height * 0.535); // Western Java
  ctx.lineTo(width * 0.69, height * 0.54);  // Central Java
  ctx.lineTo(width * 0.7, height * 0.535);  // Eastern Java
  ctx.lineTo(width * 0.67, height * 0.53);  // Back to Western Java
  
  // Borneo
  ctx.moveTo(width * 0.7, height * 0.45);   // Northern Borneo
  ctx.lineTo(width * 0.72, height * 0.47);  // Eastern Borneo
  ctx.lineTo(width * 0.71, height * 0.5);   // Southern Borneo
  ctx.lineTo(width * 0.69, height * 0.49);  // Western Borneo
  ctx.lineTo(width * 0.68, height * 0.47);  // Northwestern Borneo
  ctx.lineTo(width * 0.7, height * 0.45);   // Back to Northern Borneo
  
  // Philippines
  ctx.moveTo(width * 0.74, height * 0.37);  // Northern Philippines
  ctx.lineTo(width * 0.75, height * 0.39);  // Central Philippines
  ctx.lineTo(width * 0.74, height * 0.41);  // Southern Philippines
  ctx.lineTo(width * 0.73, height * 0.4);   // Western Philippines
  ctx.lineTo(width * 0.735, height * 0.38); // Northwestern Philippines
  ctx.lineTo(width * 0.74, height * 0.37);  // Back to Northern Philippines
  
  // Papua New Guinea
  ctx.moveTo(width * 0.79, height * 0.47);  // Western PNG
  ctx.lineTo(width * 0.82, height * 0.47);  // Northern PNG
  ctx.lineTo(width * 0.83, height * 0.49);  // Eastern PNG
  ctx.lineTo(width * 0.81, height * 0.5);   // Southern PNG
  ctx.lineTo(width * 0.79, height * 0.49);  // Southwestern PNG
  ctx.lineTo(width * 0.79, height * 0.47);  // Back to Western PNG
  
  // Australia with more detailed coastline and distinctive shape
  ctx.beginPath();
  ctx.moveTo(width * 0.76, height * 0.56);  // Western Australia
  ctx.lineTo(width * 0.77, height * 0.53);  // Northwest Cape (Exmouth)
  ctx.lineTo(width * 0.775, height * 0.51); // Kimberley region
  ctx.lineTo(width * 0.79, height * 0.5);   // Darwin/Top End
  ctx.lineTo(width * 0.8, height * 0.51);   // Arnhem Land
  ctx.lineTo(width * 0.81, height * 0.53);  // Gulf of Carpentaria 
  ctx.lineTo(width * 0.825, height * 0.53); // Cape York base
  ctx.lineTo(width * 0.835, height * 0.51); // Cape York Peninsula
  ctx.lineTo(width * 0.84, height * 0.54);  // Queensland north coast
  ctx.lineTo(width * 0.85, height * 0.56);  // Great Barrier Reef area
  ctx.lineTo(width * 0.855, height * 0.59); // Eastern Australia
  ctx.lineTo(width * 0.85, height * 0.62);  // New South Wales
  ctx.lineTo(width * 0.84, height * 0.645); // Victoria coast
  ctx.lineTo(width * 0.82, height * 0.65);  // Melbourne area
  ctx.lineTo(width * 0.8, height * 0.655);  // South Australian coast
  ctx.lineTo(width * 0.78, height * 0.65);  // Great Australian Bight east
  ctx.lineTo(width * 0.76, height * 0.64);  // Great Australian Bight west
  ctx.lineTo(width * 0.755, height * 0.61); // Western Australia southern
  ctx.lineTo(width * 0.75, height * 0.58);  // Western Australia mid
  ctx.lineTo(width * 0.76, height * 0.56);  // Back to start
  ctx.closePath();
  ctx.fill();
  
  // Tasmania (separate island)
  ctx.beginPath();
  ctx.moveTo(width * 0.84, height * 0.66);  // Northeast Tasmania
  ctx.lineTo(width * 0.845, height * 0.675); // Eastern Tasmania  
  ctx.lineTo(width * 0.835, height * 0.685); // Southern Tasmania
  ctx.lineTo(width * 0.825, height * 0.675); // Western Tasmania
  ctx.lineTo(width * 0.83, height * 0.66);  // Northern Tasmania
  ctx.lineTo(width * 0.84, height * 0.66);  // Back to start
  ctx.closePath();
  ctx.fill();
  
  // New Zealand - add as separate islands
  // North Island
  ctx.beginPath();
  ctx.moveTo(width * 0.89, height * 0.65);  // Northern NZ
  ctx.lineTo(width * 0.9, height * 0.67);   // Eastern North Island
  ctx.lineTo(width * 0.89, height * 0.69);  // Southern North Island
  ctx.lineTo(width * 0.885, height * 0.67); // Western North Island
  ctx.lineTo(width * 0.89, height * 0.65);  // Back to start
  ctx.closePath();
  ctx.fill();
  
  // South Island
  ctx.beginPath();
  ctx.moveTo(width * 0.89, height * 0.7);   // Northern South Island
  ctx.lineTo(width * 0.9, height * 0.72);   // Eastern South Island
  ctx.lineTo(width * 0.89, height * 0.74);  // Southern South Island
  ctx.lineTo(width * 0.88, height * 0.72);  // Western South Island
  ctx.lineTo(width * 0.89, height * 0.7);   // Back to start
  ctx.closePath();
  ctx.fill();
  
  // Antarctica - much smaller and properly shaped
  ctx.fillStyle = '#f0f0f0'; // Snow white
  ctx.beginPath();
  // Use an ellipse with reduced size to avoid the overly large appearance
  ctx.ellipse(
    width * 0.5, 
    height * 0.92, // Positioned closer to the bottom
    width * 0.1,   // Much smaller width
    height * 0.08, // Smaller height
    0, 0, Math.PI * 2
  );
  ctx.fill();
  
  // Antarctic Peninsula pointing toward South America - smaller
  ctx.beginPath();
  ctx.moveTo(width * 0.39, height * 0.9);
  ctx.lineTo(width * 0.37, height * 0.88);
  ctx.lineTo(width * 0.36, height * 0.87);
  ctx.lineTo(width * 0.37, height * 0.86);
  ctx.lineTo(width * 0.38, height * 0.87);
  ctx.lineTo(width * 0.39, height * 0.89);
  ctx.closePath();
  ctx.fill();
  
  // Add texture and variations to continents
  addEnhancedContinentTexture(ctx, width, height);
}

/**
 * Adds detailed textures to continents with clearer biome distinctions
 */
function addEnhancedContinentTexture(ctx, width, height) {
  // Add desert regions - larger and more visible
  ctx.fillStyle = 'rgba(240, 220, 130, 0.8)'; // Stronger desert sand color
  
  // Sahara Desert - larger area
  ctx.beginPath();
  ctx.moveTo(width * 0.44, height * 0.34);
  ctx.lineTo(width * 0.53, height * 0.34);
  ctx.lineTo(width * 0.52, height * 0.42);
  ctx.lineTo(width * 0.43, height * 0.41);
  ctx.closePath();
  ctx.fill();
  
  // Arabian Desert - larger
  ctx.beginPath();
  ctx.ellipse(width * 0.55, height * 0.32, width * 0.04, height * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Australian Outback - larger
  ctx.beginPath();
  ctx.ellipse(width * 0.79, height * 0.6, width * 0.06, height * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // American Southwest/Sonoran
  ctx.beginPath();
  ctx.ellipse(width * 0.195, height * 0.37, width * 0.03, height * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Gobi Desert
  ctx.beginPath();
  ctx.ellipse(width * 0.67, height * 0.25, width * 0.05, height * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Atacama Desert
  ctx.beginPath();
  ctx.ellipse(width * 0.2, height * 0.65, width * 0.02, height * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Kalahari Desert
  ctx.beginPath();
  ctx.ellipse(width * 0.47, height * 0.6, width * 0.04, height * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Add forest/jungle regions - more defined
  ctx.fillStyle = 'rgba(30, 85, 30, 0.8)'; // Darker stronger green for forests
  
  // Amazon Rainforest - larger and more visible
  ctx.beginPath();
  ctx.moveTo(width * 0.21, height * 0.58);  // Northwestern corner
  ctx.lineTo(width * 0.27, height * 0.6);   // Northern edge
  ctx.lineTo(width * 0.28, height * 0.65);  // Eastern edge
  ctx.lineTo(width * 0.26, height * 0.7);   // Southeastern corner
  ctx.lineTo(width * 0.22, height * 0.68);  // Southern edge
  ctx.lineTo(width * 0.2, height * 0.63);   // Southwestern corner
  ctx.closePath();
  ctx.fill();
  
  // Congo Rainforest - more defined shape
  ctx.beginPath();
  ctx.moveTo(width * 0.44, height * 0.47);  // Northwestern corner
  ctx.lineTo(width * 0.48, height * 0.47);  // Northern edge
  ctx.lineTo(width * 0.51, height * 0.5);   // Eastern edge
  ctx.lineTo(width * 0.49, height * 0.54);  // Southeastern corner
  ctx.lineTo(width * 0.45, height * 0.54);  // Southern edge
  ctx.lineTo(width * 0.42, height * 0.51);  // Southwestern corner
  ctx.closePath();
  ctx.fill();
  
  // Southeast Asian Forests - expanded to cover more of the region
  ctx.beginPath();
  ctx.moveTo(width * 0.68, height * 0.35);  // Northern Thailand
  ctx.lineTo(width * 0.72, height * 0.36);  // Northern Indochina
  ctx.lineTo(width * 0.71, height * 0.4);   // Vietnam
  ctx.lineTo(width * 0.68, height * 0.43);  // Southern Indochina
  ctx.lineTo(width * 0.66, height * 0.41);  // Western Thailand
  ctx.lineTo(width * 0.67, height * 0.37);  // Myanmar
  ctx.closePath();
  ctx.fill();
  
  // Borneo Rainforest
  ctx.beginPath();
  ctx.ellipse(width * 0.7, height * 0.47, width * 0.03, height * 0.035, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Sumatra Rainforest
  ctx.beginPath();
  ctx.ellipse(width * 0.655, height * 0.49, width * 0.02, height * 0.04, Math.PI/4, 0, Math.PI * 2);
  ctx.fill();
  
  // Papua New Guinea Forests
  ctx.beginPath();
  ctx.ellipse(width * 0.81, height * 0.48, width * 0.03, height * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Central American Rainforests
  ctx.beginPath();
  ctx.ellipse(width * 0.19, height * 0.45, width * 0.015, height * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Add mountain ranges - more prominent and detailed
  ctx.fillStyle = 'rgba(120, 100, 80, 0.7)'; // Stronger brown for mountains
  
  // Andes - longer range with more detail
  ctx.beginPath();
  ctx.moveTo(width * 0.21, height * 0.55);  // Northern Andes (Colombia)
  ctx.lineTo(width * 0.22, height * 0.57);
  ctx.lineTo(width * 0.21, height * 0.6);   // Central Andes (Peru)
  ctx.lineTo(width * 0.2, height * 0.65);
  ctx.lineTo(width * 0.19, height * 0.7);   // Southern Andes (Chile)
  ctx.lineTo(width * 0.185, height * 0.75);
  ctx.lineTo(width * 0.19, height * 0.8);
  ctx.lineTo(width * 0.195, height * 0.85); // Patagonian Andes
  ctx.lineTo(width * 0.2, height * 0.83);
  ctx.lineTo(width * 0.205, height * 0.78);
  ctx.lineTo(width * 0.21, height * 0.73);
  ctx.lineTo(width * 0.215, height * 0.68);
  ctx.lineTo(width * 0.22, height * 0.63);
  ctx.lineTo(width * 0.225, height * 0.59);
  ctx.lineTo(width * 0.22, height * 0.55);
  ctx.closePath();
  ctx.fill();
  
  // Himalayas - larger and more prominent
  ctx.beginPath();
  ctx.moveTo(width * 0.6, height * 0.31);   // Western edge (Pakistan)
  ctx.lineTo(width * 0.63, height * 0.3);    // Northwestern India
  ctx.lineTo(width * 0.65, height * 0.29);   // Nepal region
  ctx.lineTo(width * 0.68, height * 0.28);   // Bhutan/Tibet
  ctx.lineTo(width * 0.7, height * 0.29);    // Eastern Himalayas
  ctx.lineTo(width * 0.68, height * 0.31);   // Northern Myanmar
  ctx.lineTo(width * 0.65, height * 0.32);   // Northeast India
  ctx.lineTo(width * 0.62, height * 0.33);   // Northern India
  ctx.lineTo(width * 0.6, height * 0.32);    // Kashmir
  ctx.closePath();
  ctx.fill();
  
  // Rocky Mountains - more detailed range
  ctx.beginPath();
  ctx.moveTo(width * 0.18, height * 0.23);  // Northern Rockies (Canada)
  ctx.lineTo(width * 0.19, height * 0.25);
  ctx.lineTo(width * 0.185, height * 0.28); // US Northern Rockies
  ctx.lineTo(width * 0.18, height * 0.32);  // US Central Rockies
  ctx.lineTo(width * 0.175, height * 0.36); // US Southern Rockies
  ctx.lineTo(width * 0.18, height * 0.39);  // New Mexico mountains
  ctx.lineTo(width * 0.19, height * 0.38);
  ctx.lineTo(width * 0.195, height * 0.35);
  ctx.lineTo(width * 0.2, height * 0.31);
  ctx.lineTo(width * 0.195, height * 0.27);
  ctx.lineTo(width * 0.19, height * 0.24);
  ctx.lineTo(width * 0.185, height * 0.22);
  ctx.closePath();
  ctx.fill();
  
  // Alps - more defined
  ctx.beginPath();
  ctx.moveTo(width * 0.45, height * 0.235);  // Western Alps
  ctx.lineTo(width * 0.47, height * 0.23);   // Central Alps
  ctx.lineTo(width * 0.485, height * 0.235); // Eastern Alps
  ctx.lineTo(width * 0.48, height * 0.245);  // Southern Alps
  ctx.lineTo(width * 0.46, height * 0.25);   // Italian Alps
  ctx.lineTo(width * 0.445, height * 0.24);  // French Alps
  ctx.closePath();
  ctx.fill();
  
  // Ural Mountains
  ctx.beginPath();
  ctx.moveTo(width * 0.57, height * 0.17);  // Northern Urals
  ctx.lineTo(width * 0.575, height * 0.2);  // Central Urals
  ctx.lineTo(width * 0.57, height * 0.23);  // Southern Urals
  ctx.lineTo(width * 0.565, height * 0.21); // Western edge
  ctx.lineTo(width * 0.565, height * 0.18); // Northwestern edge
  ctx.closePath();
  ctx.fill();
  
  // Appalachian Mountains
  ctx.beginPath();
  ctx.moveTo(width * 0.265, height * 0.27); // Northern Appalachians
  ctx.lineTo(width * 0.27, height * 0.3);   // Central Appalachians
  ctx.lineTo(width * 0.265, height * 0.33); // Southern Appalachians
  ctx.lineTo(width * 0.26, height * 0.31);  // Western edge
  ctx.lineTo(width * 0.26, height * 0.28);  // Northwestern edge
  ctx.closePath();
  ctx.fill();
  
  // Great Dividing Range (Australia)
  ctx.beginPath();
  ctx.moveTo(width * 0.835, height * 0.55); // Northern Australia
  ctx.lineTo(width * 0.84, height * 0.58);  // Queensland
  ctx.lineTo(width * 0.835, height * 0.62); // New South Wales
  ctx.lineTo(width * 0.83, height * 0.65);  // Victoria
  ctx.lineTo(width * 0.825, height * 0.62); // Western edge
  ctx.lineTo(width * 0.83, height * 0.58);  // Central western edge
  ctx.lineTo(width * 0.83, height * 0.55);  // Northwestern edge
  ctx.closePath();
  ctx.fill();
  
  // Atlas Mountains (North Africa)
  ctx.beginPath();
  ctx.moveTo(width * 0.43, height * 0.31);  // Western Atlas
  ctx.lineTo(width * 0.47, height * 0.32);  // Central Atlas
  ctx.lineTo(width * 0.46, height * 0.335); // Southern Atlas
  ctx.lineTo(width * 0.42, height * 0.325); // Southwestern Atlas
  ctx.closePath();
  ctx.fill();
  
  // Ethiopian Highlands
  ctx.beginPath();
  ctx.ellipse(width * 0.53, height * 0.42, width * 0.03, height * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Caucasus Mountains
  ctx.beginPath();
  ctx.moveTo(width * 0.56, height * 0.26);  // Western Caucasus
  ctx.lineTo(width * 0.6, height * 0.25);   // Eastern Caucasus
  ctx.lineTo(width * 0.595, height * 0.26); // Southern Caucasus
  ctx.lineTo(width * 0.555, height * 0.27); // Southwestern Caucasus
  ctx.closePath();
  ctx.fill();
  
  // Tien Shan & Altai Mountains
  ctx.beginPath();
  ctx.moveTo(width * 0.62, height * 0.23);  // Western edge
  ctx.lineTo(width * 0.67, height * 0.22);  // Northern edge
  ctx.lineTo(width * 0.66, height * 0.25);  // Eastern edge
  ctx.lineTo(width * 0.61, height * 0.26);  // Southern edge
  ctx.closePath();
  ctx.fill();
  
  // Add grassland/savanna regions
  ctx.fillStyle = 'rgba(180, 200, 100, 0.5)'; // Yellow-green for grasslands
  
  // African Savanna - Serengeti/Sahel
  ctx.beginPath();
  ctx.ellipse(width * 0.49, height * 0.43, width * 0.07, height * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // North American Great Plains
  ctx.beginPath();
  ctx.ellipse(width * 0.22, height * 0.32, width * 0.04, height * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // South American Pampas
  ctx.beginPath();
  ctx.ellipse(width * 0.24, height * 0.75, width * 0.04, height * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Central Asian Steppe
  ctx.beginPath();
  ctx.ellipse(width * 0.6, height * 0.2, width * 0.06, height * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Australian Grasslands
  ctx.beginPath();
  ctx.ellipse(width * 0.8, height * 0.64, width * 0.04, height * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Add tundra regions
  ctx.fillStyle = 'rgba(200, 200, 210, 0.5)'; // Grayish for tundra
  
  // Siberian Tundra
  ctx.beginPath();
  ctx.ellipse(width * 0.7, height * 0.15, width * 0.08, height * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // North American Tundra
  ctx.beginPath();
  ctx.ellipse(width * 0.25, height * 0.15, width * 0.08, height * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Add major lakes
  ctx.fillStyle = 'rgba(10, 60, 120, 0.8)'; // Deep blue for lakes
  
  // Great Lakes - more detailed
  // Already added above - but enhance with more details
  
  // Caspian Sea
  ctx.beginPath();
  ctx.ellipse(width * 0.58, height * 0.26, width * 0.02, height * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Lake Baikal
  ctx.beginPath();
  ctx.ellipse(width * 0.68, height * 0.21, width * 0.01, height * 0.03, Math.PI/4, 0, Math.PI * 2);
  ctx.fill();
  
  // Lake Victoria
  ctx.beginPath();
  ctx.ellipse(width * 0.51, height * 0.48, width * 0.015, height * 0.015, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Lake Tanganyika
  ctx.beginPath();
  ctx.ellipse(width * 0.5, height * 0.52, width * 0.008, height * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Great Salt Lake
  ctx.beginPath();
  ctx.ellipse(width * 0.185, height * 0.31, width * 0.008, height * 0.01, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Add major rivers (subtle)
  ctx.strokeStyle = 'rgba(10, 60, 120, 0.6)';
  ctx.lineWidth = 1;
  
  // Amazon River
  ctx.beginPath();
  ctx.moveTo(width * 0.21, height * 0.63);
  ctx.lineTo(width * 0.24, height * 0.64);
  ctx.lineTo(width * 0.27, height * 0.65);
  ctx.stroke();
  
  // Nile River
  ctx.beginPath();
  ctx.moveTo(width * 0.51, height * 0.34);
  ctx.lineTo(width * 0.515, height * 0.38);
  ctx.lineTo(width * 0.51, height * 0.42);
  ctx.lineTo(width * 0.51, height * 0.46);
  ctx.stroke();
  
  // Mississippi River
  ctx.beginPath();
  ctx.moveTo(width * 0.235, height * 0.26);
  ctx.lineTo(width * 0.24, height * 0.29);
  ctx.lineTo(width * 0.245, height * 0.32);
  ctx.lineTo(width * 0.24, height * 0.36);
  ctx.stroke();
  
  // Ganges River
  ctx.beginPath();
  ctx.moveTo(width * 0.63, height * 0.32);
  ctx.lineTo(width * 0.64, height * 0.35);
  ctx.lineTo(width * 0.65, height * 0.37);
  ctx.stroke();
  
  // Yangtze River
  ctx.beginPath();
  ctx.moveTo(width * 0.69, height * 0.28);
  ctx.lineTo(width * 0.72, height * 0.3);
  ctx.lineTo(width * 0.75, height * 0.31);
  ctx.stroke();
}

/**
 * Adds terrain details and variation
 */
function addTerrainDetails(ctx, width, height) {
  // Add subtle texture to landmasses
  const terrainGrainCount = 5000;
  ctx.globalCompositeOperation = 'multiply';
  
  for (let i = 0; i < terrainGrainCount; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 3 + 1;
    
    // Randomly vary the color slightly
    const r = Math.floor(Math.random() * 20) - 10;
    const g = Math.floor(Math.random() * 20) - 10;
    const b = Math.floor(Math.random() * 20) - 10;
    
    ctx.fillStyle = `rgba(${128 + r}, ${128 + g}, ${128 + b}, 0.1)`;
    ctx.fillRect(x, y, size, size);
  }
  
  // Reset composite operation
  ctx.globalCompositeOperation = 'source-over';
}


/**
 * Draws major mountain ranges for bump mapping
 */
function drawMountainRanges(ctx, width, height) {
  // White areas are elevated
  ctx.fillStyle = '#ffffff';
  
  // Himalayas - highest elevation
  ctx.beginPath();
  ctx.rect(width * 0.61, height * 0.32, width * 0.05, height * 0.02);
  ctx.fill();
  
  // Andes
  ctx.fillStyle = '#e0e0e0'; // Slightly lower
  ctx.beginPath();
  ctx.rect(width * 0.21, height * 0.6, width * 0.01, height * 0.2);
  ctx.fill();
  
  // Rockies
  ctx.fillStyle = '#d0d0d0'; // Lower than Andes
  ctx.beginPath();
  ctx.rect(width * 0.185, height * 0.28, width * 0.015, height * 0.12);
  ctx.fill();
  
  // Alps
  ctx.beginPath();
  ctx.rect(width * 0.46, height * 0.24, width * 0.02, height * 0.01);
  ctx.fill();
  
  // Add other mountain ranges with varying heights
  // Caucasus
  ctx.fillStyle = '#c0c0c0';
  ctx.beginPath();
  ctx.rect(width * 0.51, height * 0.25, width * 0.02, height * 0.01);
  ctx.fill();
  
  // Ethiopian Highlands
  ctx.fillStyle = '#b0b0b0';
  ctx.beginPath();
  ctx.rect(width * 0.53, height * 0.42, width * 0.02, height * 0.03);
  ctx.fill();
  
  // Urals
  ctx.fillStyle = '#a0a0a0';
  ctx.beginPath();
  ctx.rect(width * 0.52, height * 0.2, width * 0.01, height * 0.05);
  ctx.fill();
  
  // Appalachians
  ctx.fillStyle = '#909090';
  ctx.beginPath();
  ctx.rect(width * 0.225, height * 0.31, width * 0.01, height * 0.06);
  ctx.fill();
  
  // Great Dividing Range (Australia)
  ctx.fillStyle = '#808080';
  ctx.beginPath();
  ctx.rect(width * 0.83, height * 0.6, width * 0.01, height * 0.06);
  ctx.fill();
}

/**
 * Adds noise variation to terrain bump map
 */
function addTerrainNoise(ctx, width, height) {
  // Add random noise for terrain
  const noiseCount = 8000;
  
  for (let i = 0; i < noiseCount; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 2 + 0.5;
    
    // Varying levels of gray for different heights
    const brightness = Math.floor(Math.random() * 40);
    ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, 0.3)`;
    ctx.fillRect(x, y, size, size);
  }
}

function drawContinentMasks(ctx, width, height) {
  // North America
  ctx.beginPath();
  ctx.moveTo(width * 0.17, height * 0.18);
  ctx.lineTo(width * 0.31, height * 0.22);
  ctx.lineTo(width * 0.23, height * 0.38);
  ctx.lineTo(width * 0.19, height * 0.43);
  ctx.lineTo(width * 0.155, height * 0.26);
  ctx.closePath();
  ctx.fill();
  
  // South America
  ctx.beginPath();
  ctx.moveTo(width * 0.23, height * 0.55);
  ctx.lineTo(width * 0.28, height * 0.65);
  ctx.lineTo(width * 0.23, height * 0.85);
  ctx.lineTo(width * 0.2, height * 0.7);
  ctx.closePath();
  ctx.fill();
  
  // Europe and Africa
  ctx.beginPath();
  ctx.moveTo(width * 0.425, height * 0.18);
  ctx.lineTo(width * 0.47, height * 0.19);
  ctx.lineTo(width * 0.465, height * 0.28);
  ctx.lineTo(width * 0.47, height * 0.31);
  ctx.lineTo(width * 0.55, height * 0.38);
  ctx.lineTo(width * 0.47, height * 0.67);
  ctx.lineTo(width * 0.42, height * 0.5);
  ctx.lineTo(width * 0.415, height * 0.23);
  ctx.closePath();
  ctx.fill();
  
  // Asia
  ctx.beginPath();
  ctx.moveTo(width * 0.49, height * 0.18);
  ctx.lineTo(width * 0.7, height * 0.2);
  ctx.lineTo(width * 0.68, height * 0.34);
  ctx.lineTo(width * 0.58, height * 0.32);
  ctx.lineTo(width * 0.49, height * 0.24);
  ctx.closePath();
  ctx.fill();
  
  // Australia
  ctx.beginPath();
  ctx.moveTo(width * 0.76, height * 0.56);
  ctx.lineTo(width * 0.84, height * 0.6);
  ctx.lineTo(width * 0.8, height * 0.68);
  ctx.lineTo(width * 0.76, height * 0.62);
  ctx.closePath();
  ctx.fill();
  
  // Antarctica
  ctx.beginPath();
  ctx.arc(width * 0.5, height * 0.9, width * 0.15, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Generates cloud patterns
 */
function generateCloudPatterns(ctx, width, height) {
  // Create more realistic cloud patterns based on typical atmospheric circulation
  
  // Tropical convergence zone (equatorial clouds)
  createCloudBand(ctx, width, height, 0.5, 0.08, 0.9);
  
  // Northern hemisphere cloud bands
  createCloudBand(ctx, width, height, 0.35, 0.06, 0.7);
  createCloudBand(ctx, width, height, 0.2, 0.05, 0.6);
  
  // Southern hemisphere cloud bands
  createCloudBand(ctx, width, height, 0.65, 0.06, 0.7);
  createCloudBand(ctx, width, height, 0.8, 0.05, 0.6);
  
  // Add some scattered clouds
  addScatteredClouds(ctx, width, height, 200);
  
  // Add some storm systems
  addStormSystems(ctx, width, height, 8);
}

/**
 * Creates a band of clouds at specified position
 */
function createCloudBand(ctx, width, height, yPosition, thickness, density) {
  const bandY = height * yPosition;
  const bandHeight = height * thickness;
  
  // Create a variable cloud pattern along the band
  for (let x = 0; x < width; x += 10) {
    // Determine cloud coverage at this longitude (vary along x-axis)
    const coverage = Math.sin(x * 0.01) * 0.3 + density;
    
    // Only draw clouds where coverage is sufficient
    if (Math.random() < coverage) {
      const cloudWidth = Math.random() * 60 + 30;
      const cloudHeight = Math.random() * bandHeight * 0.8 + bandHeight * 0.2;
      const yVariation = (Math.random() - 0.5) * bandHeight;
      
      // Cloud opacity based on density
      const opacity = Math.random() * 0.5 + 0.3;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      
      // Draw cloud as a collection of overlapping circles for fluffy appearance
      const centerX = x + Math.random() * 20;
      const centerY = bandY + yVariation;
      const numCircles = Math.floor(Math.random() * 5) + 3;
      
      for (let i = 0; i < numCircles; i++) {
        const circleX = centerX + (Math.random() - 0.5) * cloudWidth * 0.8;
        const circleY = centerY + (Math.random() - 0.5) * cloudHeight * 0.5;
        const circleRadius = Math.random() * cloudHeight * 0.6 + cloudHeight * 0.2;
        
        ctx.beginPath();
        ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

/**
 * Adds scattered clouds across the globe
 */
function addScatteredClouds(ctx, width, height, count) {
  for (let i = 0; i < count; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 20 + 5;
    const opacity = Math.random() * 0.4 + 0.2;
    
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    
    // Draw cloud as overlapping circles
    const numCircles = Math.floor(Math.random() * 3) + 2;
    
    for (let j = 0; j < numCircles; j++) {
      const circleX = x + (Math.random() - 0.5) * size * 2;
      const circleY = y + (Math.random() - 0.5) * size;
      const circleRadius = Math.random() * size * 0.8 + size * 0.2;
      
      ctx.beginPath();
      ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/**
 * Adds storm systems (spiral cloud patterns)
 */
function addStormSystems(ctx, width, height, count) {
  for (let i = 0; i < count; i++) {
    // Position storms in typical hurricane zones
    let x, y;
    
    if (Math.random() < 0.5) {
      // Northern hemisphere storms (20-35 degrees north)
      x = Math.random() * width;
      y = height * (0.3 + Math.random() * 0.1);
    } else {
      // Southern hemisphere storms (20-35 degrees south)
      x = Math.random() * width;
      y = height * (0.65 + Math.random() * 0.1);
    }
    
    const size = Math.random() * 50 + 30;
    
    // Create spiral effect
    for (let angle = 0; angle < Math.PI * 10; angle += 0.2) {
      const radius = angle * size / (Math.PI * 10) * 0.3;
      const cloudX = x + Math.cos(angle) * radius;
      const cloudY = y + Math.sin(angle) * radius;
      const cloudSize = Math.random() * 10 + 5;
      const opacity = Math.random() * 0.5 + 0.4;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.beginPath();
      ctx.arc(cloudX, cloudY, cloudSize * (1 - radius / size), 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Add eye of the storm
    ctx.fillStyle = 'rgba(255, 255, 255, 0)';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Draws city lights for night map
 */
function drawCityLights(ctx, width, height) {
  // Major city clusters
  const cityClusters = [
    { x: 0.22, y: 0.3, size: 0.04, density: 0.6 },  // Eastern USA
    { x: 0.46, y: 0.23, size: 0.04, density: 0.7 }, // Europe
    { x: 0.65, y: 0.25, size: 0.05, density: 0.5 }, // East Asia
    { x: 0.52, y: 0.32, size: 0.03, density: 0.4 }, // Middle East
    { x: 0.25, y: 0.6, size: 0.03, density: 0.3 },  // Brazil
    { x: 0.6, y: 0.35, size: 0.04, density: 0.5 },  // India
    { x: 0.8, y: 0.63, size: 0.03, density: 0.4 },  // Eastern Australia
    { x: 0.18, y: 0.37, size: 0.03, density: 0.4 }, // Western USA/Mexico
    { x: 0.48, y: 0.5, size: 0.03, density: 0.2 }   // Central Africa
  ];
  
  // Draw each city cluster
  cityClusters.forEach(cluster => {
    const centerX = width * cluster.x;
    const centerY = height * cluster.y;
    const clusterRadius = width * cluster.size;
    
    // Generate city lights
    const cityCount = Math.floor(clusterRadius * clusterRadius * Math.PI * cluster.density * 2);
    
    for (let i = 0; i < cityCount; i++) {
      // Random position within cluster
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.pow(Math.random(), 0.5) * clusterRadius; // Square root to distribute evenly
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      // City light size and brightness
      const size = Math.random() * 2.5 + 0.5;
      const brightness = Math.random() * 80 + 175;
      
      // Draw city light
      ctx.fillStyle = `rgba(${brightness}, ${brightness * 0.9}, ${brightness * 0.6}, ${Math.random() * 0.3 + 0.7})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Add highways/connections between cities
    if (Math.random() < 0.7) {
      const nearbyCluster = cityClusters.find(c => {
        const distance = Math.sqrt(
          Math.pow((c.x - cluster.x) * width, 2) + 
          Math.pow((c.y - cluster.y) * height, 2)
        );
        return c !== cluster && distance < width * 0.15;
      });
      
      if (nearbyCluster) {
        const targetX = width * nearbyCluster.x;
        const targetY = height * nearbyCluster.y;
        
        // Draw highway as faint line with small bright dots
        const highwayLength = Math.sqrt(
          Math.pow(targetX - centerX, 2) + 
          Math.pow(targetY - centerY, 2)
        );
        
        const segments = Math.floor(highwayLength / 5);
        
        for (let i = 0; i < segments; i++) {
          const ratio = i / segments;
          const x = centerX + (targetX - centerX) * ratio;
          const y = centerY + (targetY - centerY) * ratio;
          
          // Only draw some points for sparser appearance
          if (Math.random() < 0.3) {
            const size = Math.random() * 1 + 0.5;
            ctx.fillStyle = `rgba(200, 180, 140, ${Math.random() * 0.4 + 0.2})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
  });
  
  // Add shipping lanes/routes at sea
  drawShippingRoutes(ctx, width, height);
}

/**
 * Draws shipping routes visible at night
 */
function drawShippingRoutes(ctx, width, height) {
  const routes = [
    // Trans-Atlantic
    { start: { x: 0.22, y: 0.3 }, end: { x: 0.42, y: 0.25 } },
    // Trans-Pacific
    { start: { x: 0.18, y: 0.35 }, end: { x: 0.7, y: 0.28 } },
    // Europe to Asia
    { start: { x: 0.46, y: 0.27 }, end: { x: 0.65, y: 0.3 } },
    // North America to South America
    { start: { x: 0.2, y: 0.4 }, end: { x: 0.25, y: 0.55 } }
  ];
  
  routes.forEach(route => {
    const startX = width * route.start.x;
    const startY = height * route.start.y;
    const endX = width * route.end.x;
    const endY = height * route.end.y;
    
    // Draw shipping route
    const routeLength = Math.sqrt(
      Math.pow(endX - startX, 2) + 
      Math.pow(endY - startY, 2)
    );
    
    const segments = Math.floor(routeLength / 10);
    
    for (let i = 0; i < segments; i++) {
      const ratio = i / segments;
      const x = startX + (endX - startX) * ratio;
      const y = startY + (endY - startY) * ratio;
      
      // Ships appear as tiny dots along routes
      if (Math.random() < 0.15) {
        const size = Math.random() * 1 + 0.5;
        ctx.fillStyle = `rgba(180, 180, 150, ${Math.random() * 0.3 + 0.2})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
}

/**
 * Generates aurora effects for polar regions
 */
function generateAurora(ctx, width, height, isNorthern) {
  // Determine aurora region
  const centerY = isNorthern ? height * 0.1 : height * 0.9;
  const auroraHeight = height * 0.15;
  
  // Define aurora colors
  const colors = isNorthern ? 
    ['rgba(110, 200, 100, 0)', 'rgba(110, 200, 100, 0.3)', 'rgba(100, 220, 180, 0.3)', 'rgba(80, 180, 255, 0.3)', 'rgba(180, 180, 255, 0.2)', 'rgba(110, 200, 100, 0)'] :
    ['rgba(180, 100, 200, 0)', 'rgba(180, 100, 200, 0.3)', 'rgba(220, 130, 200, 0.3)', 'rgba(160, 140, 255, 0.3)', 'rgba(220, 180, 255, 0.2)', 'rgba(180, 100, 200, 0)'];
  
  // Create curtain-like aurora effects
  const curtainCount = Math.floor(Math.random() * 4) + 3;
  
  for (let c = 0; c < curtainCount; c++) {
    const startX = Math.random() * width;
    const curtainWidth = Math.random() * width * 0.3 + width * 0.1;
    
    // Create a curtain shape
    const points = [];
    const segments = 20;
    
    for (let i = 0; i < segments; i++) {
      const x = startX + (i / (segments - 1)) * curtainWidth;
      
      // Create wavy pattern
      const waveFactor = Math.sin(i / segments * Math.PI) * auroraHeight * 0.4;
      const distortion = Math.sin(i * 0.5) * auroraHeight * 0.15;
      const y = centerY + waveFactor + distortion;
      
      points.push({ x, y });
    }
    
    // Draw the aurora curtain
    for (let j = 0; j < colors.length - 1; j++) {
      const gradientHeight = auroraHeight / (colors.length - 1);
      const yOffset = (j - (colors.length - 1) / 2) * gradientHeight;
      
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y + yOffset);
      
      // Create smooth curve through points
      for (let i = 1; i < points.length - 2; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2 + yOffset;
        ctx.quadraticCurveTo(points[i].x, points[i].y + yOffset, xc, yc);
      }
      
      // Last segment
      const last = points.length - 1;
      ctx.quadraticCurveTo(
        points[last - 1].x, points[last - 1].y + yOffset,
        points[last].x, points[last].y + yOffset
      );
      
      // Fill with gradient
      const gradient = ctx.createLinearGradient(0, centerY - auroraHeight/2, 0, centerY + auroraHeight/2);
      gradient.addColorStop(0, colors[j]);
      gradient.addColorStop(1, colors[j + 1]);
      
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }
}

/**
 * Creates a simplified texture for Saturn's rings - optimized for performance
 */
export const createDetailedSaturnRingsTexture = () => {
  // Use shared offscreen canvas if available, or create a new one
  const canvas = window.sharedOffscreenCanvas || document.createElement('canvas');
  if (!window.sharedOffscreenCanvas) {
    canvas.width = 512;
    canvas.height = 512;
  }
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
  
  // Add some particle detail - slightly fewer particles for performance
  const numParticles = 3000; // Balanced value
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
  
  // Add radial streaks for a more dynamic appearance - but fewer for performance
  const numStreaks = 100; // Reduced from 200
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
  
  // Create texture with optimized settings
  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = false; // Disable mipmaps for better performance
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.rotation = Math.PI / 2;
  texture.center = new THREE.Vector2(0.5, 0.5);
  
  // High optimization: Tell Three.js this texture is already in GPU format
  // This avoids expensive color space conversions
  texture.colorSpace = THREE.NoColorSpace;
  
  return texture;
};

/**
 * Creates a texture for the moon's surface with craters
 * Optimized version with fewer details and simpler drawing
 */
export const createMoonTexture = () => {
  // Use shared offscreen canvas if available, or create a new one
  const canvas = window.sharedOffscreenCanvas || document.createElement('canvas');
  if (!window.sharedOffscreenCanvas) {
    canvas.width = 512; // Reduced size
    canvas.height = 256; // Reduced size
  }
  const ctx = canvas.getContext('2d', { alpha: false }); // Disable alpha for better performance
  // Clear the canvas first in case it was used previously
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Base color - brighter white/gray
  ctx.fillStyle = '#E8E8E8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add darker base regions for maria (lunar seas)
  const maria = [
    { x: 200, y: 100, radius: 60 }, // Mare Imbrium
    { x: 275, y: 140, radius: 40 },  // Mare Serenitatis
    { x: 300, y: 190, radius: 35 },  // Mare Tranquillitatis
    { x: 325, y: 100, radius: 30 },  // Mare Frigoris
    { x: 240, y: 175, radius: 45 },  // Mare Nubium
  ];
  
  // Fill maria with slightly darker color
  ctx.fillStyle = '#C0C0C0';
  maria.forEach(mare => {
    ctx.beginPath();
    ctx.arc(mare.x, mare.y, mare.radius, 0, Math.PI * 2);
    ctx.fill();
  });
  
  // Add fewer craters for better performance
  const craterCount = 40; // Reduced from 100
  for (let i = 0; i < craterCount; i++) {
    const size = Math.random() * 20 + 5; // Slightly smaller craters
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    
    // Crater outer rim - slightly brighter
    ctx.fillStyle = '#DDDDDD';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Crater inner area - darker (simplified to one inner layer)
    ctx.fillStyle = '#999999';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Add very few small craters for detail
  const smallCraterCount = 60; // Reduced from 200
  for (let i = 0; i < smallCraterCount; i++) {
    const size = Math.random() * 5 + 1;
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    
    // Small crater with simple design
    ctx.fillStyle = '#999999';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Create texture from canvas with optimized settings
  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = false; // Disable mipmaps for better performance
  texture.minFilter = THREE.LinearFilter; // Use simple filtering
  texture.magFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.NoColorSpace; // Avoid color space conversion
  
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

/**
 * Creates a texture for Phobos (Mars' largest moon)
 * Heavily cratered, irregularly shaped body
 */
export const createPhobosTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Base color - lightened reddish-gray for better visibility
  ctx.fillStyle = '#BFA698';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add the Stickney crater - largest feature on Phobos
  const stickneyX = canvas.width * 0.25;
  const stickneyY = canvas.height * 0.4;
  const stickneySize = canvas.width * 0.18; // Very large crater
  
  // Crater outer rim
  ctx.fillStyle = '#75655A';
  ctx.beginPath();
  ctx.arc(stickneyX, stickneyY, stickneySize, 0, Math.PI * 2);
  ctx.fill();
  
  // Crater inner area
  ctx.fillStyle = '#5A4D45';
  ctx.beginPath();
  ctx.arc(stickneyX, stickneyY, stickneySize * 0.85, 0, Math.PI * 2);
  ctx.fill();
  
  // Crater floor
  ctx.fillStyle = '#4A413C';
  ctx.beginPath();
  ctx.arc(stickneyX, stickneyY, stickneySize * 0.6, 0, Math.PI * 2);
  ctx.fill();
  
  // Add grooves/striations (unique to Phobos)
  const grooveCount = 15;
  for (let i = 0; i < grooveCount; i++) {
    const startX = Math.random() * canvas.width;
    const startY = Math.random() * canvas.height;
    const length = 50 + Math.random() * 200;
    const angle = Math.random() * Math.PI;
    
    // Calculate end point
    const endX = startX + Math.cos(angle) * length;
    const endY = startY + Math.sin(angle) * length;
    
    // Draw groove
    ctx.strokeStyle = `rgba(100, 90, 80, ${Math.random() * 0.4 + 0.3})`;
    ctx.lineWidth = 2 + Math.random() * 4;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }
  
  // Add many small craters
  const smallCraterCount = 250;
  for (let i = 0; i < smallCraterCount; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 10 + 3;
    
    // Avoid placing craters inside Stickney
    const distToStickney = Math.sqrt(Math.pow(x - stickneyX, 2) + Math.pow(y - stickneyY, 2));
    if (distToStickney < stickneySize * 0.6) continue;
    
    // Crater rim
    ctx.fillStyle = '#7A6A5F';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Crater interior
    ctx.fillStyle = '#5F5347';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Add some larger craters
  const largeCraterCount = 30;
  for (let i = 0; i < largeCraterCount; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 25 + 10;
    
    // Avoid placing large craters inside Stickney
    const distToStickney = Math.sqrt(Math.pow(x - stickneyX, 2) + Math.pow(y - stickneyY, 2));
    if (distToStickney < stickneySize * 0.8) continue;
    
    // Crater rim
    ctx.fillStyle = '#8A7A6F';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Crater wall
    ctx.fillStyle = '#6F635A';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.85, 0, Math.PI * 2);
    ctx.fill();
    
    // Crater floor
    ctx.fillStyle = '#5A4F48';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Add slightly darker edge to create irregular shape appearance
  const gradient = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, canvas.width * 0.3,
    canvas.width / 2, canvas.height / 2, canvas.width * 0.5
  );
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
};

/**
 * Creates a texture for Deimos (Mars' smaller moon)
 * Smaller, less cratered moon with smoother appearance
 */
export const createDeimosTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Base color - lightened grayish-brown for better visibility
  ctx.fillStyle = '#CDB9A8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add subtle regional variations
  const regionCount = 6;
  for (let i = 0; i < regionCount; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 150 + 100;
    
    // Slightly different shades of the base color
    const brightness = Math.random() * 20 - 10;
    ctx.fillStyle = `rgb(${154 + brightness}, ${138 + brightness}, ${122 + brightness})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Add medium craters - fewer than Phobos
  const mediumCraterCount = 70;
  for (let i = 0; i < mediumCraterCount; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 15 + 5;
    
    // Crater rim
    ctx.fillStyle = '#A59080';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Crater interior
    ctx.fillStyle = '#857060';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.75, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Add some small craters
  const smallCraterCount = 150;
  for (let i = 0; i < smallCraterCount; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 5 + 2;
    
    // Simple small craters
    ctx.fillStyle = '#7A6A60';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Add some brighter and darker patches for regolith variations
  const patchCount = 30;
  for (let i = 0; i < patchCount; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 40 + 20;
    const brightness = Math.random() > 0.5;
    
    // Alternately add brighter and darker patches
    ctx.fillStyle = brightness 
      ? `rgba(180, 170, 160, ${Math.random() * 0.2 + 0.1})` 
      : `rgba(80, 70, 60, ${Math.random() * 0.15 + 0.1})`;
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Slight vignette to create irregular shape illusion
  const gradient = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, canvas.width * 0.3,
    canvas.width / 2, canvas.height / 2, canvas.width * 0.5
  );
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(0.8, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
};

/**
 * Creates a texture for Charon (Pluto's largest moon)
 * Characterized by a dark reddish north polar region (Mordor Macula)
 */
export const createCharonTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Base color - grayish with slight blue tint
  ctx.fillStyle = '#B8BCC0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Create Mordor Macula (dark reddish north polar region)
  const mordorX = canvas.width / 2;
  const mordorY = canvas.height * 0.2; // North pole region
  const mordorRadius = canvas.width * 0.3;
  
  // Create gradient for smooth edges
  const mordorGradient = ctx.createRadialGradient(
    mordorX, mordorY, 0,
    mordorX, mordorY, mordorRadius
  );
  mordorGradient.addColorStop(0, 'rgba(100, 50, 50, 0.9)');
  mordorGradient.addColorStop(0.7, 'rgba(120, 60, 60, 0.7)');
  mordorGradient.addColorStop(1, 'rgba(140, 80, 80, 0)');
  
  ctx.fillStyle = mordorGradient;
  ctx.beginPath();
  ctx.arc(mordorX, mordorY, mordorRadius, 0, Math.PI * 2);
  ctx.fill();
  
  // Create large impact craters
  const craterCount = 12;
  for (let i = 0; i < craterCount; i++) {
    // Avoid putting craters in Mordor Macula (north polar region)
    let x, y, distToMordor;
    do {
      x = Math.random() * canvas.width;
      y = Math.random() * canvas.height;
      distToMordor = Math.sqrt(Math.pow(x - mordorX, 2) + Math.pow(y - mordorY, 2));
    } while (distToMordor < mordorRadius * 0.7);
    
    const size = Math.random() * 40 + 20;
    
    // Crater rim - slightly brighter than base
    ctx.fillStyle = '#CDD1D6';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Crater depression - slightly darker than base
    ctx.fillStyle = '#A0A4A8';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.85, 0, Math.PI * 2);
    ctx.fill();
    
    // Crater center - darker
    ctx.fillStyle = '#909498';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Add some smaller craters
  const smallCraterCount = 80;
  for (let i = 0; i < smallCraterCount; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 15 + 5;
    
    // Small crater - simple design
    const brightness = Math.random() < 0.5 ? '#A0A4A8' : '#CDD1D6';
    ctx.fillStyle = brightness;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Add terrain variation - subtle lighter and darker patches
  const patchCount = 15;
  for (let i = 0; i < patchCount; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 100 + 50;
    
    // Random light or dark patch with low opacity
    const brightness = Math.random() < 0.5 ? 
      'rgba(200, 205, 210, 0.15)' : 
      'rgba(150, 155, 160, 0.15)';
    
    ctx.fillStyle = brightness;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
};