/**
 * =====================================================================
 * ONE-TIME ADMIN BOOTSTRAP SCRIPT
 * =====================================================================
 *
 * এই script Cloud Functions বা website-এর অংশ না। এটা তোমার নিজের
 * computer থেকে Node দিয়ে ম্যানুয়ালি একবার (বা প্রয়োজনমতো) চালানোর জন্য।
 * এটা সরাসরি Firebase Admin SDK দিয়ে service account key ব্যবহার করে
 * একজন Firebase Auth user-কে "admin" custom claim দেয় — এর জন্য কোনো
 * deployed Cloud Function-এর দরকার নেই, কারণ service account key নিজেই
 * পূর্ণ admin privilege বহন করে।
 *
 * চালানোর আগে যা লাগবে:
 *   1. Firebase Console -> Project Settings -> Service Accounts ->
 *      "Generate new private key" চেপে একটা .json file download করা।
 *   2. সেই file-টা এই script-এর পাশে
 *      (project root/scripts/serviceAccountKey.json) রাখা, অথবা
 *      GOOGLE_APPLICATION_CREDENTIALS environment variable-এ তার path
 *      বসানো।
 *   3. root folder-এ firebase-admin package install থাকা আবশ্যক
 *      (npm install firebase-admin)।
 *
 * IMPORTANT SECURITY NOTE:
 *   serviceAccountKey.json ফাইলটা কখনো git-এ commit করবে না, কখনো
 *   কাউকে শেয়ার করবে না। এই file যার কাছে থাকবে সে তোমার পুরো Firebase
 *   project-এর সম্পূর্ণ admin access পেয়ে যাবে। কাজ শেষে চাইলে এই file
 *   delete করে দিতে পারো এবং প্রয়োজনে আবার নতুন key generate করতে পারো।
 *
 * ব্যবহার (terminal থেকে):
 *   node scripts/bootstrap-admin.cjs someone@example.com
 *
 * এই command চালালে:
 *   - প্রথমে সেই email দিয়ে Firebase Auth-এ user খুঁজবে
 *   - user পাওয়া গেলে তাকে { admin: true } custom claim দেবে
 *   - user-কে অবশ্যই আগে একবার সেই email দিয়ে normal login (register)
 *     করা থাকতে হবে, তবেই এই script তাকে খুঁজে পাবে এবং admin বানাতে
 *     পারবে
 *
 * =====================================================================
 */

const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const path = require("path");
const fs = require("fs");

function loadServiceAccount() {
  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const defaultPath = path.join(__dirname, "serviceAccountKey.json");

  const keyPath = envPath && fs.existsSync(envPath) ? envPath : defaultPath;

  if (!fs.existsSync(keyPath)) {
    console.error("");
    console.error("❌ Service account key file পাওয়া যায়নি।");
    console.error("");
    console.error("এইটার মধ্যে যেকোনো একটা করো:");
    console.error(
      `   1. Firebase Console থেকে service account key download করে এই path-এ রাখো:\n      ${defaultPath}`
    );
    console.error(
      "   2. অথবা GOOGLE_APPLICATION_CREDENTIALS environment variable-এ key file-এর সঠিক path বসাও।"
    );
    console.error("");
    process.exit(1);
  }

  return require(keyPath);
}

async function main() {
  const email = process.argv[2];
  const revokeFlag = process.argv[3] === "--revoke";

  if (!email) {
    console.error("");
    console.error("❌ Email address দাওনি।");
    console.error("");
    console.error("সঠিক ব্যবহার:");
    console.error("   node scripts/bootstrap-admin.cjs someone@example.com");
    console.error("");
    console.error("Admin access সরিয়ে নিতে চাইলে:");
    console.error("   node scripts/bootstrap-admin.cjs someone@example.com --revoke");
    console.error("");
    process.exit(1);
  }

  const serviceAccount = loadServiceAccount();

  const app = initializeApp({
    credential: cert(serviceAccount),
  });

  const auth = getAuth(app);

  console.log(`\nEmail দিয়ে user খোঁজা হচ্ছে: ${email} ...`);

  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(email);
  } catch (error) {
    console.error("");
    console.error(`❌ এই email দিয়ে কোনো Firebase Auth user পাওয়া যায়নি: ${email}`);
    console.error(
      "   নিশ্চিত করো যে এই email দিয়ে অ্যাপে অন্তত একবার register/login করা হয়েছে।"
    );
    console.error("");
    console.error(`Error details: ${error.message}`);
    process.exit(1);
  }

  const existingClaims = userRecord.customClaims || {};
  const newAdminValue = !revokeFlag;

  await auth.setCustomUserClaims(userRecord.uid, {
    ...existingClaims,
    admin: newAdminValue,
  });

  console.log("");
  console.log("✅ সফল হয়েছে।");
  console.log(`   User UID: ${userRecord.uid}`);
  console.log(`   Email:    ${userRecord.email}`);
  console.log(`   Admin:    ${newAdminValue}`);
  console.log("");
  console.log(
    "⚠️  গুরুত্বপূর্ণ: এই user যদি অ্যাপে আগে থেকে login করা থাকে, তাহলে তাকে"
  );
  console.log(
    "   একবার logout করে আবার login করতে হবে — তবেই নতুন admin claim তার"
  );
  console.log("   ID token-এ যুক্ত হবে এবং Admin Panel access করতে পারবে।");
  console.log("");

  process.exit(0);
}

main().catch((error) => {
  console.error("");
  console.error("❌ অপ্রত্যাশিত error হয়েছে:");
  console.error(error);
  process.exit(1);
});