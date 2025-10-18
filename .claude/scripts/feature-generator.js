#!/usr/bin/env node

/**
 * Feature Generator for Linear TDD Workflow System
 * Implements /feature command functionality
 * Generated: 2025-10-18
 */

const fs = require('fs');
const path = require('path');

class FeatureGenerator {
  constructor() {
    this.templatesDir = path.join(__dirname, '..', 'templates');
    this.templates = {
      api: 'API_TEMPLATE.js',
      ui: 'REACT_COMPONENT_TEMPLATE.jsx',
      service: 'SERVICE_TEMPLATE.js',
      data: 'DATA_PROCESSOR_TEMPLATE.js'
    };
  }

  /**
   * Generate a feature based on description and type
   */
  async generate(description, options = {}) {
    const {
      type = 'service',
      tier = 'fast',
      withTests = true,
      outputPath = 'src'
    } = options;

    console.log(`🚀 Generating feature: ${description}`);
    console.log(`📝 Type: ${type}, Tier: ${tier}`);

    const featureConfig = this.parseDescription(description, type);
    const filesToGenerate = this.determineFiles(type, withTests, featureConfig);

    const results = {
      description,
      type,
      tier,
      files: [],
      nextSteps: []
    };

    for (const fileConfig of filesToGenerate) {
      const result = await this.generateFile(fileConfig, featureConfig);
      results.files.push(result);
    }

    results.nextSteps = this.generateNextSteps(featureConfig, filesToGenerate);

    return results;
  }

  /**
   * Parse feature description into structured data
   */
  parseDescription(description, type) {
    // Extract feature name from description
    const featureName = this.extractFeatureName(description);
    const featureSlug = this.slugify(featureName);

    // Determine file paths based on type
    const paths = this.getPaths(type, featureSlug);

    // Extract parameters from description
    const params = this.extractParameters(description);

    return {
      name: featureName,
      slug: featureSlug,
      description: description,
      type: type,
      paths: paths,
      params: params,
      generationDate: new Date().toISOString().split('T')[0]
    };
  }

  /**
   * Generate individual file from template
   */
  async generateFile(fileConfig, featureConfig) {
    const templatePath = path.join(this.templatesDir, fileConfig.template);
    const outputPath = path.join(process.cwd(), fileConfig.output);

    // Read template
    const template = fs.readFileSync(templatePath, 'utf8');

    // Replace placeholders
    const content = this.replacePlaceholders(template, featureConfig, fileConfig);

    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write file
    fs.writeFileSync(outputPath, content);

    return {
      type: fileConfig.type,
      path: outputPath,
      size: content.length,
      relativePath: path.relative(process.cwd(), outputPath)
    };
  }

  /**
   * Replace placeholders in template
   */
  replacePlaceholders(template, config, fileConfig) {
    const replacements = {
      '{FEATURE_NAME}': config.name,
      '{FEATURE_DESCRIPTION}': config.description,
      '{FEATURE_SLUG}': config.slug,
      '{GENERATION_DATE}': config.generationDate,
      '{COMPONENT_NAME}': config.name,
      '{SERVICE_NAME}': config.name,
      '{TEST_SUBJECT}': config.name,
      '{TEST_FILE_PATH}': fileConfig.testFile || 'services',
      '{PROCESSOR_NAME}': config.name,

      // Type-specific replacements
      '{METHOD}': config.params.method || 'get',
      '{ENDPOINT}': config.params.endpoint || `/${config.slug}`,
      '{ACCESS_LEVEL}': config.params.access || 'public',
      '{RETURN_TYPE}': config.params.returnType || 'JSON',
      '{PARAMS}': config.params.params || 'data',

      // React component specific
      '{PROPS}': config.params.props || 'data',
      '{PROP_NAME}': config.params.propName || 'data',
      '{PROP_TYPE}': config.params.propType || 'object',
      '{DEFAULT_VALUE}': config.params.defaultValue || '{}',

      // Test specific
      '{CLASS_NAME}': config.name
    };

    let content = template;
    for (const [placeholder, value] of Object.entries(replacements)) {
      const escapedPlaceholder = placeholder.replace(/[{}]/g, '\\$&');
      const regex = new RegExp(escapedPlaceholder, 'g');
      content = content.replace(regex, value);
    }

    return content;
  }

  /**
   * Extract feature name from description
   */
  extractFeatureName(description) {
    // Remove common prefixes
    const cleaned = description
      .replace(/^(add|create|implement|build|make)\s+/i, '')
      .replace(/\s+(api|endpoint|component|service|feature|functionality)$/i, '');

    // Convert to PascalCase
    return cleaned
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  /**
   * Convert to slug format
   */
  slugify(text) {
    return text
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '')
      .replace(/-+/g, '-');
  }

