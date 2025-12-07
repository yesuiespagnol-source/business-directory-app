import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// Helper function to perform multiple searches and aggregate results
async function searchBusinesses(niche, city) {
    const searchQueries = [
        `${niche} en ${city} directorio`,
        `${niche} ${city} teléfono dirección`,
        `listado ${niche} ${city}`,
        `${niche} ${city} contacto`,
    ];

    const allBusinesses = [];
    const seenNames = new Set();

    for (const query of searchQueries) {
        try {
            const message = await anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 4096,
                messages: [{
                    role: 'user',
                    content: `Busca información sobre ${niche} en ${city}. Para cada negocio que encuentres, proporciona la siguiente información en formato JSON:
          
{
  "businesses": [
    {
      "name": "nombre del negocio",
      "phone": "teléfono (si está disponible)",
      "address": "dirección completa",
      "website": "URL de la página web (si tiene)"
    }
  ]
}

Busca al menos 10-15 negocios diferentes. Si un negocio no tiene página web, omite el campo "website" o déjalo vacío. Asegúrate de que la respuesta sea un JSON válido.`
                }],
            });

            // Extract text content from the response
            const responseText = message.content[0].text;

            // Try to parse JSON from the response
            try {
                // Find JSON in the response (it might be wrapped in markdown code blocks)
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const data = JSON.parse(jsonMatch[0]);
                    if (data.businesses && Array.isArray(data.businesses)) {
                        data.businesses.forEach(business => {
                            // Deduplicate by name
                            const normalizedName = business.name.toLowerCase().trim();
                            if (!seenNames.has(normalizedName)) {
                                seenNames.add(normalizedName);
                                allBusinesses.push({
                                    name: business.name,
                                    phone: business.phone || null,
                                    address: business.address || null,
                                    website: business.website || null,
                                });
                            }
                        });
                    }
                }
            } catch (parseError) {
                console.error('Error parsing JSON from response:', parseError);
            }

            // Add a small delay between requests to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
            console.error(`Error searching for "${query}":`, error);
        }
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
