# UI Style Guide

**Purpose**: This document captures the visual design patterns and UX conventions for genesis-tools. Use this as a reference when implementing features or achieving design parity across projects.

## 🧬 Project Lineage

**All projects in this ecosystem derive from https://github.com/bordenet/genesis/**

This style guide ensures UI consistency across all sibling projects.

---

## 🎨 Button Styles & Colors

### Primary Action Buttons

| Button Type | Color Class | Use Case |
|-------------|-------------|----------|
| **Copy/Primary** | `bg-blue-600 hover:bg-blue-700` | Main workflow actions |
| **Save/Success** | `bg-green-600 hover:bg-green-700` | Save operations, external links |
| **Delete/Danger** | `bg-red-600 hover:bg-red-700` | Destructive actions |
| **Secondary** | `bg-gray-200 dark:bg-gray-700` | Back, Previous Phase |
| **Tertiary/View** | `bg-gray-600 hover:bg-gray-700` | View Prompt |

### Button Labels

```
📋 Copy Prompt to Clipboard    (blue)
🔗 Open Claude                 (green - Phase 1 & 3)
🔗 Open Gemini                 (green - Phase 2)
👁️ View Prompt                 (gray)
Save Response                  (green)
Next Phase →                   (blue)
← Previous Phase               (gray)
📄 Export as Markdown          (green - Phase 3 complete)
Delete                         (red)
```

---

## 📐 Button Layout Patterns

### Phase Views

```
[← Previous Phase]  [Next Phase →]                    [Delete]
     Left (gray)      Left (blue)               Right side (red)
```

- Delete button **always visible** on the right
- "Next Phase →" only appears when current phase is completed

---

## 🌗 Dark Mode Requirements

**Every color class MUST have a dark mode counterpart.**

| Light Mode | Dark Mode |
|------------|-----------|
| `bg-white` | `dark:bg-gray-800` |
| `bg-gray-50` | `dark:bg-gray-900` |
| `text-gray-900` | `dark:text-white` |
| `text-gray-700` | `dark:text-gray-300` |
| `border-gray-300` | `dark:border-gray-600` |

### Input/Textarea Classes

```
w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
focus:ring-2 focus:ring-blue-500 focus:border-transparent
dark:bg-gray-700 dark:text-white
```

---

## 🪟 Modal Dialogs

- **Background**: `bg-black bg-opacity-50`
- **Container**: `bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl`
- **Dismissal**: Click ×, click Close, click backdrop, or press Escape

---

## ✅ Form Field Patterns

### Required Fields

```html
<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    Field Name <span class="text-red-500">*</span>
</label>
```

---

## 🔧 Utility Functions

### Clipboard (`copyToClipboard`)

- MUST throw on error (not return boolean)
- MUST NOT show toast internally
- Callers handle their own success/error toasts

### Toast (`showToast`)

- Types: `'success'` (green), `'error'` (red), `'info'` (gray)
- Auto-dismiss after 3-5 seconds
- Position: top-right of viewport

---

**Reference**: See `js/ui.js`, `js/views.js`, and `js/project-view.js` for implementation.

