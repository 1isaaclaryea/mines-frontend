import { Configuration, PopupRequest } from "@azure/msal-browser";

// MSAL Configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || "YOUR_CLIENT_ID",
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID || "YOUR_TENANT_ID"}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

// Scopes for Microsoft Graph API
// Note: Sites.Read.All is required for accessing shared files via share links
export const loginRequest: PopupRequest = {
  scopes: [
    "User.Read",
    "Files.ReadWrite.All",
    "Sites.Read.All"  // Required for /shares endpoint (share links)
  ],
};

// Additional scopes for specific operations
export const graphScopes = {
  filesReadWrite: ["Files.ReadWrite.All"],
  filesRead: ["Files.Read.All"],
  userRead: ["User.Read"],
  sharedItems: ["Sites.Read.All"],  // For accessing shared files
};
