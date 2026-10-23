---
"overkit": patch
---

Remove runtime dependencies and the tunnel API (`t`, `In`, `Out`). `configure` values derived from the store are now reactive, `beforeOpen` sees the trigger props, and `beforeClose` runs on every close with the current state.
