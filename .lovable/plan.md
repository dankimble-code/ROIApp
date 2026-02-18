

## Revamp Export Report Options

### What Changes
When a user clicks "Export Report" (on either the Calculation page or the Programs page), they will see a clean dialog with three clearly labeled options:

1. **Export Current Report** -- Exports only the currently viewed program's ROI report as a single PDF (only shown when viewing a specific program on the Calculation page)
2. **Select Reports to Export** -- Opens the program selection checklist so the user can pick specific programs for a comparison document
3. **Select All Reports** -- Immediately exports all programs in the account as a comparison document

### Where This Applies
- **Calculation page** (`src/pages/Calculation.tsx`) -- The "Export Report" button in the header and "Generate Report" button at the bottom will open this new options dialog. Option 1 will export the current program. Options 2 and 3 will fetch all programs for multi-select or bulk export.
- **Programs (Index) page** (`src/pages/Index.tsx`) -- The "Export PDF" button will also open this same options dialog, but Option 1 will be hidden (since no single program is selected).

---

### Technical Details

**New Component: `src/components/export/ExportOptionsDialog.tsx`**
- A dialog with three buttons/cards representing the three export options
- Props: `open`, `onOpenChange`, `currentProgramId` (optional -- when set, shows Option 1), `programs` (list of all programs), `onExportCurrent` (callback for Option 1), `onExportSelected` (callback for Option 2 -- opens the existing `ExportProgramDialog`), `onExportAll` (callback for Option 3)

**Modify: `src/components/export/ExportProgramDialog.tsx`**
- No major changes needed; this continues to serve as the multi-select picker for Option 2

**Modify: `src/pages/Calculation.tsx`**
- Replace the direct `handleExportReport` call on button click with opening the new `ExportOptionsDialog`
- Pass current `programId` so Option 1 is available
- Fetch all programs (via `usePrograms`) to support Options 2 and 3
- Wire Option 1 to the existing single-program export logic
- Wire Options 2/3 to the multi-program export flow (reusing Index page's `handleExportPDF` logic)

**Modify: `src/pages/Index.tsx`**
- Replace direct opening of `ExportProgramDialog` with `ExportOptionsDialog`
- Hide Option 1 (no current program context)
- Option 2 opens the existing `ExportProgramDialog`
- Option 3 calls `handleExportPDF` with all program IDs immediately

### User Flow

```text
User clicks "Export Report"
        |
  +-----v------+
  | Options     |
  | Dialog      |
  +-------------+
  | 1. Export Current Report        (only if viewing a single program)
  | 2. Select Reports to Export     (opens program picker)
  | 3. Export All Reports           (immediate bulk export)
  +-------------+
```
