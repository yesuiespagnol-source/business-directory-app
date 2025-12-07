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
                    content: `Actúa como un asistente que busca información de negocios locales. Necesito que encuentres información sobre ${niche} en ${city}, España.

Para cada negocio que encuentres, proporciona EXACTAMENTE este formato JSON (es muy importante que sea JSON válido):

{
  "businesses": [
    {
      "name": "Nombre del Negocio",
      "phone": "teléfono con prefijo",
      "address": "dirección completa con código postal",
      "website": "https://www.ejemplo.com"
    }
  ]
}

INSTRUCCIONES IMPORTANTES:
1. Busca al menos 15-20 negocios diferentes de ${niche} en ${city}
2. Si un negocio NO tiene página web, omite completamente el campo "website" o pon null
3. Si no encuentras el teléfono, pon null en "phone"
4. Si no encuentras la dirección completa, pon null en "address"
5. ASEGÚRATE de que el JSON sea válido (sin comas extras, comillas bien cerradas)
6. NO agregues texto adicional fuera del JSON
7. Busca en directorios como Google Maps, Páginas Amarillas, directorios locales, etc.

Responde SOLO con el JSON, sin explicaciones adicionales.`
                }],
            });

            // Extract text content from the response
            const responseText = message.content[0].text;

            // Try to parse JSON from the response
            try {
                let jsonData = null;

                // Strategy 1: Try to find JSON in markdown code blocks
                const codeBlockMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
                if (codeBlockMatch) {
                    jsonData = JSON.parse(codeBlockMatch[1]);
                } else {
                    // Strategy 2: Try to find raw JSON object
                    const jsonMatch = responseText.match(/\{[\s\S]*"businesses"[\s\S]*\}/);
                    if (jsonMatch) {
                        jsonData = JSON.parse(jsonMatch[0]);
                    }
                }

                if (jsonData && jsonData.businesses && Array.isArray(jsonData.businesses)) {
                    jsonData.businesses.forEach(business => {
                        // Deduplicate by name
                        const normalizedName = business.name.toLowerCase().trim();
                        if (!seenNames.has(normalizedName) && business.name && business.name.length > 2) {
                            seenNames.add(normalizedName);
                            allBusinesses.push({
                                name: business.name.trim(),
                                phone: business.phone && business.phone !== 'null' ? business.phone.trim() : null,
                                address: business.address && business.address !== 'null' ? business.address.trim() : null,
                                website: business.website && business.website !== 'null' ? business.website.trim() : null,
                            });
                        }
                    });
                    console.log(`Found ${jsonData.businesses.length} businesses in this query`);
                } else {
                    console.log('No valid businesses array found in response');
                }
            } catch (parseError) {
                console.error('Error parsing JSON from response:', parseError);
                console.log('Response text:', responseText.substring(0, 500));
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
