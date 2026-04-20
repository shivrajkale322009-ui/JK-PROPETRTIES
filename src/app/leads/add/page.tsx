"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { metadataService, Metadata } from "@/lib/metadata-service";

export default function AddLead() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<Metadata>({ propertyTypes: [], leadSources: [] });
  const [form, setForm] = useState({
    name: "", phone: "", budget: "", location: "", type: "", source: "", notes: "",
  });

  useEffect(() => {
    metadataService.getMetadata().then(setMetadata);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      alert("Please fill in Name and Phone number");
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, "leads"), {
        name: form.name,
        phone: form.phone,
        budget: form.budget,
        location: form.location,
        propertyType: form.type,
        source: form.source,
        notes: form.notes,
        status: "New Lead",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      router.push("/leads");
    } catch (error) {
      console.error("Error saving lead:", error);
      alert("Failed to save lead. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "name",   label: "Full Name",       type: "text",   placeholder: "e.g. Ramesh Pawar" },
    { key: "phone",  label: "Mobile Number",   type: "tel",    placeholder: "+91 98765 00000" },
    { key: "budget", label: "Budget Range",    type: "text",   placeholder: "e.g. ₹75L - 1Cr" },
    { key: "location",   label: "Area Preference", type: "text",   placeholder: "e.g. Baner, Wakad" },
  ];

  return (
    <div className="mobile-view">
      <div className="app-bar">
        <div className="app-bar-content">
          <button className="icon-btn-transparent" onClick={() => router.back()}>
            <ArrowLeft size={24} />
          </button>
          <h1 className="native-title">Add New Lead</h1>
          <div style={{ width: 40 }} />
        </div>
      </div>

      <div className="content-area">
        <motion.form
          onSubmit={handleSubmit}
          className="add-lead-form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {fields.map((field) => (
            <div className="native-input-group" key={field.key}>
              <label>{field.label}</label>
              <input
                className="native-input"
                type={field.type}
                placeholder={field.placeholder}
                value={(form as any)[field.key]}
                onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
              />
            </div>
          ))}

          <div className="native-input-group">
            <label>Property Type</label>
            <select
              className="native-select"
              value={form.type}
              onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="">Select type...</option>
              {metadata.propertyTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="native-input-group">
            <label>Lead Source</label>
            <select
              className="native-select"
              value={form.source}
              onChange={e => setForm(prev => ({ ...prev, source: e.target.value }))}
            >
              <option value="">Select source...</option>
              {metadata.leadSources.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>

          <div className="native-input-group">
            <label>Initial Notes</label>
            <textarea
              className="native-input"
              placeholder="Any specific requirements or remarks..."
              rows={3}
              value={form.notes}
              onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
              style={{ resize: "none" }}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? <Loader2 size={20} className="animate-spin" /> : <UserPlus size={20} />}
            {loading ? "Saving..." : "Save Lead"}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
