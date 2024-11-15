"use client"; // This ensures it's a client component

import { ReactNode } from "react";
import { store } from "@/store";
import { Provider } from "react-redux";
import ThemeProvider from "./ThemeProvider";

export default function Wrapper({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider>{children}</ThemeProvider>
    </Provider>
  );
}
