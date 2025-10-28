'use client';

import dynamic from 'next/dynamic';

// Lazy load MapContainer to avoid SSR issues with Mapbox
const MapContainer = dynamic(() => import('@/components/MapContainer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading application...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

  return (
    <main className="w-full h-screen">
      <MapContainer mapboxToken={mapboxToken} />
    </main>
  );
}
