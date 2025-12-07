import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Initialize Anthropic client - API key should be in environment variable
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// Helper function to extract business information from search results
function extractBusinessInfo(searchResults, niche, city) {
    const businesses = [];
    const seen = new Set();

    // This is a simplified extraction - in production, you'd want more sophisticated parsing
    // The search results will contain text that we need to parse for business information

    // For demonstration, we'll create a structured response
    // In a real implementation, you'd parse the search results more carefully

    return businesses;
}

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

app.post('/api/search', async (req, res) => {
    try {
        const { niche, city } = req.body;

        if (!niche || !city) {
            return res.status(400).json({ error: 'Niche and city are required' });
        }

        console.log(`Searching for ${niche} in ${city}...`);

        const businesses = await searchBusinesses(niche, city);

        console.log(`Found ${businesses.length} businesses`);

        res.json({ businesses });
    } catch (error) {
        console.error('Error in search endpoint:', error);
        res.status(500).json({
            error: 'Error searching for businesses',
            details: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Make sure ANTHROPIC_API_KEY environment variable is set');
});
