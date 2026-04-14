"use client";

import { Plus, Search, Building2, MapPin, BadgeIndianRupee } from 'lucide-react';

const PropertiesPage = () => {
  const properties = [
    { name: "Chimbali Premium Plots", location: "Chimbali, Pune", type: "Plot", price: "25L - 45L", status: "Available" },
    { name: "Kuruli Meadows", location: "Kuruli", type: "Plot", price: "18L - 30L", status: "Sold Out" },
    { name: "Dream Park Phase 2", location: "Chimbali", type: "Plot", price: "35L - 60L", status: "Fast Selling" },
  ];

  return (
    <div className="container animate-fade">
      <header className="page-header">
        <h1>Available Properties</h1>
        <button className="btn-primary">
          <Plus size={18} />
          Add Property
        </button>
      </header>

      <div className="property-grid">
        {properties.map((prop, i) => (
          <div key={i} className="property-card">
            <div className="prop-image">
              <Building2 size={48} />
              <span className={`status-tag ${prop.status.toLowerCase().replace(/\s+/g, '-')}`}>
                {prop.status}
              </span>
            </div>
            <div className="prop-details">
              <h3>{prop.name}</h3>
              <div className="info">
                <MapPin size={14} />
                <span>{prop.location}</span>
              </div>
              <div className="info">
                <BadgeIndianRupee size={14} />
                <span className="price">{prop.price}</span>
              </div>
              <button className="btn-outline">View Matching Leads</button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default PropertiesPage;
