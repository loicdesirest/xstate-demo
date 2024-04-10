import { TodosActor } from "../../todos/todos.machine";
import "./todos.css";
import "./index.css";

import { Todo } from "./todo.component";
import { useSyncExternalStore } from "react";

function App({ todosActor }: { todosActor: TodosActor }) {
  const todos = useSyncExternalStore(
    (listener) => todosActor.subscribe(listener).unsubscribe,
    () => todosActor.getSnapshot()
  );

  if (todos.matches("DISABLED")) {
    return (
      <button
        className="toggle"
        onClick={() => {
          todosActor.send({ type: "Enable" });
        }}
      >
        ENABLE
      </button>
    );
  }

  return (
    <div className="app">
      <h2>Todos</h2>
      <form
        className="newTodo"
        onSubmit={(event) => {
          event.preventDefault();
          todosActor.send({
            type: "Add a todo",
          });
        }}
      >
        <input
          value={todos.context.newTodoLabel}
          onChange={(event) =>
            todosActor.send({
              type: "Update new todo's label",
              label: event.target.value,
            })
          }
          placeholder="New todo"
        />
        <button>Add todo</button>
      </form>
      <div className="todosTable">
        {todos.context.todos.map((todo) => {
          return <Todo key={todo.id} todoRef={todo} />;
        })}
      </div>
      <button
        className="toggle"
        onClick={() => {
          todosActor.send({ type: "Disable" });
        }}
      >
        DISABLE
      </button>
    </div>
  );
}

export default App;
