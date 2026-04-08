## Summary

Many tool components in `frontend/src/components/tools/` use `<div onClick={...}>` for interactive elements (collapsible section headers, modal close handlers, clickable cards, etc.) instead of a real `<button>`. This breaks keyboard navigation, screen-reader announcements, and focus management — three of the most basic accessibility guarantees.

We'd like to migrate these to semantic `<button>` elements (or `<Button>` from `@/components/ui/button` where it fits visually).

## Why this matters

A `<div onClick>` looks clickable to a sighted mouse user, but it is **not** a control as far as the browser, the keyboard, or assistive tech are concerned:

| Behavior | `<button>` | `<div onClick>` |
|---|---|---|
| Reachable via <kbd>Tab</kbd> | ✅ | ❌ |
| Activates on <kbd>Enter</kbd> / <kbd>Space</kbd> | ✅ | ❌ |
| Announced as "button" by screen readers | ✅ | ❌ ("group" or nothing) |
| Visible focus ring by default | ✅ | ❌ |
| Counts toward WCAG 2.1.1 (Keyboard) | ✅ | ❌ — fails |
| Counts toward WCAG 4.1.2 (Name, Role, Value) | ✅ | ❌ — fails |

This is one of the most common a11y bugs in React codebases and one of the easiest to fix correctly.

## Scope

Audit results from `rg '<div[^>]*\sonClick='`:

- **26 files** under `frontend/src/components/tools/` contain at least one `<div onClick>`.
- **~35 occurrences** in those files.
- A handful more elsewhere in `frontend/src/` (~9), but those are out of scope for this issue — open a follow-up if you'd like to tackle them.

### Affected files (tool components only)

<details>
<summary>Click to expand the full list (26 files)</summary>

- `BOMManagerTool.tsx`
- `ChangeOrderTool.tsx`
- `CollateralTrackerTool.tsx`
- `CreditApplicationTool.tsx`
- `DelinquencyTrackerTool.tsx`
- `DesignPortfolioTool.tsx`
- `DialysisSchedulerTool.tsx` (6 occurrences — biggest offender)
- `EquipmentLogTool.tsx`
- `EquipmentMaintenanceLandscapeTool.tsx`
- `FirstArticleInspectionTool.tsx`
- `InsuranceVerificationTool.tsx`
- `LandscapeDesignTool.tsx`
- `MedicalBillingTool.tsx`
- `MedicalHistoryTool.tsx`
- `PartsLookupTool.tsx`
- `PaymentSchedulerTool.tsx`
- `PhotoEditingTrackerTool.tsx`
- `PropertyInspectionTool.tsx`
- `PunchListTool.tsx`
- `QualityInspectionTool.tsx`
- `ReferralManagementTool.tsx`
- `ReservationTool.tsx`
- `RoomStatusTool.tsx`
- `TechScheduleApplianceTool.tsx`
- `UnderwritingTool.tsx`
- `VehicleInspectionTool.tsx`

</details>

### Concrete examples

**`DialysisSchedulerTool.tsx:842`** — collapsible section header (this pattern repeats 6 times in this file alone):

```tsx
// Before
<div onClick={() => toggleSection('basic')} className={sectionHeaderClass}>
  ...
</div>

// After
<button
  type="button"
  onClick={() => toggleSection('basic')}
  aria-expanded={expandedSections.basic}
  aria-controls="basic-section-panel"
  className={sectionHeaderClass}
>
  ...
</button>
```

**`DesignPortfolioTool.tsx:973`** — modal backdrop (a special case, see the "Edge cases" section below):

```tsx
// Before
<div className="fixed inset-0 bg-black/80 ..." onClick={() => setSelectedDesign(null)}>
  <div className="relative max-w-4xl ..." onClick={(e) => e.stopPropagation()}>
```

## How to fix

For **most cases** (collapsible headers, clickable cards, "select this row" handlers):

1. Change the wrapper element from `<div>` to `<button type="button">`.
2. Add `type="button"` so it never submits a parent form by accident.
3. Reset the default `<button>` styling that browsers apply — Tailwind handles most of it, but you may need `text-left bg-transparent border-0 cursor-pointer w-full` (or use the existing `Button` component with `variant="ghost"` if it suits the design).
4. For toggles, add `aria-expanded={isOpen}` and `aria-controls="<id of the panel>"`.
5. **Do not** add `role="button"` + `tabIndex={0}` + manual `onKeyDown` handlers as a workaround. Use a real `<button>`. The native element is always better than reimplementing it.

### Edge cases

- **Modal backdrops** (`DesignPortfolioTool.tsx:973-974`): the backdrop close-on-click pattern is a known a11y trap. Prefer a real `<Dialog>` from shadcn/ui (`@/components/ui/dialog`), which handles focus trapping, <kbd>Esc</kbd> to close, and ARIA attributes correctly. If you must keep the custom backdrop, leave the outer `<div onClick>` *but* add an `Esc` handler and a visually-hidden close `<button>` so keyboard users can dismiss it.
- **Stop-propagation wrappers** (`<div onClick={(e) => e.stopPropagation()}>`): these are not interactive — they exist solely to block bubbling. They're acceptable to leave as `<div>` since they have no real "click" semantics, but a comment explaining why is appreciated.
- **Whole-card clickable patterns**: prefer making the card's *title* a `<button>` or wrapping the card content in a `<button>` rather than putting the click on the outer `<div>`. If the card contains other interactive elements (links, buttons), the "card as button" anti-pattern creates nested-interactive issues — use a "stretched link" pattern instead (an absolutely-positioned invisible button covering the card).

## Definition of done

- [ ] All 26 files in the list above no longer match `rg '<div[^>]*\sonClick=' frontend/src/components/tools`.
- [ ] Each replaced control is reachable by <kbd>Tab</kbd> and activates on <kbd>Enter</kbd> and <kbd>Space</kbd>.
- [ ] Collapsibles expose `aria-expanded` and `aria-controls`.
- [ ] No visual regressions (compare before/after in the running app — the buttons should look identical to the previous divs).
- [ ] No new ESLint warnings from `jsx-a11y/click-events-have-key-events` or `jsx-a11y/no-static-element-interactions` in the touched files.

## Good first issue notes

This is a great first contribution because:

- The pattern repeats — once you fix one file, the rest are mostly copy-paste.
- No backend changes, no migrations, no API design decisions.
- Each file is independent — you can submit a PR for one file or batch them.
- You'll learn React a11y patterns that apply to every project you'll ever work on.

**Suggested approach for first-timers**: pick one file from the list (maybe `RoomStatusTool.tsx` — only one occurrence) and submit a PR for just that file. We'll review and merge quickly so you can use it as a template for the rest. If you want to tackle multiple, please **claim them in a comment first** so two contributors don't duplicate work.

## Related

- [WCAG 2.1.1 Keyboard (Level A)](https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html)
- [WCAG 4.1.2 Name, Role, Value (Level A)](https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html)
- [MDN: When to use button vs link](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button)
- [eslint-plugin-jsx-a11y rule docs](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)

## Out of scope

- The ~9 occurrences outside `components/tools/` (open a follow-up issue).
- Color-contrast audits, focus-ring styling, ARIA landmarks — separate issues.
- Migrating custom modals to shadcn `<Dialog>` (worth doing, but a much bigger refactor — open a separate issue if you want to take it on).
