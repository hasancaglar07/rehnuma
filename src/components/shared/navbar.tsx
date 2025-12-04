import { getSession } from "@/lib/auth";
import { NavbarClient } from "./navbar-client";

export async function Navbar() {
  const session = await getSession();
  const user = session.user;

  return (
    <NavbarClient
      hasAuth={Boolean(user)}
      isAdmin={user?.role === "admin"}
      subscriptionStatus={user?.subscriptionStatus}
    />
  );
}
