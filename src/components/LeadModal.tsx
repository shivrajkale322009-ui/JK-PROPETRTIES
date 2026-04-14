"use client";

import { useState } from "react";
import { X, Send } from "lucide-react";

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const LeadModal = ({ isOpen, onClose, onSubmit }: LeadModalProps) => {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    whatsapp: "",
    source: "Facebook",
    budget: "",
    location: "",
    propertyType: "Plot",
    notes: "",
    nextFollowUp: ""
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-slide">
        <div className="modal-header">
          <h2>New Lead Entry</h2>
          <button onClick={onClose} className="close-btn"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="lead-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} placeholder="John Doe" />
            </div>
            
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" />
            </div>

            <div className="form-group">
              <label>WhatsApp Number</label>
              <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="+91 98765 43210" />
            </div>

            <div className="form-group">
              <label>Lead Source</label>
              <select name="source" value={formData.source} onChange={handleChange}>
                <option value="Facebook">Facebook</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Call">Call</option>
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
              </select>
            </div>

            <div className="form-group">
              <label>Budget Range</label>
              <input type="text" name="budget" value={formData.budget} onChange={handleChange} placeholder="e.g. 20L - 30L" />
            </div>

            <div className="form-group">
              <label>Preferred Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Chimbali" />
            </div>

            <div className="form-group">
              <label>Property Type</label>
              <select name="propertyType" value={formData.propertyType} onChange={handleChange}>
                <option value="Plot">Plot</option>
                <option value="Flat">Flat</option>
                <option value="Villa">Villa</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Next Follow-up Date</label>
            <input type="date" name="nextFollowUp" value={formData.nextFollowUp} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea name="notes" rows={3} value={formData.notes} onChange={handleChange} placeholder="Enter any specific requirements..."></textarea>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">
              <Send size={16} />
              Save Lead
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default LeadModal;
