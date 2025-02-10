import { clientId, Front_URL, Auth_URL, Logout_URL } from './config.js'

async function generateCodeVerifier()
{
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

async function generateCodeChallenge(codeVerifier)
{
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return btoa(String.fromCharCode(...hashArray))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

document.getElementById('loginButton').addEventListener('click', async () =>
{
    const state = crypto.randomUUID();
    localStorage.setItem("state", state);

    const codeVerifier = await generateCodeVerifier();
    localStorage.setItem("code_verifier", codeVerifier);

    const codeChallenge = await generateCodeChallenge(codeVerifier);

    const url = new URL(`${Auth_URL}`);

    const searchParams = url.searchParams;
    searchParams.append("response_type", "code");
    searchParams.append("client_id", `${clientId}`);
    searchParams.append("scope", "openid profile");
    searchParams.append("redirect_uri", `${Front_URL}/Frontend/Callback.html`);
    searchParams.append("state", state);
    searchParams.append("code_challenge", codeChallenge);
    searchParams.append("code_challenge_method", "S256")

    window.location.href = url.toString();
});

document.getElementById('logoutButton').addEventListener('click', () =>
{
    localStorage.removeItem('token');
    localStorage.removeItem('state');
    localStorage.removeItem('code_verifier');

    const url = new URL(`${Logout_URL}`);

    const searchParams = url.searchParams;
    searchParams.append("redirect_uri", `${Front_URL}/Frontend/login.html`);

    window.location.href = url.toString();
});