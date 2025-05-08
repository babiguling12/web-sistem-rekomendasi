import React from 'react';

type Props = {
  place: {
    name: string;
    image?: string;
    description?: string;
    category: string;
  };
  weather: string;
};

const PlaceCard: React.FC<Props> = ({ place, weather }) => (
  <div className="border p-4 mb-4 rounded shadow">
    <img src={place.image} alt={place.name} className="w-full h-48 object-cover mb-2 rounded" />
    <h2 className="text-xl font-bold">{place.name}</h2>
    <p>{place.description}</p>
    <p><strong>Kategori:</strong> {place.category}</p>
    <p><strong>Cuaca:</strong> {weather}</p>
  </div>
);

export default PlaceCard;
