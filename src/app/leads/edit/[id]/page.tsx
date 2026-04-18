"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { leadAutomationService } from "@/lib/lead-automation";
import { metadataService, Metadata } from "@/lib/metadata-service";

export default function EditLead({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [metadata, setMetadata] = useState<Metadata>({ propertyTypes: [], leadSources: [] });
  const [form, setForm] = useState({
    name: "", phone: "", budget: "", location: "", propertyType: "", source: "", notes: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meta, leadData] = await Promise.all([
          metadataService.getMetadata(),
          leadAutomationService.getLead(id)
        ]);
        
        setMetadata(meta);
        if (leadData) {
          setForm({
            name: leadData.name || "",
            phone: leadData.phone || "",
            budget: leadData.budget || "",
            location: leadData.location || "",
            propertyType: leadData.propertyType || "",
            source: leadData.source || "",
            notes: leadData.notes || "",
          });
        } else {
          alert("Lead not found");
          router.push("/leads");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      alert("Please fill in Name and Phone number");
      return;
    }

    try {
      setSaving(true);
      await leadAutomationService.updateLead(id, {
        name: form.name,
        phone: form.phone,
        budget: form.budget,
        location: form.location,
        propertyType: form.propertyType,
        source: form.source as any,
        notes: form.notes,
      });
      router.push("/leads");
    } catch (error) {
      console.error("Error updating lead:", error);
      alert("Failed to update lead. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: "name",   label: "Full Name",       type: "text",   placeholder: "e.g. Ramesh Pawar" },
    { key: "phone",  label: "Mobile Number",   type: "tel",    placeholder: "+91 98765 00000" },
    { key: "budget", label: "Budget Range",    type: "text",   placeholder: "e.g. ₹75L - 1Cr" },
    { key: "location",   label: "Area Preference", type: "text",   placeholder: "e.g. Baner, Wakad" },
  ];

  if (loading) {
    return (
      <div className="mobile-view">
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 size={32} className="animate-spin text-gold" />
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-view">
      <div className="app-bar">
        <div className="app-bar-content">
          <button className="icon-btn-transparent" onClick={() => router.back()}>
            <ArrowLeft size={24} />
          </button>
          <h1 className="native-title">Edit Lead</h1>
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
              value={form.propertyType}
              onChange={e => setForm(prev => ({ ...prev, propertyType: e.target.value }))}
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

          <button type="submit" className="submit-btn" disabled={saving}>
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {saving ? "Updating..." : "Update Lead"}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
