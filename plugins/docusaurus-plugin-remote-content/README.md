# Docusaurus Plugin: Remote Content Generator

A powerful Docusaurus plugin that fetches remote JSON files and automatically generates documentation pages with custom React templates.

## Features

- **Remote Data Fetching**: Automatically fetch JSON data from remote URLs during build/dev
- **Markdown Templates**: Use simple Markdown templates with variable substitution
- **Multiple Sources**: Configure multiple JSON sources with different templates
- **Automatic Page Generation**: Creates MDX pages with proper routing and frontmatter
- **Smart Cleanup**: Automatically removes old pages while preserving specified files (like index.md)
- **Flexible Configuration**: Customize routing, titles, filtering, and frontmatter per source
- **MDX Support**: Full MDX support with JSX components, styles, and React components

## Installation

The plugin is already included in this project. No additional installation needed.

## Configuration

Add the plugin to your `docusaurus.config.ts`:

```typescript
plugins: [
  [
    './plugins/docusaurus-plugin-remote-content/src/index.js',
    {
      sources: [
        {
          name: 'technologies',
          sourceUrl: 'https://api.example.com/technologies.json',
          outDir: 'research/technologies',
          template: 'templates/technology.md',
          dataKey: 'technologies', // Optional: extract items from 'technologies' key (default: 'items')
          getPageRoute: (item) => item.id,
          getPageTitle: (item) => item.name,
          getPageDescription: (item) => item.description,
          filterItems: (item) => item.published === true,
          excludeFiles: ['index.md', '_category_.json'], // Optional: files to preserve (default: ['index.md'])
          frontmatter: (item) => ({
            sidebar_position: item.tier || 0,
            tags: item.tags || [],
          }),
        },
        // Add more sources here...
      ],
    },
  ],
],
```

## Configuration Options

### Plugin Options

| Option    | Type            | Required | Description                    |
|-----------|-----------------|----------|--------------------------------|
| `sources` | `Array<Source>` | Yes      | Array of source configurations |

### Source Configuration

| Option               | Type               | Required | Description                                                                  |
|----------------------|--------------------|----------|------------------------------------------------------------------------------|
| `name`               | `string`           | Yes      | Unique identifier for logging                                                |
| `sourceUrl`          | `string`           | Yes      | URL to fetch JSON data from                                                  |
| `outDir`             | `string`           | Yes      | Output directory relative to `docs/`                                         |
| `template`           | `string`           | Yes      | Path to Markdown template file                                               |
| `dataKey`            | `string`           | No       | Key to extract items from JSON object (e.g., 'technologies'). Default: 'items' |
| `getPageRoute`       | `function`         | No       | Function to generate page route from item. Default: `item.id \|\| item.slug` |
| `getPageTitle`       | `function`         | No       | Function to generate page title. Default: `item.title \|\| item.name`        |
| `getPageDescription` | `function`         | No       | Function to generate page description                                        |
| `filterItems`        | `function`         | No       | Function to filter items before generation                                   |
| `frontmatter`        | `object\|function` | No       | Static object or function returning frontmatter                              |
| `excludeFiles`       | `Array<string>`    | No       | Files to preserve when cleaning output directory. Default: `['index.md']`    |

## Creating Templates

Templates are Markdown files with variable placeholders that get replaced with data from your JSON:

```markdown
# {{name}}

## Overview

{{description}}

## Details

<div className="stats-grid">
  <div className="stat-card">
    <div className="stat-label">Category</div>
    <div className="stat-value">{{category}}</div>
  </div>
</div>

## Additional Information

Some static content here...

<details>
<summary>View Raw Data</summary>

```json
{{JSON_DATA}}
```

</details>
```

### Template Variables

- **`{{key}}`**: Replace with `item.key` from JSON
- **`{{key.nested}}`**: Replace with `item.key.nested` for nested values
- **`{{JSON_DATA}}`**: Replace with full JSON data (formatted)

### Template Best Practices

1. **Variable Syntax**: Use `{{variableName}}` for simple substitution
2. **Nested Access**: Use `{{parent.child}}` for nested properties
3. **MDX Components**: Use JSX components directly in your Markdown
4. **Styling**: Use inline styles with `<style jsx>` or CSS classes
5. **Theme Aware**: Use Docusaurus CSS variables for theme support
6. **Static Content**: Mix static Markdown with dynamic variables

## JSON Data Structure

The plugin supports multiple JSON formats:

### Array Format
```json
[
  { "id": "tech1", "name": "Technology 1" },
  { "id": "tech2", "name": "Technology 2" }
]
```

### Object Format with 'items' key
```json
{
  "items": [
    { "id": "tech1", "name": "Technology 1" },
    { "id": "tech2", "name": "Technology 2" }
  ]
}
```

