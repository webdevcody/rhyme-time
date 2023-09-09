import { SignInButton, SignOutButton } from "@clerk/clerk-react";
import { Link } from "@remix-run/react";
import { Authenticated, Unauthenticated } from "convex/react";

export function Header() {
  return (
    <div className="bg-gray-950">
      <div className="flex justify-between items-center container mx-auto p-4">
        <div>LOGO</div>

        <div className="flex gap-4">
          <Link to={"/"}>IMAGES</Link>
          <Link to={"/rooms"}>YOUR ROOMS</Link>
        </div>

        <div>
          <Authenticated>
            <SignOutButton />
          </Authenticated>
          <Unauthenticated>
            <SignInButton mode="modal" />
          </Unauthenticated>
        </div>
      </div>
    </div>
  );
}
