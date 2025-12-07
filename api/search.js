// Helper function to search businesses using Google Places API
async function searchBusinesses(niche, city) {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
        throw new Error('Google Places API key not configured');
    }

    const allBusinesses = [];
    const seenPlaceIds = new Set();

    try {
        // Use Google Places API (New) - Text Search
        const searchQuery = `${niche} in ${city}, Spain`;

        console.log(`Searching Google Places for: ${searchQuery}`);

        // Make request to Google Places API
        const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': apiKey,
                'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.internationalPhoneNumber,places.websiteUri,places.businessStatus'
            },
            body: JSON.stringify({
                textQuery: searchQuery,
                languageCode: 'es',
                maxResultCount: 20, // Maximum per request
                locationBias: {
                    circle: {
                        center: {
                            latitude: city.toLowerCase() === 'madrid' ? 40.4168 :
                                city.toLowerCase() === 'barcelona' ? 41.3851 :
                                    city.toLowerCase() === 'valencia' ? 39.4699 :
                                        40.4168, // Default to Madrid
                            longitude: city.toLowerCase() === 'madrid' ? -3.7038 :
                                city.toLowerCase() === 'barcelona' ? 2.1734 :
                                    city.toLowerCase() === 'valencia' ? -0.3763 :
                                        -3.7038 // Default to Madrid
                        },
                        radius: 50000.0 // 50km radius
                    }
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Google Places API error:', errorText);
            throw new Error(`Google Places API error: ${response.status}`);
        }

        const data = await response.json();

        console.log(`Google Places returned ${data.places?.length || 0} results`);

        if (data.places && Array.isArray(data.places)) {
            data.places.forEach(place => {
                // Skip if already seen or not operational
                if (seenPlaceIds.has(place.id) || place.businessStatus !== 'OPERATIONAL') {
                    return;
                }

                seenPlaceIds.add(place.id);

                allBusinesses.push({
                    name: place.displayName?.text || 'Sin nombre',
                    phone: place.internationalPhoneNumber || null,
                    address: place.formattedAddress || null,
                    website: place.websiteUri || null,
                });
            });
        }

        console.log(`Total unique businesses found: ${allBusinesses.length}`);

    } catch (error) {
        console.error('Error searching with Google Places API:', error);
        throw error;
    }

    return allBusinesses;
}

// Vercel Serverless Function
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { niche, city } = req.body;

        if (!niche || !city) {
            return res.status(400).json({ error: 'Niche and city are required' });
        }

        console.log(`Searching for ${niche} in ${city}...`);

        const businesses = await searchBusinesses(niche, city);

        console.log(`Found ${businesses.length} businesses`);

        res.status(200).json({ businesses });
    } catch (error) {
        console.error('Error in search endpoint:', error);
        res.status(500).json({
            error: 'Error searching for businesses',
            details: error.message
        });
    }
}
