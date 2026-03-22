const url =
  "https://xsraxjlmbzswhpgpulai.supabase.co/rest/v1/profiles?select=*&limit=1";
const key =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzcmF4amxtYnpzd2hwZ3B1bGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NDc4MjcsImV4cCI6MjA4OTIyMzgyN30.SxIRAVcfZXL20_yjGi8D68kiIv3aeYicO8WK9MDTRgA";

async function testConnection() {
  console.log("Testing Supabase connection with fetch...");
  try {
    const res = await fetch(url, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });

    if (!res.ok) {
      console.error(
        "Connection failed with status:",
        res.status,
        await res.text(),
      );
    } else {
      const data = await res.json();
      console.log("Connection successful! Data:", data);
    }
  } catch (e) {
    console.error("Fetch failed:", e);
  }
}

testConnection();
