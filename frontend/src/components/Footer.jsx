import React from "react";

function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#f0f0f0",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <p>&copy; {new Date().getFullYear()} Algo Arena. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
