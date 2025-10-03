import Navbar from "./Navbar";
import { useEffect, useState, useContext } from "react";
import { getUsers, deleteUser, updateUserRole } from "../services/apis";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard({ notifications, setNotifications }) {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    if (user?.role !== "ADMIN") return;

    try {
      const res = await getUsers();
      setUsers(res.data.data);  
    } catch (err) {
      console.error(err.response?.data || err);
      setError(err.response?.data?.message || "Failed to fetch users");
    }
  };
console.log("notificatoin",notifications)
  useEffect(() => {
    fetchUsers();
  }, [user]);

   
  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  
  const handleRoleUpdate = async (id, newRole) => {
    try {
      await updateUserRole(id, newRole);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, role: newRole } : u
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update role");
    }
  };

  return (
    <div>
      {/* <Navbar /> */}
       <Navbar notifications={notifications} setNotifications={setNotifications} />
      <h2>Users List</h2>
      {user?.role !== "ADMIN" && <p>You do not have access to view users.</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {user?.role === "ADMIN" && (
        <ul>
          {users.map((u) => (
            <li key={u.id}>
              {u.name} ({u.email}) - {u.role}{" "}
              <button onClick={() => handleDelete(u.id)}>Delete</button>
              <button
                onClick={() =>
                  handleRoleUpdate(u.id, u.role === "USER" ? "ADMIN" : "USER")
                }
              >
                Make {u.role === "USER" ? "Admin" : "User"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
