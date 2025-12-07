import React from 'react';
import SearchForm from './components/SearchForm';
import BusinessList from './components/BusinessList';
import ExportButtons from './components/ExportButtons';

function App() {
    const [businesses, setBusinesses] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [searchQuery, setSearchQuery] = React.useState(null);

    const handleSearch = async (niche, city) => {
        setIsLoading(true);
        setError(null);
        setBusinesses([]);
        setSearchQuery({ niche, city });

        try {
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ niche, city }),
            });

            if (!response.ok) {
                throw new Error('Error en la búsqueda');
            }

            const data = await response.json();
            setBusinesses(data.businesses || []);

            if (data.businesses.length === 0) {
                setError('No se encontraron negocios. Intenta con otros términos de búsqueda.');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Ocurrió un error al buscar negocios. Por favor, intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <SearchForm onSearch={handleSearch} isLoading={isLoading} />

                {error && (
                    <div className="glass-card p-6 mb-6 bg-red-50 border-red-200 animate-fade-in">
                        <div className="flex items-center gap-3">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-800 font-medium">{error}</p>
                        </div>
                    </div>
                )}

                {businesses.length > 0 && searchQuery && (
                    <>
                        <ExportButtons businesses={businesses} searchQuery={searchQuery} />
                        <BusinessList businesses={businesses} searchQuery={searchQuery} />
                    </>
                )}
            </div>
        </div>
    );
}

export default App;
