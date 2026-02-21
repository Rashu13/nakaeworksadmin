import fs from 'fs';

// Native fetch in Node 18+
async function debug() {
    try {
        const log = (msg) => {
            console.log(msg);
            fs.appendFileSync('debug_output.txt', msg + '\n');
        };
        fs.writeFileSync('debug_output.txt', '');

        log("Registering admin...");
        // Register temp admin
        const regResponse = await fetch('http://localhost:5001/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "DebugAdmin",
                email: "debug" + Date.now() + "@nakaeworks.com",
                password: "Password123!",
                phone: "9999999999",
                role: "admin"
            })
        });

        const regData = await regResponse.json();
        log("Registration: " + JSON.stringify(regData));

        const token = regData.token;
        if (!token) return;

        log("Fetching dashboard stats...");
        // Fetch Dashboard
        const dashResponse = await fetch('http://localhost:5001/api/admin/dashboard', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        log("Dashboard Status: " + dashResponse.status);
        const text = await dashResponse.text();
        log("Dashboard Body: " + text);

        try {
            const dashData = JSON.parse(text);
            log("Dashboard Stats RAW: " + JSON.stringify(dashData, null, 2));
        } catch (e) {
            log("Not JSON");
        }

    } catch (err) {
        console.error(err);
        fs.appendFileSync('debug_output.txt', err.toString());
    }
}

debug();
