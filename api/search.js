import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// Helper function to perform multiple searches and aggregate results
async function searchBusinesses(niche, city) {
    const searchQueries = [
        `${niche} en ${city} directorio completo`,
        `${niche} ${city} teléfono dirección contacto`,
        `listado completo ${niche} ${city}`,
        `${niche} ${city} páginas amarillas`,
        `${niche} ${city} Google Maps`,
        `todos los ${niche} en ${city}`,
        `guía ${niche} ${city}`,
        `${niche} ${city} directorio empresas`,
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
                    content: `Actúa como un asistente que busca información EXHAUSTIVA de negocios locales. Necesito que encuentres la MAYOR CANTIDAD POSIBLE de ${niche} en ${city}, España.

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
1. Busca el MÁXIMO número posible de negocios de ${niche} en ${city} - intenta encontrar entre 30-50 negocios si es posible
2. Busca en TODAS las fuentes disponibles: Google Maps, Páginas Amarillas, directorios locales, guías comerciales, etc.
3. Si un negocio NO tiene página web, omite completamente el campo "website" o pon null
4. Si no encuentras el teléfono, pon null en "phone"
5. Si no encuentras la dirección completa, pon null en "address"
6. ASEGÚRATE de que el JSON sea válido (sin comas extras, comillas bien cerradas)
7. NO agregues texto adicional fuera del JSON
8. Incluye negocios grandes, medianos y pequeños
9. No te limites - quiero TODOS los ${niche} que puedas encontrar en ${city}

Responde SOLO con el JSON, sin explicaciones adicionales. Prioriza CANTIDAD y COMPLETITUD de resultados.`
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
