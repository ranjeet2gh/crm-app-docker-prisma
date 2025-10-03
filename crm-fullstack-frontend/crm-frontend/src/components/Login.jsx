
import { useContext, useState } from "react";
import { loginUser } from "../services/apis";
import { AuthContext } from "../context/AuthContext";

export default function Login({ switchPage }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await loginUser({ email, password });
      const { accessToken, refreshToken, user } = res.data.data;

      // Pass tokens and user to login function
      login(accessToken, refreshToken, user);
    } catch (err) {
      alert(err.response?.data.message,"(Login failed)");
      console.error(err.response?.data || err);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input
        type="email"
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
      <button onClick={handleLogin}>Login</button>

      <h3>OR</h3>
      
    <a href="http://localhost:3000/api/auth/google"> Login with Google</a>

      <p onClick={() => switchPage("register")}>Go to Register</p>
    </div>
  );
}
