document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:5009/Auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();

        if (result.statusCode === 200) {
            localStorage.setItem('token', result.token);
            window.location.href = '/Frontend/ManageAsset.html'; 
        } else {
            alert(result.message);
        }
    } catch (error) {
        document.getElementById('message').innerText = 'An error occurred. Please try again.';
        console.error('Error:', error);
    }
});
