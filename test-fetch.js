import { createClient } from '@insforge/sdk';

// Override global fetch to see what URL is being requested
const originalFetch = global.fetch;
global.fetch = async (url, options) => {
    console.log("FETCH URL:", url);
    console.log("FETCH METHOD:", options?.method);
    return {
        ok: false,
        status: 404,
        json: async () => ({})
    };
};

const INSFORGE_URL = 'https://5bty5v8t.us-east.insforge.app';
const INSFORGE_ANON_KEY = 'ik_758260fa386bc6109910af1e4c0c1a4a';

const insforge = createClient({
    baseUrl: INSFORGE_URL,
    anonKey: INSFORGE_ANON_KEY,
});

async function run() {
    const payload = { test: 123 };

    console.log("--- TEST 1: ARRAY WITHOUT SELECT ---");
    try { await insforge.database.from('table').insert([payload]); } catch (e) { }

    console.log("--- TEST 2: OBJECT WITHOUT SELECT ---");
    try { await insforge.database.from('table').insert(payload); } catch (e) { }

    console.log("--- TEST 3: ARRAY WITH SELECT ---");
    try { await insforge.database.from('table').insert([payload]).select(); } catch (e) { }
}

run();
