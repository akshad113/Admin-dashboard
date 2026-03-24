const admin = require("firebase-admin");

const getPrivateKey = () => {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!privateKey) {
    return null;
  }

  return privateKey.replace(/\\n/g, "\n");
};

const initializeFirebaseAdmin = () => {
  if (admin.apps.length > 0) {
    return admin;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = getPrivateKey();

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  return admin;
};

module.exports = {
  getFirebaseAdmin: initializeFirebaseAdmin,
};
