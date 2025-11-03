const path = require('path');
const fs = require('fs-extra');
const https = require('https');
const http = require('http');

/**
 * Docusaurus Plugin: Remote Content Generator
 *
 * Fetches remote JSON files and generates pages with custom Markdown templates
 *
 * @param {Object} context - Docusaurus context
 * @param {Object} options - Plugin options
 * @param {Array<Object>} options.sources - Array of source configurations
 * @param {string} options.sources[].name - Unique identifier for this source
 * @param {string} options.sources[].sourceUrl - URL to fetch JSON from
 * @param {string} options.sources[].outDir - Output directory relative to docs
 * @param {string} options.sources[].template - Path to Markdown template file
 * @param {Function} options.sources[].getPageRoute - Function to generate page route from item
 * @param {Function} options.sources[].getPageTitle - Function to generate page title from item
 * @param {Function} options.sources[].filterItems - Optional function to filter items
 * @param {Array<string>} options.sources[].excludeFiles - Files to preserve when cleaning output directory (default: ['index.md'])
 * @param {string} options.sources[].dataKey - Key to extract items from JSON object (e.g., 'technologies'). If not specified, uses 'items' or treats data as array
 */
module.exports = function pluginRemoteContent(context, options) {
  const { siteConfig, siteDir } = context;
  const { sources = [] } = options;

  // Validate configuration
  if (!Array.isArray(sources) || sources.length === 0) {
    throw new Error('docusaurus-plugin-remote-content: sources array is required and must not be empty');
  }

  sources.forEach((source, index) => {
    if (!source.name) {
      throw new Error(`docusaurus-plugin-remote-content: sources[${index}].name is required`);
    }
    if (!source.sourceUrl) {
      throw new Error(`docusaurus-plugin-remote-content: sources[${index}].sourceUrl is required`);
    }
    if (!source.outDir) {
      throw new Error(`docusaurus-plugin-remote-content: sources[${index}].outDir is required`);
    }
    if (!source.template) {
      throw new Error(`docusaurus-plugin-remote-content: sources[${index}].template is required`);
    }
  });

  return {
    name: 'docusaurus-plugin-remote-content',

    /**
     * Fetch JSON from URL
     */
    async fetchJson(url) {
      return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;

        protocol.get(url, (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              const json = JSON.parse(data);
              resolve(json);
            } catch (error) {
              reject(new Error(`Failed to parse JSON from ${url}: ${error.message}`));
            }
          });
        }).on('error', (error) => {
          reject(new Error(`Failed to fetch ${url}: ${error.message}`));
        });
      });
    },

    /**
     * Read and process template file
     */
    async readTemplate(templatePath) {
      try {
        const fullPath = path.join(siteDir, templatePath);
        const template = await fs.readFile(fullPath, 'utf-8');
        return template;
      } catch (error) {
        throw new Error(`Failed to read template ${templatePath}: ${error.message}`);
      }
    },

    /**
     * Replace template variables with item data
     */
    replaceTemplateVariables(template, item) {
      // Replace {{JSON_DATA}} with formatted JSON
      template = template.replace(/\{\{JSON_DATA\}\}/g, JSON.stringify(item, null, 2));

      // Replace {{key}} or {{key.nested}} with item[key] or item[key][nested]
      return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
        const keys = path.split('.');
        let value = item;

        for (const key of keys) {
          value = value?.[key];
        }

        // Handle arrays and objects
        if (typeof value === 'object') {
          return JSON.stringify(value);
        }

        return value !== undefined ? value : match;
      });
    },

    /**
     * Generate MDX file for an item
     */
    async generateMdxContent(item, source) {
      const title = source.getPageTitle ? source.getPageTitle(item) : item.title || item.name || 'Untitled';
      const description = source.getPageDescription ? source.getPageDescription(item) : '';

      // Generate frontmatter
      const frontmatter = {
        title,
        ...(description && { description }),
        ...(source.frontmatter && typeof source.frontmatter === 'function'
          ? source.frontmatter(item)
          : source.frontmatter || {}
        )
      };

      const frontmatterString = Object.entries(frontmatter)
        .map(([key, value]) => {
          if (typeof value === 'string') {
            // Escape quotes in string values
            const escaped = value.replace(/"/g, '\\"');
            return `${key}: "${escaped}"`;
          }
          return `${key}: ${JSON.stringify(value)}`;
        })
        .join('\n');

      // Read the markdown template
      const template = await this.readTemplate(source.template);

      // Replace variables in template
      const content = this.replaceTemplateVariables(template, item);

      // Combine frontmatter and content
      return `---
${frontmatterString}
---

${content}
`;
    },

    /**
     * Clean directory while preserving specified files
     */
    async cleanDirectory(dirPath, excludeFiles = []) {
      if (!await fs.pathExists(dirPath)) {
        return;
      }

      const items = await fs.readdir(dirPath);

      for (const item of items) {
        if (excludeFiles.includes(item)) {
          console.log(`  Preserving: ${item}`);
          continue;
        }

        const itemPath = path.join(dirPath, item);
        await fs.remove(itemPath);
      }
    },

    /**
     * Process a single source configuration
     */
    async processSource(source) {
      const docsDir = path.join(siteDir, 'docs');
      const outDir = path.join(docsDir, source.outDir);

      console.log(`[${source.name}] Fetching content from ${source.sourceUrl}...`);

      try {
        // Fetch JSON data
        const data = await this.fetchJson(source.sourceUrl);

        // Get items array (support custom key, 'items' property, or direct array)
        let items;
        if (Array.isArray(data)) {
          items = data;
        } else if (source.dataKey) {
          items = data[source.dataKey] || [];
        } else {
          items = data.items || [];
        }

        // Apply filter if provided
        if (source.filterItems && typeof source.filterItems === 'function') {
          items = items.filter(source.filterItems);
        }

        console.log(`[${source.name}] Processing ${items.length} items...`);

        // Clean output directory while preserving excluded files
        const excludeFiles = source.excludeFiles || ['index.md'];
        await this.cleanDirectory(outDir, excludeFiles);
        await fs.ensureDir(outDir);

        // Generate pages for each item
        const generatedFiles = [];

        for (const item of items) {
          let route = source.getPageRoute ? source.getPageRoute(item) : item.id || item.slug;

          if (!route) {
            console.warn(`[${source.name}] Skipping item without route:`, item);
            continue;
          }

          // Remove 'tech_' prefix from route if present
          route = route.replace(/^tech_/, '');

          // Ensure output directory exists
          await fs.ensureDir(outDir);

          // Generate MD file directly (not as directory)
          const mdxContent = await this.generateMdxContent(item, source);
          const mdxPath = path.join(outDir, `${route}.md`);
          await fs.writeFile(mdxPath, mdxContent, 'utf-8');
          generatedFiles.push(mdxPath);
        }

        console.log(`[${source.name}] Successfully generated ${generatedFiles.length} pages`);

      } catch (error) {
        console.error(`[${source.name}] Error processing source:`, error.message);
        throw error;
      }
    },

    /**
     * Hook: Called before Docusaurus builds or starts dev server
     */
    async loadContent() {
      console.log('Remote Content Plugin: Starting content generation...');
      await Promise.all(sources.map(source => this.processSource(source)));
      console.log('Remote Content Plugin: Content generation completed');

      return null;
    },

    /**
     * Hook: Watch for changes in dev mode
     */
    getPathsToWatch() {
      return [
        path.join(siteDir, 'docusaurus.config.ts'),
        path.join(siteDir, 'plugins/docusaurus-plugin-remote-content/src/index.js'),
        path.join(siteDir, 'templates/**/*.md'),
      ];
    },
  };
};
