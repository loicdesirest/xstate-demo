import { createActor } from "xstate";
import { renderReactApp } from "./react";
import { todoMachine } from "../todos/todo/todo.machine";
import { buildTodosMachine } from "../todos/todos.machine";

const reactRoot = document.getElementById("react-root")!;

export const runApp = () => {
  const todosMachine = buildTodosMachine(todoMachine);
  const todosActor = createActor(todosMachine);
  todosActor.start();

  renderReactApp(reactRoot, todosActor);
};
