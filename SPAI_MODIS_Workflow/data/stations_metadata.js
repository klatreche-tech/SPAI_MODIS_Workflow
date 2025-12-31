/**
 * stations_metadata.js | SPAI Validation Project
 * 
 * 24 globally distributed meteorological stations metadata
 * For MODIS data extraction and SPAI validation
 * 
 * Fields: id, name, country, coordinates, elevation, climate, bufferRadius
 * Format: [Longitude, Latitude] in decimal degrees
 * Buffer: 5000m radius around each station
 * 
 * Author: Khaled Latreche | Date: 2026
 * Project: Standardized Pluviothermal Anomaly Index (SPAI)
 */

// -----------------------------------------------
// 1. GLOBAL STATIONS CONFIGURATION
// -----------------------------------------
var GLOBAL_STATIONS = [
  // Polar/Ice Cap
  {
    id: 'AMUNDSEN_SCOTT',
    name: 'Amundsen-Scott Station',
    country: 'Antarctica',
    coordinates: [0.0000, -90.0000], // [lon, lat] - NOTE: Antarctica!
    elevation: 2835,
    climate: 'Ice Cap (EF)',
    bufferRadius: 5000
  },
  
  // Tundra
  {
    id: 'BARROW_AIRPORT',
    name: 'Barrow Airport',
    country: 'USA',
    coordinates: [-156.7394, 71.2870],
    elevation: 4,
    climate: 'Tundra (ET)',
    bufferRadius: 5000
  },
  
  {
    id: 'AMDERMA',
    name: 'Amderma',
    country: 'Russia',
    coordinates: [61.7000, 69.7500],
    elevation: 48,
    climate: 'Tundra (ET)',
    bufferRadius: 5000
  },
  
  // Subpolar
  {
    id: 'REYKJAVIK',
    name: 'Reykjavik',
    country: 'Iceland',
    coordinates: [-21.9025, 64.1269],
    elevation: 61,
    climate: 'Subpolar Oceanic (Cfc)',
    bufferRadius: 5000
  },
  
  // Subarctic
  {
    id: 'ALDAN',
    name: 'Aldan',
    country: 'Russia',
    coordinates: [125.0331, 58.6167],
    elevation: 682,
    climate: 'Subarctic (Dwc)',
    bufferRadius: 5000
  },
  
  // Humid Continental
  {
    id: 'BALAGANSK',
    name: 'Balagansk',
    country: 'Russia',
    coordinates: [103.0700, 54.0000],
    elevation: 425,
    climate: 'Humid Continental (Dwb)',
    bufferRadius: 5000
  },
  
  {
    id: 'AKSAKOVO',
    name: 'Aksakovo',
    country: 'Russia',
    coordinates: [54.2000, 54.0000],
    elevation: 345,
    climate: 'Humid Continental (Dfb)',
    bufferRadius: 5000
  },
  
  {
    id: 'ARHARA',
    name: 'Arhara',
    country: 'Russia',
    coordinates: [130.0831, 49.4167],
    elevation: 157,
    climate: 'Humid Continental (Dwa)',
    bufferRadius: 5000
  },
  
  {
    id: 'MASON_CITY',
    name: 'Mason City',
    country: 'USA',
    coordinates: [-93.3261, 43.1544],
    elevation: 369,
    climate: 'Humid Continental (Dfa)',
    bufferRadius: 5000
  },
  
  // Semi-Arid
  {
    id: 'CHEYENNE',
    name: 'Cheyenne',
    country: 'USA',
    coordinates: [-104.8081, 41.1579],
    elevation: 1872,
    climate: 'Semi-Arid (BSk)',
    bufferRadius: 5000
  },
  
  // Hot Deserts
  {
    id: 'ALICE_SPRINGS',
    name: 'Alice Springs',
    country: 'Australia',
    coordinates: [133.8890, -23.7951],
    elevation: 546,
    climate: 'Hot Desert (BWh)',
    bufferRadius: 5000
  },
  
  {
    id: 'IN_AMENAS',
    name: 'In Amenas',
    country: 'Algeria',
    coordinates: [9.6331, 28.0500],
    elevation: 563,
    climate: 'Hot Desert (BWh)',
    bufferRadius: 5000
  },
  
  {
    id: 'BISKRA',
    name: 'Biskra',
    country: 'Algeria',
    coordinates: [5.7300, 34.8000],
    elevation: 124,
    climate: 'Hot Desert (BWh)',
    bufferRadius: 5000
  },
  
  // Hot Semi-Arid
  {
    id: 'KIMBERLEY',
    name: 'Kimberley',
    country: 'South Africa',
    coordinates: [24.7670, -28.8000],
    elevation: 1202,
    climate: 'Hot Semi-Arid (BSh)',
    bufferRadius: 5000
  },
  
  // Mediterranean
  {
    id: 'STOCKTON',
    name: 'Stockton',
    country: 'USA',
    coordinates: [-121.2264, 37.8900],
    elevation: 9,
    climate: 'Mediterranean (Csa)',
    bufferRadius: 5000
  },
  
  {
    id: 'ALGER_DAR_EL_BEIDA',
    name: 'Alger Dar El Beida',
    country: 'Algeria',
    coordinates: [3.2500, 36.7167],
    elevation: 25,
    climate: 'Mediterranean (Csa)',
    bufferRadius: 5000
  },
  
  // Humid Subtropical
  {
    id: 'SYDNEY_AIRPORT',
    name: 'Sydney Airport',
    country: 'Australia',
    coordinates: [151.1731, -33.9465],
    elevation: 6,
    climate: 'Humid Subtropical (Cfa)',
    bufferRadius: 5000
  },
  
  // Tropical Rainforest
  {
    id: 'KUANTAN',
    name: 'Kuantan',
    country: 'Malaysia',
    coordinates: [103.2200, 3.6200],
    elevation: 15,
    climate: 'Tropical Rainforest (Af)',
    bufferRadius: 5000
  },
  
  // Mediterranean (Csb)
  {
    id: 'OLYMPIA_AIRPORT',
    name: 'Olympia Airport',
    country: 'USA',
    coordinates: [-122.9049, 46.9737],
    elevation: 64,
    climate: 'Mediterranean (Csb)',
    bufferRadius: 5000
  },
  
  // Oceanic (Europe)
  {
    id: 'BREST_GUIPAVAS',
    name: 'Brest Guipavas',
    country: 'France',
    coordinates: [-4.4117, 48.4442],
    elevation: 99,
    climate: 'Oceanic (Cfb)',
    bufferRadius: 5000
  },
  
  {
    id: 'ALENCON',
    name: 'Alencon',
    country: 'France',
    coordinates: [0.1103, 48.4456],
    elevation: 146,
    climate: 'Oceanic (Cfb)',
    bufferRadius: 5000
  },
  
  {
    id: 'DURHAM',
    name: 'Durham',
    country: 'UK',
    coordinates: [-1.5842, 54.7678],
    elevation: 102,
    climate: 'Oceanic (Cfb)',
    bufferRadius: 5000
  },
  
  {
    id: 'ABERPORTH',
    name: 'Aberporth',
    country: 'UK',
    coordinates: [-4.5717, 52.1389],
    elevation: 133,
    climate: 'Oceanic (Cfb)',
    bufferRadius: 5000
  },
  
  {
    id: 'BRADFORD',
    name: 'Bradford',
    country: 'UK',
    coordinates: [-1.7739, 53.8131],
    elevation: 134,
    climate: 'Oceanic (Cfb)',
    bufferRadius: 5000
  }
];