
async function debugSaveInvalid() {
    try {
        console.log("Starting debug save with invalid data...");
        
        // 1. Login
        const loginRes = await fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "tanzeem@dmin", password: "admin123" })
        });
        
        const cookie = loginRes.headers.get("set-cookie");

        // 2. Perform PUT request with invalid color
        const putRes = await fetch("http://localhost:3000/api/settings", {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Cookie": cookie || ""
            },
            body: JSON.stringify({ primary_color: "#0d5844hello" })
        });

        console.log("PUT status:", putRes.status);
        const putData = await putRes.json().catch(() => ({}));
        console.log("PUT response body:", JSON.stringify(putData, null, 2));

    } catch (error) {
        console.error("Script error:", error);
    }
}

debugSaveInvalid();
