import * as msal from "@azure/msal-browser";

const msalConfig = {
    auth: {
        clientId: "a63cffb4-a20c-48df-b433-a9acb0c94a3e",
        authority: "https://login.microsoftonline.com/e301f0d0-7bca-4922-a781-253924f32cf7",
        redirectUri: "https://app-backend-rob2nleooqzme.azurewebsites.net/"
        // redirectUri: "http://localhost:50505/"
    }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

export { msalInstance };
