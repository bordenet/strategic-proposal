# Genesis Examples & Reference Implementations

## 🔗 Live Reference Implementations (PREFERRED)

These are **actively maintained** Genesis-derived projects. **Use these as your primary reference!**

| Project | Description | Phases | Live Demo |
|---------|-------------|--------|-----------|
| [product-requirements-assistant](https://github.com/bordenet/product-requirements-assistant) | **The original** - PRD generation | 3 | [Demo](https://bordenet.github.io/product-requirements-assistant/) |
| [one-pager](https://github.com/bordenet/one-pager) | Concise one-page documents | 2 | [Demo](https://bordenet.github.io/one-pager/) |
| [power-statement-assistant](https://github.com/bordenet/power-statement-assistant) | Power statements via adversarial challenge | 3 | [Demo](https://bordenet.github.io/power-statement-assistant/) |
| [architecture-decision-record](https://github.com/bordenet/architecture-decision-record) | ADR document generation | 3 | [Demo](https://bordenet.github.io/architecture-decision-record/) |
| [bloginator](https://github.com/bordenet/bloginator) | Blog generation from prior art | 3 | [Demo](https://bordenet.github.io/bloginator/) |
| [strategic-proposal](https://github.com/bordenet/strategic-proposal) | Strategic proposals with pain points | 3 | [Demo](https://bordenet.github.io/strategic-proposal/) |

### Why Use Live References?

✅ **Always up-to-date** - Bug fixes applied continuously
✅ **Battle-tested** - Real users, real feedback
✅ **Best practices** - Latest patterns and conventions
❌ **Stale copies** - In-repo examples get outdated fast

---

## 📁 Local Examples

### hello-world/

A **minimal working example** included in this repo for quick testing.

**Purpose**: Verify Genesis templates work without network access.

**Use for**:
- Testing Genesis template changes locally
- Quick sanity checks
- Offline development

**NOT for**:
- Learning best practices (use live references above)
- Starting new projects (use templates instead)

---

## 🎯 How to Study References

### 1. Clone and Explore
```bash
git clone https://github.com/bordenet/product-requirements-assistant.git
cd product-requirements-assistant
npm install && npm test
```

### 2. Key Files to Study
- `js/workflow.js` - Phase architecture
- `prompts/*.md` - Prompt templates
- `index.html` - Tailwind dark mode setup
- `tests/*.test.js` - Test patterns

### 3. Compare Multiple Projects
See how different document types adapt the same patterns:
- PRD (3 phases, structured form)
- One-Pager (2 phases, minimal form)
- Power Statement (3 phases, adversarial focus)

---

## ⚠️ IMPORTANT

**DO NOT copy files from `examples/`** - use `genesis/templates/` instead!

Examples may be outdated. Templates are the source of truth.

---

## 📚 Related Documentation

- [REFERENCE-IMPLEMENTATIONS.md](../REFERENCE-IMPLEMENTATIONS.md) - Detailed reference guide
- [CHECKLIST.md](../CHECKLIST.md) - Project creation checklist
- [templates/README.md](../templates/README.md) - Template documentation

