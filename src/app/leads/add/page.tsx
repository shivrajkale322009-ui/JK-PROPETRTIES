"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus } from "lucide-react";
import { motion } from "framer-motion";

export default function AddLead() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", phone: "", budget: "", area: "", type: "", source: "", notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save to Firebase
    router.push("/leads");
  };

  const fields = [
    { key: "name",   label: "Full Name",       type: "text",   placeholder: "e.g. Ramesh Pawar" },
    { key: "phone",  label: "Mobile Number",   type: "tel",    placeholder: "+91 98765 00000" },
    { key: "budget", label: "Budget Range",    type: "text",   placeholder: "e.g. ₹75L - 1Cr" },
    { key: "area",   label: "Area Preference", type: "text",   placeholder: "e.g. Baner, Wakad" },
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
              <option>1BHK</option>
              <option>2BHK</option>
              <option>3BHK</option>
              <option>Villa</option>
              <option>Plot</option>
              <option>Commercial</option>
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
              <option>WhatsApp</option>
              <option>Facebook Ads</option>
              <option>Google Ads</option>
              <option>Website</option>
              <option>Referral</option>
              <option>Walk-in</option>
              <option>IVR / Phone Call</option>
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

          <button type="submit" className="submit-btn">
            <UserPlus size={20} />
            Save Lead
          </button>
        </motion.form>
      </div>
    </div>
  );
}
