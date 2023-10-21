import { useNavigate } from "react-router-dom";

import { useState } from "react";

import { User, getUserInfo } from "../../api";

import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";

const AADAuth = () => {
    const [email, setEmail] = useState<string>("");

    const navigate = useNavigate();

    const startChat = async () => {
        const userinfo = await getUserInfo(email);
        const parseduserinfo = JSON.parse(JSON.stringify(userinfo));
        if (userinfo != null) {
            navigate("/chat", { state: { tokenlimit: parseduserinfo.tokenlimit, usedtoken: parseduserinfo.usedtoken } });
        }
    };

    function SignInButton() {
        // useMsal hook will return the PublicClientApplication instance you provided to MsalProvider
        const { instance } = useMsal();
        setEmail(instance.getAccountByUsername.name);
        return <button onClick={() => instance.loginRedirect()}>Sign In</button>;
    }

    function SignOutButton() {
        const { instance } = useMsal();

        return <button onClick={() => instance.logoutRedirect()}>Sign Out</button>;
    }

    function StartChatButton() {
        return <button onClick={() => startChat()}>Start Chat</button>;
    }

    function WelcomeUser() {
        const { accounts } = useMsal();
        const username = accounts[0].username;
        setEmail(accounts[0].username);
        return <p>Welcome, {username}</p>;
    }

    return (
        <div>
            <title>Azure AD Authentication using MSAL and Next.js</title>

            <AuthenticatedTemplate>
                <p>This will only render if a user is signed-in.</p>
                <WelcomeUser />
                <StartChatButton />
                <SignOutButton />
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
                <p>This will only render if a user is not signed-in.</p>
                <SignInButton />
            </UnauthenticatedTemplate>
        </div>
    );
};

export default AADAuth;
