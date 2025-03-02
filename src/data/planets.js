// Planet data for the solar system app
const planets = [
  { 
    id: 'mercury', 
    name: 'Mercury', 
    color: '#A9A9A9',
    description: 'The smallest planet in our solar system and closest to the Sun, with a cratered surface similar to our Moon. Mercury has extreme temperature variations and almost no atmosphere.'
  },
  { 
    id: 'venus', 
    name: 'Venus', 
    color: '#E2B04A',
    description: 'Venus has a thick, toxic atmosphere filled with carbon dioxide and clouds of sulfuric acid. Its surface is a volcanic landscape with crushing pressure and temperatures hot enough to melt lead.'
  },
  { 
    id: 'earth', 
    name: 'Earth', 
    color: '#6B93D6',
    description: 'Our home planet is the only place in the known universe confirmed to host life. Earth\'s atmosphere, oceans, and dynamic ecosystem make it unique in our solar system.'
  },
  { 
    id: 'mars', 
    name: 'Mars', 
    color: '#C1440E',
    description: 'Known as the Red Planet, Mars has a thin atmosphere and is home to the largest volcano and canyon in the solar system. Evidence suggests Mars once had flowing water on its surface.'
  },
  { 
    id: 'jupiter', 
    name: 'Jupiter', 
    color: '#E3B982',
    description: 'The largest planet in our solar system, Jupiter is a gas giant with a striped appearance caused by strong winds in its upper atmosphere. Its Great Red Spot is a massive storm that has existed for centuries.'
  },
  { 
    id: 'saturn', 
    name: 'Saturn', 
    color: '#F4D59C',
    description: 'Saturn is known for its beautiful rings made mostly of ice chunks and dust. Like Jupiter, it\'s a gas giant with a similar composition but less mass, giving it a lower density than water.'
  },
  { 
    id: 'uranus', 
    name: 'Uranus', 
    color: '#AAD3F2',
    description: 'Uranus rotates on its side, giving it extreme seasons that last for decades. This ice giant has a methane-rich atmosphere that gives it a blue-green color and numerous thin, dark rings.'
  },
  { 
    id: 'neptune', 
    name: 'Neptune', 
    color: '#2A67AB',
    description: 'The windiest planet in our solar system, Neptune has storms with speeds of over 1,200 mph. Like Uranus, it\'s classified as an ice giant and has a similar blue color due to methane in its atmosphere.'
  }
];

// Easter egg: Dwarf planets - not shown in main UI
export const dwarfPlanets = [
  {
    id: 'pluto',
    name: 'Pluto',
    color: '#B5A9A1',
    description: 'Once considered the ninth planet, Pluto was reclassified as a dwarf planet in 2006. Despite its demotion, this icy world with a heart-shaped region of nitrogen ice remains a fascinating celestial body with five moons and a thin atmosphere that expands and contracts as it orbits the Sun.',
    orbitRadius: 115.5, // Beyond Neptune (was 77)
    size: 0.18, // Relative size
    hidden: true
  },
  {
    id: 'ceres',
    name: 'Ceres',
    color: '#A59D92',
    description: 'The largest object in the asteroid belt between Mars and Jupiter, Ceres accounts for about a third of the belt\'s total mass. This dwarf planet may have an ocean of liquid water beneath its surface, making it a target of interest in the search for extraterrestrial life.',
    orbitRadius: 43.5, // In the asteroid belt (was 29)
    size: 0.08, // Relative size
    hidden: true
  },
  {
    id: 'haumea',
    name: 'Haumea',
    color: '#F8F8F8',
    description: 'One of the strangest objects in the solar system, Haumea has an elongated egg-like shape caused by its rapid rotation. This dwarf planet also has two moons and a ring, and is covered in crystalline water ice that gives it a bright appearance.',
    orbitRadius: 127.5, // Beyond Neptune (was 85)
    size: 0.11, // Relative size
    hidden: true
  },
  {
    id: 'makemake',
    name: 'Makemake',
    color: '#D7A97F',
    description: 'Named after the creation deity of the Rapa Nui people of Easter Island, Makemake is the second-brightest object in the Kuiper Belt after Pluto. This dwarf planet has at least one moon and a reddish appearance due to the presence of complex organic molecules called tholins on its surface.',
    orbitRadius: 139.5, // Far beyond Neptune (was 93)
    size: 0.14, // Relative size
    hidden: true
  }
];

export default planets;