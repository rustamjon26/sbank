import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const envFile = fs.readFileSync(".env", "utf-8");
const urlMatch = envFile.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const url = urlMatch ? urlMatch[1].trim() : "";
const key = keyMatch ? keyMatch[1].trim() : "";

const supabase = createClient(url, key);

async function checkUser() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .or("username.eq.User,first_name.eq.User,username.eq.user");

  if (error) {
    console.error("Error fetching user:", error);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

checkUser();
