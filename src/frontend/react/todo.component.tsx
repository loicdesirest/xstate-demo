import React from "react";
import { useSelector } from "@xstate/react";
import { todoMachine } from "../../todos/todo/todo.machine";
import { ActorRefFrom } from "xstate";

export const Todo: React.FC<{
  todoRef: ActorRefFrom<typeof todoMachine>;
}> = ({ todoRef }) => {
  const state = useSelector(todoRef, (s) => s);
  const { label } = state.context;

  return (
    <div
      style={{
        opacity: state.matches({ UPDATE: "SAVING" }) ? 0.5 : 1,
      }}
    >
      <div>
        <strong>{label}</strong>
        <form
          className="todoForm"
          hidden={!state.hasTag("form")}
          onSubmit={(event) => {
            event.preventDefault();

            todoRef.send({ type: "Save todo" });
          }}
        >
          <label className="field" htmlFor="todo.label">
            <div className="label">Label</div>
            <input
              type="text"
              id="todo.label"
              value={state.context.label}
              onChange={(event) => {
                todoRef.send({
                  type: "Update label",
                  label: event.target.value,
                });
              }}
            />
          </label>
        </form>
      </div>
      <div className="actionsCell">
        <div className="actions">
          {state.hasTag("form") && (
            <>
              <button
                disabled={state.hasTag("saving")}
                onClick={() => {
                  todoRef.send({ type: "Save todo" });
                }}
              >
                Save
              </button>
              <button
                onClick={() => todoRef.send({ type: "Cancel" })}
                type="button"
              >
                Cancel
              </button>
            </>
          )}
          {state.hasTag("read") && (
            <>
              <button onClick={() => todoRef.send({ type: "Edit todo" })}>
                Edit
              </button>
              <button
                className="remove"
                onClick={() => todoRef.send({ type: "Delete todo" })}
              >
                Remove
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
