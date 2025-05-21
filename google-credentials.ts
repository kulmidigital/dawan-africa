// google-credentials.ts

export const googleCredentials = {
  applicationType: process.env.GOOGLE_APPLICATION_TYPE,
  projectId: process.env.GOOGLE_PROJECT_ID,
  privateKeyId: process.env.GOOGLE_PRIVATE_KEY_ID,
  privateKey: process.env.GOOGLE_PRIVATE_KEY,
  clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
  clientId: process.env.GOOGLE_CLIENT_ID,
  authUri: process.env.GOOGLE_AUTH_URI,
  tokenUri: process.env.GOOGLE_TOKEN_URI,
  authProviderX509CertUrl: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
  clientX509CertUrl: process.env.GOOGLE_CLIENT_X509_CERT_URL,
  universeDomain: process.env.GOOGLE_UNIVERSE_DOMAIN,
}
