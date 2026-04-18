import { db } from "./firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

export interface Metadata {
  propertyTypes: string[];
  leadSources: string[];
}

const DEFAULT_METADATA: Metadata = {
  propertyTypes: ["1BHK", "2BHK", "3BHK", "Villa", "Plot", "Commercial"],
  leadSources: ["WhatsApp", "Facebook Ads", "Google Ads", "Website", "Referral", "Walk-in", "IVR / Phone Call"]
};

const METADATA_DOC_ID = "app_settings";
const METADATA_COLLECTION = "metadata";

class MetadataService {
  private get docRef() {
    return doc(db, METADATA_COLLECTION, METADATA_DOC_ID);
  }

  async getMetadata(): Promise<Metadata> {
    if (!db) return DEFAULT_METADATA;
    try {
      const snap = await getDoc(this.docRef);
      if (snap.exists()) {
        return snap.data() as Metadata;
      } else {
        // Initialize with defaults if not exists
        const data = DEFAULT_METADATA;
        await setDoc(this.docRef, data);
        return data;
      }
    } catch (error) {
      console.error("Error fetching metadata:", error);
      return DEFAULT_METADATA;
    }
  }

  async updateMetadata(data: Partial<Metadata>): Promise<void> {
    if (!db) return;
    try {
      // Use a fresh reference and simple update
      await setDoc(this.docRef, data, { merge: true });
    } catch (error) {
      console.error("Error updating metadata:", error);
      throw error;
    }
  }

  subscribe(callback: (data: Metadata) => void) {
    if (!db) return () => {};
    
    // Use a fresh reference for the listener
    return onSnapshot(this.docRef, (snap) => {
      if (snap.exists()) {
        callback(snap.data() as Metadata);
      } else {
        callback(DEFAULT_METADATA);
      }
    }, (error) => {
      console.error("Metadata subscription error:", error);
    });
  }
}

export const metadataService = new MetadataService();
