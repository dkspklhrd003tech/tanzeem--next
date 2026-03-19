
async function debugSaveFull() {
    try {
        console.log("Starting full debug save script...");
        
        // 1. Login
        const loginRes = await fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "tanzeem@dmin", password: "admin123" })
        });
        
        if (!loginRes.ok) {
            console.error("Login failed:", await loginRes.text());
            return;
        }
        
        const cookie = loginRes.headers.get("set-cookie");

        // 2. Fetch current settings to get a full object
        const getRes = await fetch("http://localhost:3000/api/settings");
        const getData = await getRes.json();
        
        // Flatten as SettingsManager does
        const settings = {};
        Object.values(getData.settings).forEach(group => {
            Object.entries(group).forEach(([k, v]) => {
                settings[k] = v;
            });
        });

        console.log("Sending settings object with " + Object.keys(settings).length + " keys");

        // 3. Perform PUT request
        const putRes = await fetch("http://localhost:3000/api/settings", {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Cookie": cookie || ""
            },
            body: JSON.stringify(settings)
        });

        console.log("PUT status:", putRes.status);
        const putData = await putRes.json().catch(() => ({}));
        console.log("PUT response body:", JSON.stringify(putData, null, 2));

    } catch (error) {
        console.error("Script error:", error);
    }
}

debugSaveFull();
