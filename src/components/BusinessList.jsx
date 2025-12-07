import React from 'react';

function BusinessCard({ business }) {
    const googleMapsUrl = business.address
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.name + ' ' + business.address)}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.name)}`;

    return (
        <div className="business-card">
            <h3 className="text-xl font-bold text-gray-800 mb-3">{business.name}</h3>

            <div className="space-y-2">
                {business.phone && (
                    <div className="flex items-center gap-2 text-gray-700">
                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <a href={`tel:${business.phone}`} className="hover:text-primary-600 transition-colors">
                            {business.phone}
                        </a>
                    </div>
                )}

                {business.address && (
                    <div className="flex items-start gap-2 text-gray-700">
                        <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="flex-1">{business.address}</span>
                    </div>
                )}

                {business.website && (
                    <div className="flex items-center gap-2 text-gray-700">
                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        <a
                            href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary-600 transition-colors truncate"
                        >
                            {business.website}
                        </a>
                    </div>
                )}

                <div className="pt-3 mt-3 border-t border-gray-200">
                    <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        Ver en Google Maps
                    </a>
                </div>
            </div>
        </div>
    );
}

export default function BusinessList({ businesses, searchQuery }) {
    const [searchFilter, setSearchFilter] = React.useState('');

    const withWebsite = businesses.filter(b => b.website);
    const withoutWebsite = businesses.filter(b => !b.website);

    const filterBusinesses = (list) => {
        if (!searchFilter.trim()) return list;
        const filter = searchFilter.toLowerCase();
        return list.filter(b =>
            b.name.toLowerCase().includes(filter) ||
            (b.address && b.address.toLowerCase().includes(filter)) ||
            (b.phone && b.phone.includes(filter))
        );
    };

    const filteredWithWebsite = filterBusinesses(withWebsite).sort((a, b) =>
        a.name.localeCompare(b.name, 'es')
    );

    const filteredWithoutWebsite = filterBusinesses(withoutWebsite).sort((a, b) =>
        a.name.localeCompare(b.name, 'es')
    );

    if (businesses.length === 0) return null;

    return (
        <div className="animate-fade-in">
            <div className="glass-card p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            Resultados: {searchQuery.niche} en {searchQuery.city}
                        </h2>
                        <p className="text-gray-600 mt-1">
                            {businesses.length} negocios encontrados
                        </p>
                    </div>

                    <div className="flex-1 md:max-w-md">
                        <input
                            type="text"
                            value={searchFilter}
                            onChange={(e) => setSearchFilter(e.target.value)}
                            placeholder="Filtrar resultados..."
                            className="input-field"
                        />
                    </div>
                </div>
            </div>

            {filteredWithoutWebsite.length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-red-100 p-2 rounded-lg">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">
                            Sin Página Web ({filteredWithoutWebsite.length})
                        </h3>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredWithoutWebsite.map((business, index) => (
                            <BusinessCard key={`no-web-${index}`} business={business} />
                        ))}
                    </div>
                </div>
            )}

            {filteredWithWebsite.length > 0 && (
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-green-100 p-2 rounded-lg">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">
                            Con Página Web ({filteredWithWebsite.length})
                        </h3>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredWithWebsite.map((business, index) => (
                            <BusinessCard key={`with-web-${index}`} business={business} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
