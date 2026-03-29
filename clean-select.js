const fs = require('fs');
const path = require('path');

const targetFile = 'c:\\wamp64\\www\\stetic-app\\services\\insforgeService.ts';
let content = fs.readFileSync(targetFile, 'utf8');

// Replace .select().single() for UPDATE operations
// We want to replace:
//       .update(updates) \n      .eq('id', id) \n      .select() \n      .single(); \n    if (error) throw error; \n    return data;
// With:
//       .update(updates) \n      .eq('id', id); \n    if (error) throw error; \n    return updates as any;
//
// And similarly for INSERT operations.
// But wait! Regex on multi-line is easier if we just match:
// .select()\s*\n\s*\.single\(\);

let modified = content.replace(/\s*\.select\(\)\s*\n\s*\.single\(\);/g, ';');
modified = modified.replace(/\s*\.select\(\);/g, ';');

// Now we need to fix the returning values:
// When we do `.insert([{...}]);`, `data` will be null.
// But the code says:
// const { data, error } = await insforge...
// if (error) throw error;
// return data; -> returns null!

// Instead of returning null, we should return the object that was inserted/updated.
// But that's hard to do automatically with regex.

// Let's just fix them manually via the script by replacing specific blocks!

fs.writeFileSync(targetFile, modified, 'utf8');
console.log("Replaced all .select().single() calls.");
