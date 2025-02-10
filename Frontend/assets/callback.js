import { clientId, API_URL, Front_URL, Token_URL } from './config.js';
(async () =>
{
    try
    {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const returnedState = urlParams.get("state");

        const storedState = localStorage.getItem("state");
        if (returnedState !== storedState)
        {
            window.location.href = "/Frontend/Notmatchpage.html"
        }

        const codeVerifier = localStorage.getItem("code_verifier");
        const params = new URLSearchParams();
        params.append("client_id", `${clientId}`);
        params.append("grant_type", "authorization_code");
        params.append("code", code);
        params.append("redirect_uri", `${Front_URL}/Frontend/Callback.html`);
        params.append("code_verifier", codeVerifier)

        const accessResponse = await fetch(
            `${Token_URL}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: params,
            }
        );

        const accessData = await accessResponse.json();
        localStorage.setItem("token", accessData.access_token);

        const tokenResponse = await fetch(
            `${API_URL}/Auth/UpsertUser`, {
            headers: {
                'Authorization': `Bearer ${accessData.access_token}`,
            }
        });
        if (tokenResponse.status == 200)
        {
            window.location.href = "/Frontend/ManageAsset.html";
        } else
        {
            alert(result.message);
        }
    } catch (error)
    {
        console.error("Error :", error);
    }
})();