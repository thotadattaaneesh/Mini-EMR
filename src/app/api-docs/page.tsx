"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiDocs() {
  return (
    <div style={{ padding: "2rem", backgroundColor: "white", minHeight: "100vh" }}>
      <SwaggerUI url="/swagger.json" />
    </div>
  );
}
