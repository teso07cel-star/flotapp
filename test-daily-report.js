
const { getDailyReport } = require("./src/lib/actions");

async function test() {
  console.log("Testing getDailyReport with valid date...");
  const res1 = await getDailyReport("2024-03-22");
  console.log("Result 1 (Success?):", res1.success);
  if (!res1.success) console.log("Error 1:", res1.error);

  console.log("\nTesting getDailyReport with invalid date...");
  const res2 = await getDailyReport("not-a-date");
  console.log("Result 2 (Success?):", res2.success);
  console.log("Error 2:", res2.error);

  console.log("\nTesting getDailyReport with empty string...");
  const res3 = await getDailyReport("");
  console.log("Result 3 (Success?):", res3.success);
  // Default date (today) might depend on system, but should be success
}

// Since this is a Next.js server action file using "use server" and ESM, 
// running it directly with node might be tricky if it has imports like @/lib/prisma.
// I'll try to run it using a temporary script that handles ESM if possible, 
// or I'll just rely on `npm run build` if that's easier.
