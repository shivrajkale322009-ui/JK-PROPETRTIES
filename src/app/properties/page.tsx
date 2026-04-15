"use client";

import { useState, useEffect } from 'react';
import { Plus, Search, Building2, MapPin, BadgeIndianRupee } from 'lucide-react';
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from 'next/link';

interface Property {
  id: string;
  name: string;
  location: string;
  type?: string;
  price: string;
  status: string;
}

const PropertiesPage = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        if (!db) return;
        const q = query(collection(db, "properties"), orderBy("name"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Property[];
        setProperties(data);
      } catch (error) {
        console.error("Error fetching properties: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  return (
    <div className="container animate-fade">
      <header className="page-header">
        <h1>Available Properties</h1>
        <button className="btn-primary">
          <Plus size={18} />
          Add Property
        </button>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'gray' }}>
          Loading properties from database...
        </div>
      ) : properties.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'gray' }}>
          No properties found. Please add a property to the database.
        </div>
      ) : (
        <div className="property-grid">
          {properties.map((prop, i) => (
            <div key={prop.id || i} className="property-card">
              <div className="prop-image">
                <Building2 size={48} />
                <span className={`status-tag ${(prop.status || "available").toLowerCase().replace(/\s+/g, '-')}`}>
                  {prop.status || "Available"}
                </span>
              </div>
              <div className="prop-details">
                <h3>{prop.name || "Unnamed Property"}</h3>
                <div className="info">
                  <MapPin size={14} />
                  <span>{prop.location || "N/A"}</span>
                </div>
                <div className="info">
                  <BadgeIndianRupee size={14} />
                  <span className="price">{prop.price || "Contact for Price"}</span>
                </div>
                <button className="btn-outline">View Matching Leads</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;
