const axios = require('axios');

async function getCoordsForAddress(address) {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
    );

    const data = response.data;

    if (!data || data.length === 0) {
      throw new Error('Could not find location for the specified address.');
    }

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon)
    };
  } catch (error) {
    throw new Error('Failed to fetch coordinates: ' + error.message);
  }
}

// Example usage
// (async () => {
//   try {
//     const coords = await getCoordsForAddress('banglore karnataka');
//     console.log(coords); // { lat: 48.8588443, lng: 2.2943506 }
//   } catch (error) {
//     console.error(error.message);
//   }
// })();

module.exports = getCoordsForAddress;