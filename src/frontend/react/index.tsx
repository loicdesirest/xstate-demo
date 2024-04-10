import { createRoot } from "react-dom/client";
import React from "react";
import App from "./todos.component.tsx";
import { TodosActor } from "../../todos/todos.machine.ts";

export const renderReactApp = (element: HTMLElement, actor: TodosActor) =>
  createRoot(element).render(
    <React.StrictMode>
      <App todosActor={actor} />
    </React.StrictMode>
  );
