# FormGear Builder

![FormGear Logo](public/FormGear.png)

Visual drag-and-drop template builder for FormGear forms

**Live Demo:** [form-gear-builder.netlify.app](https://form-gear-builder.netlify.app)

## Overview

FormGear Builder is a web-based visual editor for creating form templates compatible with the [FormGear](https://github.com/AdityaSetyadi/form-gear) form engine. Build complex survey forms without writing JSON manually.

## Features

- **Drag-and-drop** component palette with all 38 FormGear component types
- **Visual form canvas** with nested component support (Section, Nested)
- **Properties panel** for editing component attributes
- **Expression builder** for `enableCondition` and validation `test` expressions
- **Live preview** using the actual FormGear engine
- **Import/Export** existing JSON templates
- **Undo/Redo** support
- **Dark mode** support

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/AdityyaX/formgear-builder.git
cd formgear-builder

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build

```bash
npm run build
```

## Usage

1. **Drag components** from the left palette onto the canvas
2. **Select a component** to edit its properties in the right panel
3. **Configure validation** rules in the properties panel
4. **Preview** your form using the Preview button
5. **Export** your template and validation JSON files

## Output Files

The builder exports two JSON files:

| File              | Description                          |
|-------------------|--------------------------------------|
| `template.json`   | Form structure, components, metadata |
| `validation.json` | Validation rules and test functions  |

These files are **fully compatible** with FormGear 1.x and 2.x.

## Component Types

FormGear Builder supports all 38 component types:

### Layout

- Section, Nested

### Text Input

- Text, Textarea, Email, URL, Masking

### Number Input

- Number, Decimal, Currency, Range Slider

### Date/Time

- Date, DateTime, Time, Month, Week, Now

### Selection

- Radio, Select, Checkbox, Multiple Select, Single Check, Toggle

### List Repeats

- List Text Repeat, List Select Repeat

### Media

- Photo, GPS, CSV, Signature

### Special

- InnerHTML, Variable, Unit

## Tech Stack

- **Vue 3** with Composition API
- **Pinia** for state management
- **Tailwind CSS v4**
- **Vite** for build tooling
- **TypeScript**

## Related

- [FormGear](https://github.com/AdityaSetyadi/form-gear) - The form engine that renders these templates

## License

MIT
