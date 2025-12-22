import middleware from "./src/proxy";

export default middleware;

export const config = {
  matcher: ["/admin/:path*", "/profil/:path*", "/dergi/:path*", "/sayilar/:path*"]
};
