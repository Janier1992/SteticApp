import { createClient } from '@insforge/sdk';

const INSFORGE_URL = 'https://5bty5v8t.us-east.insforge.app';
const INSFORGE_ANON_KEY = 'ik_758260fa386bc6109910af1e4c0c1a4a';

const insforge = createClient({
    baseUrl: INSFORGE_URL,
    anonKey: INSFORGE_ANON_KEY,
});

async function run() {
    const { data: bData } = await insforge.database.from('stetic_businesses').select('id, name').limit(1);
    const { data: sData } = await insforge.database.from('stetic_services').select('id, name').limit(1);

    if (!bData?.[0]?.id || !sData?.[0]?.id) return;

    const payload = {
        business_id: bData[0].id,
        client_id: '11111111-1111-1111-1111-111111111111',
        client_name: 'Test Test',
        client_email: 'test@insforge.app',
        service_id: sData[0].id,
        service_name: sData[0].name,
        staff_id: null,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 3600000).toISOString(),
        status: 'CONFIRMED',
        price: 0,
        deposit_amount: 0,
        risk_of_no_show: 0,
        notes: 'Test notes via API',
    };

    try {
        const { data, error } = await insforge.database.from('stetic_appointments').insert(payload);
        console.log("INSERT WITH OBJECT RESULT:");
        console.log("Data:", data);
        console.log("Error:", error);
    } catch (e) {
        console.error("Exception thrown:", e);
    }
}

run();
