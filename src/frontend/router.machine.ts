import { setup } from "xstate";

export const routerMachine = setup({}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QCUDyBVAKgUWQYgGUwAbMAYwBcACANQEMA7AS2OLoG0AGAXUVAAcA9rCYUmghnxAAPRAE4AHADoArABoQAT0QBaAMwBGVQF9jGtFlyES5asjB1KXXkhBCRYiVNkIdBgCwqSpwGBgDsBgph6lq6hiamGgyCEHBSFjjIUu6i4pKuPn5yesGhEVEx2r6hCokgGbhKyNgAggDCmNnCuV4FugbxlYgqKnUNyEo0LQByAJIAMvMtXR553oihQYYATEMII6amQA */
  id: "ROUTER",

  states: {
    REACT: {},

    VANILLA: {},
  },
  initial: "REACT",
  on: {
    "Select Vanilla": ".VANILLA",
    "Select React": ".REACT",
  },
});
