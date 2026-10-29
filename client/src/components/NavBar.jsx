import React from "react";
import { assets } from "../assets/icons/assets";
import { Link } from "react-router-dom";
import { useState } from "react";

const NavBar = () => {
  const [user, setUser] = useState(null);
  return (
    <div className="flex items-center justify-between py-4">
      <Link to="/">
        <img src={assets.logo} alt="" className="w-28 sm:w-32 lg:w-40" />
      </Link>
      <div>
        {user ? (
          <div></div>
        ) : (
          <div className="flex items-center gap=2 sm:gap-5">
            <p>Pricing</p>
            <button>Login</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavBar;
