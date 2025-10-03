
import { useState } from "react";
import { registerUser } from "../services/apis";

export default function Register({ switchPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [profilePicture, setProfilePicture] = useState(null); // new

  const handleRegister = async () => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      if (profilePicture) formData.append("profilePicture", profilePicture);

      await registerUser(formData);
      alert("Registered successfully!");
      switchPage("login");
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Registration failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setProfilePicture(e.target.files[0])}
      />
      <button onClick={handleRegister}>Register</button>
      <p onClick={() => switchPage("login")}>Go to Login</p>
    </div>
  );
}
