// components/BootstrapClient.tsx
"use client"; // This directive marks the component as a Client Component

import { useEffect } from "react";

export default function BootstrapClient() {
  useEffect(() => {
    // Import Bootstrap's JavaScript here
    require("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return null; // This component doesn't render anything visible
}