
async function debugSave() {
    try {
        console.log("Starting debug save script with email: tanzeem@dmin");
        
        // 1. Login
        const loginRes = await fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "tanzeem@dmin", password: "admin123" })
        });
        
        console.log("Login status:", loginRes.status);
        const loginData = await loginRes.json();
        console.log("Login data:", JSON.stringify(loginData));
        
        if (!loginRes.ok) {
            console.error("Login failed");
            return;
        }
        
        const cookie = loginRes.headers.get("set-cookie");
        console.log("Session Cookie obtained:", cookie ? "YES" : "NO");

        // 2. Perform PUT request
        const putRes = await fetch("http://localhost:3000/api/settings", {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Cookie": cookie || ""
            },
            body: JSON.stringify({ primary_color: "#0d5844" })
        });

        console.log("PUT status:", putRes.status);
        const putData = await putRes.json().catch(() => ({}));
        console.log("PUT response body:", JSON.stringify(putData, null, 2));

    } catch (error) {
        console.error("Script error:", error);
    }
}

debugSave();
