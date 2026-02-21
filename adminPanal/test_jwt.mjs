// Test script: Login and decode JWT
const API = 'http://localhost:5001/api';

// Try multiple passwords
const passwords = ['admin123', 'Admin123', 'Admin@123', 'password', 'Password123', '123456', 'admin', 'test123', 'Admin123!'];

async function tryLogin(email, password) {
    try {
        const res = await fetch(`${API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            return { success: true, data };
        }
        return { success: false, status: res.status, message: data.message };
    } catch (e) {
        return { success: false, error: e.message };
    }
}

function decodeJWT(token) {
    const parts = token.split('.');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    return payload;
}

async function main() {
    console.log('=== Testing Login with admin@test.com ===\n');

    for (const pwd of passwords) {
        const result = await tryLogin('admin@test.com', pwd);
        if (result.success) {
            console.log(`✅ Password found: "${pwd}"`);
            console.log('\n=== Login Response ===');
            console.log(JSON.stringify(result.data, null, 2));

            console.log('\n=== Decoded JWT Payload ===');
            const payload = decodeJWT(result.data.token);
            console.log(JSON.stringify(payload, null, 2));

            // Test admin endpoint
            console.log('\n=== Testing Admin Dashboard ===');
            const adminRes = await fetch(`${API}/admin/dashboard`, {
                headers: { 'Authorization': `Bearer ${result.data.token}` }
            });
            console.log(`Status: ${adminRes.status} ${adminRes.statusText}`);
            if (adminRes.ok) {
                const adminData = await adminRes.json();
                console.log(JSON.stringify(adminData, null, 2).substring(0, 500));
            } else {
                const errData = await adminRes.text();
                console.log('Error:', errData.substring(0, 300));
            }
            return;
        } else {
            console.log(`❌ "${pwd}" - ${result.message || result.error}`);
        }
    }

    console.log('\n⚠️ None of the test passwords worked.');
    console.log('Let me try provider and consumer accounts...\n');

    for (const pwd of passwords) {
        const result = await tryLogin('provider@test.com', pwd);
        if (result.success) {
            console.log(`✅ Provider password: "${pwd}"`);
            const payload = decodeJWT(result.data.token);
            console.log('JWT Payload:', JSON.stringify(payload, null, 2));

            // Now test admin endpoint with this token
            console.log('\n=== Testing Admin Dashboard with provider token ===');
            const adminRes = await fetch(`${API}/admin/dashboard`, {
                headers: { 'Authorization': `Bearer ${result.data.token}` }
            });
            console.log(`Status: ${adminRes.status}`);
            return;
        }
    }

    for (const pwd of passwords) {
        const result = await tryLogin('user@test.com', pwd);
        if (result.success) {
            console.log(`✅ User password: "${pwd}"`);
            const payload = decodeJWT(result.data.token);
            console.log('JWT Payload:', JSON.stringify(payload, null, 2));
            return;
        }
    }

    console.log('Could not login with any test account');
}

main().catch(console.error);
