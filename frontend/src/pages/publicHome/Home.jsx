import React from "react";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import PublicHome from "../publicHome/PublicHome.jsx";
import UserHome from "../UserHome/userHome.jsx";

export default function Home() {
  const { user } = useContext(AuthContext);

  return user ? <UserHome /> : <PublicHome />;
}