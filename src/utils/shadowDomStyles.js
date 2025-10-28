/**
 * Utility to manage styles in Shadow DOM
 * Observes and clones styles from a specific module to the Shadow Root
 */

/**
 * Creates a style observer for a Shadow DOM
 * @param {string} moduleName - Module name (for logs)
 * @returns {Object} - Object with start and stop methods
 */
export function createShadowStyleObserver(moduleName = 'Module') {
  let styleObserver = null;
  let observedStyles = new WeakSet();

  /**
   * Clones a style node (<link> or <style>) to the Shadow Root
   * IMPORTANT: Removes from main DOM to prevent style leakage
   *
   * @param {HTMLElement} node - Style node to be cloned
   * @param {ShadowRoot} shadowRoot - Target Shadow Root
   */
  function cloneStyleToShadowRoot(node, shadowRoot) {
    // Mark as observed to avoid duplicates
    observedStyles.add(node);

    if (node.tagName === 'LINK') {
      // For <link>, create a copy
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = node.href;

      // Wait for loading before removing from main DOM
      link.onload = () => {
        console.log(
          `✅ [Shadow Root ${moduleName}] <link> loaded, removing from <head>`,
        );
        // Remove from main DOM after loading in Shadow Root
        if (node.parentNode) {
          node.remove();
        }
      };

      link.onerror = () => {
        console.warn(
          `⚠️ [Shadow Root ${moduleName}] Error loading <link>, keeping in <head>`,
        );
      };

      shadowRoot.appendChild(link);
      console.log(`🎨 [Shadow Root ${moduleName}] <link> cloned`);
    } else if (node.tagName === 'STYLE') {
      // For <style>, clone the content
      const style = document.createElement('style');
      style.textContent = node.textContent;
      shadowRoot.appendChild(style);
      console.log(
        `🎨 [Shadow Root ${moduleName}] <style> cloned to Shadow Root`,
      );

      // Remove from main DOM immediately (already in Shadow Root)
      if (node.parentNode) {
        node.remove();
        console.log(
          `✅ [Shadow Root ${moduleName}] <style> removed from <head>`,
        );
      }
    }
  }

  /**
   * Copies existing module styles that are already in <head>
   *
   * @param {ShadowRoot} shadowRoot - Target Shadow Root
   * @param {string} moduleUrl - Module URL to filter styles
   */
  function copyExistingStyles(shadowRoot, moduleUrl) {
    const existingStyles = document.head.querySelectorAll(
      'style, link[rel="stylesheet"]',
    );

    existingStyles.forEach((node) => {
      const isModuleStyle =
        (node.href && node.href.includes(moduleUrl)) ||
        (node.tagName === 'STYLE' && node.textContent);

      if (isModuleStyle && !observedStyles.has(node)) {
        console.log(
          `🎨 [Shadow Root ${moduleName}] Copying existing style:`,
          node,
        );
        cloneStyleToShadowRoot(node, shadowRoot);
      }
    });
  }

  /**
   * Starts style observation
   *
   * @param {ShadowRoot} shadowRoot - Target Shadow Root
   * @param {string} moduleUrl - Module URL to filter styles
   */
  function start(shadowRoot, moduleUrl) {
    if (!shadowRoot) {
      console.error(`❌ [Shadow Root ${moduleName}] Shadow Root not provided`);
      return;
    }

    console.log(`🔍 [Shadow Root ${moduleName}] Starting style observation`);

    // Copy existing module styles that are already in <head>
    copyExistingStyles(shadowRoot, moduleUrl);

    // Create observer for new styles
    styleObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            // Element node
            const isStyleNode =
              node.tagName === 'STYLE' ||
              (node.tagName === 'LINK' && node.rel === 'stylesheet');

            if (isStyleNode && !observedStyles.has(node)) {
              const isModuleStyle =
                (node.href && node.href.includes(moduleUrl)) ||
                (node.tagName === 'STYLE' && node.textContent);

              if (isModuleStyle) {
                console.log(
                  `🎨 [Shadow Root ${moduleName}] New style detected:`,
                  node,
                );
                cloneStyleToShadowRoot(node, shadowRoot);
              }
            }
          }
        });
      });
    });

    // Observe changes in <head>
    styleObserver.observe(document.head, {
      childList: true,
      subtree: false,
    });

    console.log(`✅ [Shadow Root ${moduleName}] Style observation enabled`);
  }

  /**
   * Stops style observation
   */
  function stop() {
    if (styleObserver) {
      styleObserver.disconnect();
      styleObserver = null;
      // WeakSet doesn't have clear() method, so we create a new one
      observedStyles = new WeakSet();
      console.log(`✅ [Shadow Root ${moduleName}] Style observation disabled`);
    }
  }

  return {
    start,
    stop,
  };
}
