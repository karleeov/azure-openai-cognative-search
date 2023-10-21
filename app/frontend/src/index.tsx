import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route, createHashRouter, RouterProvider } from "react-router-dom";
import { initializeIcons } from "@fluentui/react";

import "./index.css";

import Layout from "./pages/layout/Layout";
import AADAuth from "./pages/aadauth/AADAuth";
import NoPage from "./pages/NoPage";
import OneShot from "./pages/oneshot/OneShot";
import Chat from "./pages/chat/Chat";

import { msalInstance } from "../services/msal";
import { MsalProvider } from "@azure/msal-react";

initializeIcons();

const router = createHashRouter([
    {
        path: "/",
        element: <Layout />,

        children: [
            {
                index: true,
                element: <AADAuth />
            },
            {
                path: "chat",
                element: <Chat />
            },
            {
                path: "qa",
                element: <OneShot />
            },
            {
                path: "*",
                element: <NoPage />
            }
        ]
    }
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <MsalProvider instance={msalInstance}>
            <RouterProvider router={router} />
        </MsalProvider>
    </React.StrictMode>
);
