# ctrl-alt-me

Not the end. Just a restart.

A modern job application tracking system with a beautiful UI and powerful features.

## Features

### 🏗️ Clean Navigation Header
- **App Title**: Professional branding with briefcase icon
- **View Toggle**: Switch between Kanban board and List view
- **Add New Button**: Quick access to create new applications
- **Theme Toggle**: Dark/light mode switching
- **Responsive Design**: Mobile-friendly collapsible navbar

### 📱 Full Viewport Layout
- **Complete Window Usage**: Takes advantage of entire browser window
- **Responsive Design**: Adapts to all screen sizes
- **Optimized Scrolling**: Smart overflow handling for content areas
- **Professional Look**: App-like experience in the browser

### 📝 Rich Text Notes with Markdown Support

Your job application notes now support full markdown formatting:

- **Text formatting**: `**bold**`, `*italic*`, `~~strikethrough~~`
- **Headers**: `# H1`, `## H2`, `### H3`, etc.
- **Lists**:
  - Unordered: `- item` or `* item`
  - Ordered: `1. item`
- **Links**: `[text](https://example.com)`
- **Code**: `` `inline code` `` or code blocks with ```
- **Blockquotes**: `> quote text`
- **Tables**: GitHub-flavored markdown tables
- **Task lists**: `- [x] completed` and `- [ ] todo`

#### Markdown Editor Features

- **Live Preview**: Switch between Edit and Preview tabs
- **Compact Display**: Optimized rendering in cards and lists
- **Dark Theme Support**: Adapts to your theme preference
- **GitHub Flavored Markdown**: Full GFM support including tables and task lists

#### Examples

```markdown
## Interview Notes
- [x] Phone screening completed ✅
- [ ] Technical interview scheduled
- [ ] Final round pending

**Feedback**: Great cultural fit, strong technical skills

> "This candidate shows excellent problem-solving abilities"

### Technical Stack
| Technology | Experience |
|------------|------------|
| React      | 3 years    |
| Go         | 2 years    |
```

---

## Development

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
make run
```