import * as React from "react";
export function Card(props: { variant?: "card"|"card2"; className?: string; children: React.ReactNode; }) {
  const cls = props.variant === "card2" ? "io-card2" : "io-card";
  return <div className={cls + (props.className ? (" " + props.className) : "")}>{props.children}</div>;
}