### Object Format with custom key
Use the `dataKey` option to specify a custom key:
```json
{
  "technologies": [
    { "id": "tech1", "name": "Technology 1" },
    { "id": "tech2", "name": "Technology 2" }
  ]
}
```

Configuration:
```typescript
{
  name: 'technologies',
  sourceUrl: 'https://api.example.com/data.json',
  dataKey: 'technologies', // Specify the key to extract
  // ... other options
}
```

## How It Works

1. **Fetch**: Plugin fetches JSON from configured URLs
2. **Filter**: Applies optional `filterItems` function
3. **Clean**: Removes existing pages in `outDir` (excluding files specified in `excludeFiles`)
4. **Generate**: For each item:
   - Creates a directory based on `getPageRoute()`
   - Saves item data as `data.json`
   - Generates MDX file with template import
   - Adds frontmatter from configuration
5. **Build**: Docusaurus processes the generated MDX pages

## Generated File Structure

```
docs/
└── research/
    └── technologies/
        ├── tech-1/
        │   ├── data.json       # Raw item data
        │   └── index.mdx       # Generated page
        └── tech-2/
            ├── data.json
            └── index.mdx
```

## Example MDX Output

After processing, the generated MDX file will look like:

```mdx
---
title: "Plasma Thrusters"
description: "Advanced propulsion technology"
sidebar_position: 2
tags: ["physics", "propulsion"]
---

# Plasma Thrusters

## Overview

Advanced propulsion technology that increases ship speed by 25%.

## Details

<div className="stats-grid">
  <div className="stat-card">
    <div className="stat-label">Category</div>
    <div className="stat-value">Physics</div>
  </div>
</div>

## Additional Information

Some static content here...

<details>
<summary>View Raw Data</summary>

```json
{
  "id": "plasma-thrusters",
  "name": "Plasma Thrusters",
  "description": "Advanced propulsion technology that increases ship speed by 25%.",
  "category": "Physics"
}
```

</details>
```

## Advanced Usage

### Multiple Sources

Configure multiple sources for different content types:

```typescript
sources: [
  {
    name: 'technologies',
    sourceUrl: 'https://api.example.com/technologies.json',
    outDir: 'research/technologies',
    template: 'src/components/templates/TechnologyTemplate.tsx',
    getPageRoute: (item) => item.id,
  },
  {
    name: 'species',
    sourceUrl: 'https://api.example.com/species.json',
    outDir: 'species',
    template: 'templates/species.md',
    getPageRoute: (item) => item.slug,
  },
]
```

### Custom Filtering

Filter items before page generation:

```typescript
filterItems: (item) => {
  // Only include published items with required fields
  return item.published === true &&
         item.name &&
         item.description;
}
```

### Dynamic Frontmatter

Generate frontmatter based on item data:

```typescript
frontmatter: (item) => ({
  sidebar_position: item.tier || 0,
  sidebar_label: item.shortName || item.name,
  tags: item.categories || [],
  custom_edit_url: `https://github.com/example/repo/edit/main/${item.id}`,
})
```

### Preserving Files During Cleanup

By default, the plugin preserves `index.md` files when cleaning the output directory. You can customize which files to preserve:

```typescript
{
  name: 'technologies',
  sourceUrl: 'https://api.example.com/technologies.json',
  outDir: 'research/technologies',
  template: 'templates/technology.md',
  excludeFiles: ['index.md', 'README.md', '_category_.json'], // Preserve these files
  getPageRoute: (item) => item.id,
}
```

This is useful when you have:
- Category index pages (`index.md`)
- Documentation files (`README.md`)
- Docusaurus sidebar configuration (`_category_.json`)
- Other manually-created content that should persist across regenerations

## Development

The plugin runs during:
- `npm start` (development server)
- `npm run build` (production build)

Content is regenerated on each run to ensure it's up-to-date.

## Troubleshooting

### Plugin doesn't fetch data
- Check that `sourceUrl` is accessible
- Verify JSON format is valid
- Check console for error messages

### Pages not appearing
- Verify `outDir` path is correct
- Check that `getPageRoute()` returns valid paths
- Ensure items pass `filterItems()` function

### Template not rendering
- Verify template path is correct relative to site root
- Check for syntax errors in Markdown template
- Ensure variables match JSON keys exactly

### Styling issues
- Use CSS modules for scoped styles
- Reference Docusaurus CSS variables
- Test both light and dark themes

## Example Template

See `templates/technology.md` for a complete example with:
- Variable substitution
- JSX components for layout
- Inline styles with theme support
- Responsive design
- Admonitions and callouts
- Debug mode with raw JSON data

## Contributing

To extend the plugin:

1. Edit `plugins/docusaurus-plugin-remote-content/src/index.js`
2. Test with `npm start`
3. Update this README with new features

## License

MIT
