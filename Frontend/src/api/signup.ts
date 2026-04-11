<<<<<<< HEAD
export const signup = async (
  name: string,
  lastName: string,
  email: string,
  password: string,
) => {
  try {
    const res = await fetch("http://study-buddies.me/api/signup", {
=======
import { buildApiUrl } from "./config";

export const signup = async (name: string, lastName: string, email: string, password: string) => {
  try {
    const res = await fetch(buildApiUrl("/api/signup"), {
>>>>>>> 78d47d01b7909a97f5f4c31ef167ca8eb0afc4a6
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        lastName: lastName,
        email: email,
        password: password,
      }),
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    return data;
  } catch (err) {
    console.error(err);
    return { error: "Server error" };
  }
};
