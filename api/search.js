import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// Helper function to perform multiple searches and aggregate results
async function searchBusinesses(niche, city) {
    // Optimized: 3 highly targeted searches for maximum results within timeout
    const searchQueries = [
        `listado completo ${niche} ${city} Google Maps directorio teléfono dirección web`,
        `todos los ${niche} en ${city} páginas amarillas guía comercial contacto`,
        `${niche} ${city} directorio empresas completo con datos de contacto`,
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
                    content: `Actúa como un asistente experto en búsqueda EXHAUSTIVA de negocios locales. Tu misión es encontrar la MÁXIMA CANTIDAD POSIBLE de ${niche} en ${city}, España.

Para cada negocio, proporciona este formato JSON EXACTO (crucial que sea JSON válido):

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

INSTRUCCIONES CRÍTICAS:
1. Busca entre 50-80 negocios de ${niche} en ${city} - NO TE LIMITES, quiero el MÁXIMO posible
2. Fuentes prioritarias: Google Maps, Páginas Amarillas, directorios locales, guías comerciales, listados empresariales
3. Incluye TODOS los tamaños: grandes cadenas, negocios medianos, pequeños locales, autónomos
4. Si NO tiene web → omite "website" o pon null
5. Si NO tiene teléfono → pon null en "phone"
6. Si NO tiene dirección → pon null en "address"
7. JSON VÁLIDO obligatorio (sin comas extras, comillas correctas)
8. SOLO JSON en la respuesta, SIN texto adicional
9. Prioridad absoluta: CANTIDAD MÁXIMA de resultados

Responde ÚNICAMENTE con el JSON. Objetivo: encontrar TODOS los ${niche} posibles en ${city}.`
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

            // Reduced delay for faster execution (still avoiding rate limits)
            await new Promise(resolve => setTimeout(resolve, 500));

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
