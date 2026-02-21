---
"overkit": patch
---

Fix tests and add portal documentation

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
