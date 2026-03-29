import fs from 'fs';
import path from 'path';

const url = 'https://5bty5v8t.us-east.insforge.app/rest/v1/stetic_businesses';
const apiKey = 'ik_758260fa386bc6109910af1e4c0c1a4a';

const mockNames = [
  "Barbershop Central",
  "Glamour Spa",
  "Nail Boutique",
  "Estudio Belleza",
  "Estética Avanzada",
  "Centro de Masajes Zen",
  "Lash & Brow Studio",
  "Clínica Dermatológica Skin Care",
  "Peluquería Kids",
  "Barbería Vintage Clasicc"
];

async function clean() {
  console.log("Fetching businesses...");
  try {
    const res = await fetch(`${url}?select=id,name`, {
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) {
      console.error("Failed to fetch:", await res.text());
      return;
    }
    
    const businesses = await res.json();
    console.log(`Found ${businesses.length} total businesses.`);
    
    const mocks = businesses.filter(b => mockNames.includes(b.name));
    console.log(`Found ${mocks.length} mock businesses to delete.`);
    
    for (const b of mocks) {
      console.log(`Deleting ${b.name} (${b.id})...`);
      const delRes = await fetch(`${url}?id=eq.${b.id}`, {
        method: 'DELETE',
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      if (!delRes.ok) {
        console.error(`Failed to delete ${b.name}:`, await delRes.text());
      } else {
        console.log(`Successfully deleted ${b.name}`);
      }
    }
    
    console.log("Cleanup complete!");
  } catch (err) {
    console.error("Error:", err);
  }
}

clean();
