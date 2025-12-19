import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import PublicHome from "../Home/PublicHome.jsx";
import UserHome from "../UserHome/userHome.jsx";

export default function Home() {
  const { user } = useContext(AuthContext);

  return user ? <UserHome /> : <PublicHome />;
}