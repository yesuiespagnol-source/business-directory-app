import React from 'react';

export default function SearchForm({ onSearch, isLoading }) {
    const [niche, setNiche] = React.useState('');
    const [city, setCity] = React.useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (niche.trim() && city.trim()) {
            onSearch(niche.trim(), city.trim());
        }
    };

    return (
        <div className="glass-card p-8 mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
                Buscador de Negocios Locales
            </h1>
            <p className="text-gray-600 mb-8">
                Encuentra negocios en tu ciudad y descubre cuáles tienen presencia web
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="niche" className="block text-sm font-semibold text-gray-700 mb-2">
                            Tipo de Negocio
                        </label>
                        <input
                            id="niche"
                            type="text"
                            value={niche}
                            onChange={(e) => setNiche(e.target.value)}
                            placeholder="ej: peluquerías, restaurantes, fontaneros..."
                            className="input-field"
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                            Ciudad
                        </label>
                        <input
                            id="city"
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="ej: Madrid, Barcelona, Valencia..."
                            className="input-field"
                            disabled={isLoading}
                            required
                        />
                    </div>
                </div>

                <div className="flex justify-center">
                    <button
                        type="submit"
                        disabled={isLoading || !niche.trim() || !city.trim()}
                        className="btn-primary flex items-center gap-3"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Buscando negocios...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Buscar Negocios
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
