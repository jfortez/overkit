# overkit

## 0.0.6

### Patch Changes

- [#4](https://github.com/jfortez/overkit/pull/4) [`eed33f1`](https://github.com/jfortez/overkit/commit/eed33f17733a9fc81a6111675cdf783fbb373a5d) Thanks [@jfortez](https://github.com/jfortez)! - Remove runtime dependencies and the tunnel API (`t`, `In`, `Out`). `configure` values derived from the store are now reactive, `beforeOpen` sees the trigger props, and `beforeClose` runs on every close with the current state.

## 0.0.5

### Patch Changes

- [`8ad3977`](https://github.com/jfortez/overkit/commit/8ad397794620e2d364a3400bf100dd31d8fe3f1d) Thanks [@jfortez](https://github.com/jfortez)! - Fix tests and add portal documentation

  **Test Fixes:**
  - Fixed duplicate test code causing syntax errors
  - Added missing dialog keys (portalDialog, multiPortalDialog) to test registry
  - Corrected test assertions for portal button text
  - All 9 tests now passing successfully

  **Portal Documentation:**
  - Added comprehensive documentation for the `In` portal component
  - Updated registry example to show `t.Out` usage in the modal component
  - Added dedicated Portals section with practical examples
  - Documented how to use tunnel-rat for flexible rendering
  - Showed how to portal buttons to a modal footer

  **API Improvements:**
  - Renamed `FooterButtons` to `In` for clearer portal API
  - Updated TypeScript types to reflect the change

## 0.0.4

### Patch Changes

- [`2e74d0b`](https://github.com/jfortez/overkit/commit/2e74d0bafde306d7f714c596639a144aa24c5149) Thanks [@jfortez](https://github.com/jfortez)! - Fix test failures and portal functionality
  - Fixed duplicate test code causing syntax errors
  - Added missing dialog keys (portalDialog, multiPortalDialog) to test registry
  - Corrected test assertions for portal button text
  - All 9 tests now passing successfully
  - Build verified and working

## 0.0.3

### Patch Changes

- [`646550e`](https://github.com/jfortez/overkit/commit/646550e63dd0528bf1fc9d7c6ef54f6fab7061d2) Thanks [@jfortez](https://github.com/jfortez)! - Initial release of overkit with full TypeScript support, Zustand integration, and portal-based rendering.

## 0.0.2

### Patch Changes

- Initial release of overkit