  /**
   * Extract parameters from description
   */
  extractParameters(description) {
    const params = {};

    // API-specific patterns
    if (description.includes('API') || description.includes('endpoint')) {
      if (description.includes('POST') || description.includes('create')) {
        params.method = 'post';
      } else if (description.includes('PUT') || description.includes('update')) {
        params.method = 'put';
      } else if (description.includes('DELETE') || description.includes('remove')) {
        params.method = 'delete';
      }
    }

    // Component-specific patterns
    if (description.includes('component') || description.includes('UI')) {
      if (description.includes('list') || description.includes('table')) {
        params.props = 'items';
        params.propName = 'items';
        params.propType = 'array';
        params.defaultValue = '[]';
      }
    }

    return params;
  }

  /**
   * Get file paths based on type
   */
  getPaths(type, slug) {
    const paths = {
      api: {
        main: `src/api/${slug}.js`,
        test: `tests/api/${slug}.test.js`,
        docs: `docs/api/${slug}.md`
      },
      ui: {
        main: `src/components/${slug}.jsx`,
        styles: `src/components/${slug}.css`,
        test: `tests/components/${slug}.test.js`,
        stories: `src/components/stories/${slug}.stories.js`
      },
      service: {
        main: `src/services/${slug}.js`,
        test: `tests/services/${slug}.test.js`,
        mocks: `tests/mocks/${slug}Mock.js`
      },
      data: {
        main: `src/processors/${slug}.js`,
        test: `tests/processors/${slug}.test.js`,
        samples: `data/samples/${slug}/`
      }
    };

    return paths[type] || paths.service;
  }

  /**
   * Determine which files to generate
   */
  determineFiles(type, withTests, featureConfig) {
    const fileSets = {
      api: [
        { type: 'implementation', template: 'API_TEMPLATE.js', output: 'src/api/{slug}.js' }
      ],
      ui: [
        { type: 'implementation', template: 'REACT_COMPONENT_TEMPLATE.jsx', output: 'src/components/{slug}.jsx' },
        { type: 'styles', template: 'CSS_TEMPLATE.css', output: 'src/components/{slug}.css' }
      ],
      service: [
        { type: 'implementation', template: 'SERVICE_TEMPLATE.js', output: 'src/services/{slug}.js' }
      ],
      data: [
        { type: 'implementation', template: 'DATA_PROCESSOR_TEMPLATE.js', output: 'src/processors/{slug}.js' }
      ]
    };

    let files = fileSets[type] || fileSets.service;

    // Replace placeholders in output paths
    files = files.map(file => ({
      ...file,
      output: file.output.replace('{slug}', featureConfig.slug)
    }));

    // Add tests if requested
    if (withTests) {
      files.push({
        type: 'test',
        template: 'TEST_TEMPLATE.js',
        output: `tests/${type}/${featureConfig.slug}.test.js`,
        testFile: `${type}/${featureConfig.slug}`
      });
    }

    return files;
  }

  /**
   * Generate next steps for user
   */
  generateNextSteps(config, files) {
    const steps = [
      `✅ ${config.name} feature stub created successfully`,
      '',
      '📝 Next Steps:',
      `1. Open ${files[0].relativePath} and implement the main logic`,
      '2. Update placeholder TODO comments with actual implementation',
      files.length > 1 ? `3. Implement additional files (${files.slice(1).map(f => f.type).join(', ')})` : '',
      '4. Run tests to verify implementation',
      '5. Use /ship to deploy when ready'
    ].filter(Boolean);

    if (config.type === 'api') {
      steps.push(
        '',
        '🔌 API Integration:',
        '- Add route to main router.js',
        '- Test endpoint with curl or Postman',
        '- Update API documentation'
      );
    }

    if (config.type === 'ui') {
      steps.push(
        '',
        '🎨 UI Integration:',
        '- Import component in parent component',
        '- Add props and state management',
        '- Test component in Storybook'
      );
    }

    return steps;
  }

  /**
   * Validate generated files
   */
  async validate(files) {
    const results = [];

    for (const file of files) {
      try {
        const stats = fs.statSync(file.path);
        results.push({
          file: file.relativePath,
          status: 'success',
          size: stats.size
        });
      } catch (error) {
        results.push({
          file: file.relativePath,
          status: 'error',
          error: error.message
        });
      }
    }

    return results;
  }
}

// CLI interface for direct usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const description = args[0];

  if (!description) {
    console.error('Usage: node feature-generator.js "feature description"');
    process.exit(1);
  }

  const generator = new FeatureGenerator();

  generator.generate(description)
    .then(result => {
      console.log('\n✅ Feature generation complete!');
      console.log(`\n📁 Files created: ${result.files.length}`);
      result.files.forEach(file => {
        console.log(`   ${file.relativePath} (${file.size} bytes)`);
      });

      console.log('\n📋 Next Steps:');
      result.nextSteps.forEach(step => console.log(`   ${step}`));
    })
    .catch(error => {
      console.error('❌ Error generating feature:', error.message);
      process.exit(1);
    });
}

module.exports = FeatureGenerator;