import React from 'react';

export default function ExportButtons({ businesses, searchQuery }) {
    const exportToCSV = () => {
        const headers = ['Nombre', 'Teléfono', 'Dirección', 'Página Web', 'Tiene Web'];
        const rows = businesses.map(b => [
            b.name,
            b.phone || '',
            b.address || '',
            b.website || '',
            b.website ? 'Sí' : 'No'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `negocios_${searchQuery.niche}_${searchQuery.city}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const copyToClipboard = () => {
        const text = businesses.map(b => {
            const parts = [
                `Nombre: ${b.name}`,
                b.phone ? `Teléfono: ${b.phone}` : '',
                b.address ? `Dirección: ${b.address}` : '',
                b.website ? `Web: ${b.website}` : 'Sin página web'
            ].filter(Boolean);
            return parts.join('\n');
        }).join('\n\n---\n\n');

        navigator.clipboard.writeText(text).then(() => {
            alert('¡Resultados copiados al portapapeles!');
        }).catch(err => {
            console.error('Error al copiar:', err);
            alert('Error al copiar al portapapeles');
        });
    };

    if (businesses.length === 0) return null;

    return (
        <div className="glass-card p-6 mb-6 flex flex-wrap gap-4 items-center justify-between">
            <div className="text-gray-700">
                <span className="font-semibold text-lg">{businesses.length}</span> negocios encontrados
            </div>

            <div className="flex gap-3">
                <button
                    onClick={copyToClipboard}
                    className="btn-secondary flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copiar
                </button>

                <button
                    onClick={exportToCSV}
                    className="btn-secondary flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Exportar CSV
                </button>
            </div>
        </div>
    );
}
