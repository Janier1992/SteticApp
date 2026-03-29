import { createClient } from '@insforge/sdk';

const INSFORGE_URL = 'https://5bty5v8t.us-east.insforge.app';
const INSFORGE_KEY = 'ik_758260fa386bc6109910af1e4c0c1a4a';

const insforge = createClient({
  baseUrl: INSFORGE_URL,
  anonKey: INSFORGE_KEY,
});

async function run() {
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

  try {
    console.log("Fetching businesses...");
    const { data, error } = await insforge.database.from('stetic_businesses').select('*');
    if (error) {
      console.error("Fetch error:", error);
      return;
    }
    
    if (!data) {
      console.log("No data returned");
      return;
    }

    const mocks = data.filter((d: any) => mockNames.includes(d.name));
    console.log(`Found ${mocks.length} mock businesses out of ${data.length} total.`);

    for (const mock of mocks) {
      console.log(`Deleting: ${mock.name} (${mock.id})`);
      const { error: delErr } = await insforge.database.from('stetic_businesses').delete().eq('id', mock.id);
      if (delErr) {
        console.error("Delete error for", mock.name, delErr);
      }
    }
    console.log("Cleanup complete");
  } catch (err) {
    console.error("Exception:", err);
  }
}

run();
