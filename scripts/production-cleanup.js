import { InsforgeService } from './services/insforgeService';

/**
 * PRODUCTION CLEANUP SCRIPT
 * Usage: Set VITE_INSFORGE_URL and VITE_INSFORGE_ANON_KEY in your shell,
 * then run this script passing the businessId as an argument.
 */

async function runCleanup() {
    const businessId = process.argv[2];

    if (!businessId) {
        console.error('Error: Please provide a businessId as an argument.');
        console.log('Usage: node scripts/cleanup.js <businessId>');
        process.exit(1);
    }

    console.log(`Starting cleanup for business: ${businessId}...`);

    try {
        await InsforgeService.cleanupSampleData(businessId);
        console.log('✅ Cleanup completed successfully.');
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        process.exit(1);
    }
}

runCleanup();
