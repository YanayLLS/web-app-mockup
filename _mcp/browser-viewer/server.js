#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { chromium } from 'playwright';

// ==================== STATE ====================
let browser = null;
let page = null;
const consoleLogs = [];
const MAX_LOGS = 200;

// ==================== HELPERS ====================
function ensureBrowser() {
  if (!browser || !page) throw new Error('Browser not open. Call browser_open first.');
}

async function takeScreenshot(opts = {}) {
  const { selector, fullPage = false } = opts;
  let buf;
  if (selector) {
    const el = await page.$(selector);
    if (!el) throw new Error(`Element not found: ${selector}`);
    buf = await el.screenshot({ type: 'png' });
  } else {
    buf = await page.screenshot({ type: 'png', fullPage });
  }
  return { type: 'image', data: buf.toString('base64'), mimeType: 'image/png' };
}

async function navigateTo(url) {
  await page.goto(url, { waitUntil: 'load', timeout: 30000 });
  // Extra wait for SPA rendering (React, etc.)
  await page.waitForTimeout(800);
}

// ==================== SERVER ====================
const server = new Server(
  { name: 'browser-viewer', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// ==================== TOOL DEFINITIONS ====================
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'browser_open',
      description: 'Launch Chrome browser and optionally navigate to a URL. Returns a screenshot of the page. Pass headless:false to see the browser window.',
      inputSchema: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'URL to open (e.g., http://localhost:5173)' },
          headless: { type: 'boolean', description: 'Run headless without visible window (default: true)' },
          width: { type: 'number', description: 'Viewport width in pixels (default: 1440)' },
          height: { type: 'number', description: 'Viewport height in pixels (default: 900)' },
        },
      },
    },
    {
      name: 'browser_navigate',
      description: 'Navigate to a URL. Returns screenshot after page loads. For SPAs, this does a full page navigation.',
      inputSchema: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'URL to navigate to' },
        },
        required: ['url'],
      },
    },
    {
      name: 'browser_screenshot',
      description: 'Take a screenshot of the current page or a specific element.',
      inputSchema: {
        type: 'object',
        properties: {
          selector: { type: 'string', description: 'CSS selector for element screenshot (omit for full viewport)' },
          fullPage: { type: 'boolean', description: 'Capture full scrollable page instead of viewport (default: false)' },
        },
      },
    },
    {
      name: 'browser_click',
      description: 'Click on an element by CSS selector, text content, or coordinates. Highlights the target briefly before clicking. Returns screenshot after click.',
      inputSchema: {
        type: 'object',
        properties: {
          selector: { type: 'string', description: 'CSS selector to click (e.g., "button.submit", "#login", "text=Sign In")' },
          x: { type: 'number', description: 'X coordinate (use with y instead of selector)' },
          y: { type: 'number', description: 'Y coordinate (use with x instead of selector)' },
          doubleClick: { type: 'boolean', description: 'Double-click instead of single click' },
          button: { type: 'string', enum: ['left', 'right', 'middle'], description: 'Mouse button (default: left)' },
        },
      },
    },
    {
      name: 'browser_type',
      description: 'Type text into an input element or the currently focused element. Returns screenshot.',
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'Text to type' },
          selector: { type: 'string', description: 'CSS selector of input element (omit to type into focused element)' },
          clear: { type: 'boolean', description: 'Clear existing text before typing (default: false)' },
          pressEnter: { type: 'boolean', description: 'Press Enter after typing (default: false)' },
        },
        required: ['text'],
      },
    },
    {
      name: 'browser_press_key',
      description: 'Press a keyboard key or shortcut. Returns screenshot.',
      inputSchema: {
        type: 'object',
        properties: {
          key: { type: 'string', description: 'Key to press: Enter, Tab, Escape, ArrowDown, ArrowUp, Backspace, Delete, Space, F1-F12, or combo like Control+a, Shift+Tab' },
        },
        required: ['key'],
      },
    },
    {
      name: 'browser_hover',
      description: 'Hover over an element to trigger hover states, tooltips, dropdowns. Returns screenshot.',
      inputSchema: {
        type: 'object',
        properties: {
          selector: { type: 'string', description: 'CSS selector to hover over' },
        },
        required: ['selector'],
      },
    },
    {
      name: 'browser_scroll',
      description: 'Scroll the page or a specific scrollable element. Returns screenshot.',
      inputSchema: {
        type: 'object',
        properties: {
          direction: { type: 'string', enum: ['up', 'down', 'left', 'right'], description: 'Scroll direction' },
          amount: { type: 'number', description: 'Pixels to scroll (default: 400)' },
          selector: { type: 'string', description: 'CSS selector of scrollable element (omit to scroll page)' },
        },
        required: ['direction'],
      },
    },
    {
      name: 'browser_evaluate',
      description: 'Execute JavaScript in the page context. Returns the result as JSON. Useful for reading page state, checking variables, or triggering actions.',
      inputSchema: {
        type: 'object',
        properties: {
          script: { type: 'string', description: 'JavaScript code to execute. Return a value to see it in the result.' },
        },
        required: ['script'],
      },
    },
    {
      name: 'browser_query',
      description: 'Query elements matching a CSS selector. Returns their tag, text, bounds, visibility, and attributes. Useful for understanding page structure without a screenshot.',
      inputSchema: {
        type: 'object',
        properties: {
          selector: { type: 'string', description: 'CSS selector to query' },
          limit: { type: 'number', description: 'Max elements to return (default: 10)' },
        },
        required: ['selector'],
      },
    },
    {
      name: 'browser_resize',
      description: 'Resize the browser viewport. Useful for testing responsive layouts. Returns screenshot.',
      inputSchema: {
        type: 'object',
        properties: {
          width: { type: 'number', description: 'New viewport width' },
          height: { type: 'number', description: 'New viewport height' },
        },
        required: ['width', 'height'],
      },
    },
    {
      name: 'browser_select_option',
      description: 'Select an option from a <select> dropdown. Returns screenshot.',
      inputSchema: {
        type: 'object',
        properties: {
          selector: { type: 'string', description: 'CSS selector of the <select> element' },
          value: { type: 'string', description: 'Option value to select' },
          label: { type: 'string', description: 'Option label/text to select (alternative to value)' },
        },
        required: ['selector'],
      },
    },
    {
      name: 'browser_drag',
      description: 'Drag an element from one position to another. Returns screenshot.',
      inputSchema: {
        type: 'object',
        properties: {
          sourceSelector: { type: 'string', description: 'CSS selector of element to drag' },
          targetSelector: { type: 'string', description: 'CSS selector of drop target' },
          sourceX: { type: 'number', description: 'Start X coordinate (alternative to sourceSelector)' },
          sourceY: { type: 'number', description: 'Start Y coordinate' },
          targetX: { type: 'number', description: 'End X coordinate (alternative to targetSelector)' },
          targetY: { type: 'number', description: 'End Y coordinate' },
        },
      },
    },
    {
      name: 'browser_wait',
      description: 'Wait for a selector to appear/disappear or for a timeout. Returns screenshot when done.',
      inputSchema: {
        type: 'object',
        properties: {
          selector: { type: 'string', description: 'CSS selector to wait for (omit to just wait the timeout)' },
          timeout: { type: 'number', description: 'Max wait time in ms (default: 5000)' },
          state: { type: 'string', enum: ['visible', 'hidden', 'attached', 'detached'], description: 'Element state to wait for (default: visible)' },
        },
      },
    },
    {
      name: 'browser_console',
      description: 'Get recent browser console log messages. Useful for debugging errors.',
      inputSchema: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Max messages to return (default: 30)' },
          level: { type: 'string', enum: ['all', 'log', 'warning', 'error', 'info', 'debug'], description: 'Filter by log level (default: all)' },
        },
      },
    },
    {
      name: 'browser_network',
      description: 'Get recent network requests. Useful for debugging API calls.',
      inputSchema: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Max requests to return (default: 20)' },
          urlPattern: { type: 'string', description: 'Filter by URL pattern (substring match)' },
          failed: { type: 'boolean', description: 'Show only failed requests' },
        },
      },
    },
    {
      name: 'browser_close',
      description: 'Close the browser and clean up resources.',
      inputSchema: { type: 'object', properties: {} },
    },
  ],
}));

// ==================== NETWORK TRACKING ====================
const networkRequests = [];
const MAX_NETWORK = 200;

function setupPageListeners(p) {
  p.on('console', msg => {
    consoleLogs.push({ level: msg.type(), text: msg.text(), ts: Date.now() });
    if (consoleLogs.length > MAX_LOGS) consoleLogs.shift();
  });
  p.on('request', req => {
    networkRequests.push({
      url: req.url(),
      method: req.method(),
      resourceType: req.resourceType(),
      ts: Date.now(),
      status: null,
      failed: false,
    });
    if (networkRequests.length > MAX_NETWORK) networkRequests.shift();
  });
  p.on('response', resp => {
    const entry = [...networkRequests].reverse().find(r => r.url === resp.url() && r.status === null);
    if (entry) entry.status = resp.status();
  });
  p.on('requestfailed', req => {
    const entry = [...networkRequests].reverse().find(r => r.url === req.url() && r.status === null);
    if (entry) { entry.failed = true; entry.status = req.failure()?.errorText || 'failed'; }
  });
}

// ==================== TOOL HANDLERS ====================
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    switch (name) {

      // ==================== browser_open ====================
      case 'browser_open': {
        if (browser) { await browser.close().catch(() => {}); browser = null; page = null; }
        consoleLogs.length = 0;
        networkRequests.length = 0;

        const width = args.width || 1440;
        const height = args.height || 900;
        const headless = args.headless ?? true;

        try {
          browser = await chromium.launch({ headless });
        } catch (err) {
          if (err.message.includes('xecutable') || err.message.includes('browser')) {
            throw new Error(
              'Playwright Chromium not installed. Run this in the _mcp/browser-viewer directory:\n' +
              '  npx playwright install chromium'
            );
          }
          throw err;
        }

        page = await browser.newPage({ viewport: { width, height } });
        setupPageListeners(page);

        if (args.url) {
          await navigateTo(args.url);
        }

        const img = await takeScreenshot();
        return {
          content: [
            img,
            { type: 'text', text: `Browser opened (${headless ? 'headless' : 'headed'}). Viewport: ${width}x${height}. URL: ${page.url()}` },
          ],
        };
      }

      // ==================== browser_navigate ====================
      case 'browser_navigate': {
        ensureBrowser();
        await navigateTo(args.url);
        const img = await takeScreenshot();
        return {
          content: [
            img,
            { type: 'text', text: `Navigated to ${page.url()}. Title: ${await page.title()}` },
          ],
        };
      }

      // ==================== browser_screenshot ====================
      case 'browser_screenshot': {
        ensureBrowser();
        const img = await takeScreenshot({ selector: args.selector, fullPage: args.fullPage });
        const info = args.selector
          ? `Screenshot of "${args.selector}"`
          : args.fullPage
            ? 'Full page screenshot'
            : 'Viewport screenshot';
        return {
          content: [
            img,
            { type: 'text', text: `${info}. URL: ${page.url()}` },
          ],
        };
      }

      // ==================== browser_click ====================
      case 'browser_click': {
        ensureBrowser();
        let target = '';

        if (args.selector) {
          target = args.selector;
          // Briefly highlight the target element
          await page.evaluate(sel => {
            const el = document.querySelector(sel);
            if (el) {
              const prev = { outline: el.style.outline, outlineOffset: el.style.outlineOffset };
              el.style.outline = '3px solid #FF1F1F';
              el.style.outlineOffset = '2px';
              setTimeout(() => { el.style.outline = prev.outline; el.style.outlineOffset = prev.outlineOffset; }, 600);
            }
          }, args.selector).catch(() => {});
          await page.waitForTimeout(150);

          const clickOpts = {};
          if (args.button) clickOpts.button = args.button;
          if (args.doubleClick) {
            await page.dblclick(args.selector, clickOpts);
          } else {
            await page.click(args.selector, clickOpts);
          }
        } else if (args.x !== undefined && args.y !== undefined) {
          target = `(${args.x}, ${args.y})`;
          const clickOpts = {};
          if (args.button) clickOpts.button = args.button;
          if (args.doubleClick) {
            await page.mouse.dblclick(args.x, args.y, clickOpts);
          } else {
            await page.mouse.click(args.x, args.y, clickOpts);
          }
        } else {
          throw new Error('Provide either a selector or x,y coordinates');
        }

        await page.waitForTimeout(300);
        const img = await takeScreenshot();
        return {
          content: [
            img,
            { type: 'text', text: `Clicked ${target}${args.doubleClick ? ' (double)' : ''}` },
          ],
        };
      }

      // ==================== browser_type ====================
      case 'browser_type': {
        ensureBrowser();
        if (args.selector) {
          if (args.clear) {
            await page.fill(args.selector, '');
          }
          await page.click(args.selector);
          await page.keyboard.type(args.text, { delay: 30 });
        } else {
          await page.keyboard.type(args.text, { delay: 30 });
        }
        if (args.pressEnter) {
          await page.keyboard.press('Enter');
        }
        await page.waitForTimeout(200);
        const img = await takeScreenshot();
        return {
          content: [
            img,
            { type: 'text', text: `Typed "${args.text.length > 50 ? args.text.slice(0, 50) + '...' : args.text}"${args.pressEnter ? ' + Enter' : ''}` },
          ],
        };
      }

      // ==================== browser_press_key ====================
      case 'browser_press_key': {
        ensureBrowser();
        await page.keyboard.press(args.key);
        await page.waitForTimeout(200);
        const img = await takeScreenshot();
        return {
          content: [
            img,
            { type: 'text', text: `Pressed ${args.key}` },
          ],
        };
      }

      // ==================== browser_hover ====================
      case 'browser_hover': {
        ensureBrowser();
        await page.hover(args.selector);
        await page.waitForTimeout(300);
        const img = await takeScreenshot();
        return {
          content: [
            img,
            { type: 'text', text: `Hovered over ${args.selector}` },
          ],
        };
      }

      // ==================== browser_scroll ====================
      case 'browser_scroll': {
        ensureBrowser();
        const amount = args.amount || 400;
        const deltas = { up: [0, -amount], down: [0, amount], left: [-amount, 0], right: [amount, 0] };
        const [dx, dy] = deltas[args.direction];

        if (args.selector) {
          await page.evaluate(({ sel, dx, dy }) => {
            const el = document.querySelector(sel);
            if (el) el.scrollBy(dx, dy);
          }, { sel: args.selector, dx, dy });
        } else {
          await page.evaluate(({ dx, dy }) => window.scrollBy(dx, dy), { dx, dy });
        }

        await page.waitForTimeout(200);
        const img = await takeScreenshot();
        return {
          content: [
            img,
            { type: 'text', text: `Scrolled ${args.direction} ${amount}px${args.selector ? ` on ${args.selector}` : ''}` },
          ],
        };
      }

      // ==================== browser_evaluate ====================
      case 'browser_evaluate': {
        ensureBrowser();
        const result = await page.evaluate(args.script);
        const text = result === undefined ? 'undefined' : JSON.stringify(result, null, 2);
        return {
          content: [{ type: 'text', text }],
        };
      }

      // ==================== browser_query ====================
      case 'browser_query': {
        ensureBrowser();
        const limit = args.limit || 10;
        const elements = await page.evaluate(({ sel, lim }) => {
          const els = Array.from(document.querySelectorAll(sel)).slice(0, lim);
          return els.map((el, i) => {
            const rect = el.getBoundingClientRect();
            const cs = window.getComputedStyle(el);
            return {
              index: i,
              tag: el.tagName.toLowerCase(),
              id: el.id || undefined,
              classes: el.className && typeof el.className === 'string'
                ? el.className.split(' ').filter(Boolean).slice(0, 8)
                : [],
              text: (el.textContent || '').trim().slice(0, 300),
              innerText: (el.innerText || '').trim().slice(0, 300),
              bounds: {
                x: Math.round(rect.x), y: Math.round(rect.y),
                w: Math.round(rect.width), h: Math.round(rect.height),
              },
              visible: cs.display !== 'none' && cs.visibility !== 'hidden' && rect.width > 0 && rect.height > 0,
              attrs: Object.fromEntries(
                Array.from(el.attributes)
                  .filter(a => !['class', 'id', 'style'].includes(a.name))
                  .slice(0, 15)
                  .map(a => [a.name, a.value.slice(0, 200)])
              ),
            };
          });
        }, { sel: args.selector, lim: limit });

        return {
          content: [{ type: 'text', text: JSON.stringify(elements, null, 2) }],
        };
      }

      // ==================== browser_resize ====================
      case 'browser_resize': {
        ensureBrowser();
        await page.setViewportSize({ width: args.width, height: args.height });
        await page.waitForTimeout(300);
        const img = await takeScreenshot();
        return {
          content: [
            img,
            { type: 'text', text: `Viewport resized to ${args.width}x${args.height}` },
          ],
        };
      }

      // ==================== browser_select_option ====================
      case 'browser_select_option': {
        ensureBrowser();
        if (args.label) {
          await page.selectOption(args.selector, { label: args.label });
        } else if (args.value) {
          await page.selectOption(args.selector, args.value);
        } else {
          throw new Error('Provide either value or label');
        }
        await page.waitForTimeout(200);
        const img = await takeScreenshot();
        return {
          content: [
            img,
            { type: 'text', text: `Selected option in ${args.selector}` },
          ],
        };
      }

      // ==================== browser_drag ====================
      case 'browser_drag': {
        ensureBrowser();
        if (args.sourceSelector && args.targetSelector) {
          await page.dragAndDrop(args.sourceSelector, args.targetSelector);
        } else if (args.sourceX !== undefined && args.targetX !== undefined) {
          await page.mouse.move(args.sourceX, args.sourceY);
          await page.mouse.down();
          await page.mouse.move(args.targetX, args.targetY, { steps: 10 });
          await page.mouse.up();
        } else {
          throw new Error('Provide either source/target selectors or source/target x,y coordinates');
        }
        await page.waitForTimeout(300);
        const img = await takeScreenshot();
        return {
          content: [
            img,
            { type: 'text', text: 'Drag completed' },
          ],
        };
      }

      // ==================== browser_wait ====================
      case 'browser_wait': {
        ensureBrowser();
        const timeout = args.timeout || 5000;
        if (args.selector) {
          const state = args.state || 'visible';
          await page.waitForSelector(args.selector, { state, timeout });
        } else {
          await page.waitForTimeout(timeout);
        }
        const img = await takeScreenshot();
        return {
          content: [
            img,
            { type: 'text', text: args.selector ? `${args.selector} is now ${args.state || 'visible'}` : `Waited ${timeout}ms` },
          ],
        };
      }

      // ==================== browser_console ====================
      case 'browser_console': {
        const limit = args.limit || 30;
        const level = args.level || 'all';
        const filtered = level === 'all' ? consoleLogs : consoleLogs.filter(l => l.level === level);
        const msgs = filtered.slice(-limit).map(l => {
          const time = new Date(l.ts).toLocaleTimeString();
          return `[${time}] [${l.level}] ${l.text}`;
        }).join('\n');
        return {
          content: [{ type: 'text', text: msgs || '(no console messages)' }],
        };
      }

      // ==================== browser_network ====================
      case 'browser_network': {
        const limit = args.limit || 20;
        let filtered = [...networkRequests];
        if (args.urlPattern) {
          filtered = filtered.filter(r => r.url.includes(args.urlPattern));
        }
        if (args.failed) {
          filtered = filtered.filter(r => r.failed || (typeof r.status === 'number' && r.status >= 400));
        }
        const result = filtered.slice(-limit).map(r => ({
          method: r.method,
          url: r.url.length > 120 ? r.url.slice(0, 120) + '...' : r.url,
          type: r.resourceType,
          status: r.status,
          failed: r.failed,
        }));
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      // ==================== browser_close ====================
      case 'browser_close': {
        if (browser) {
          await browser.close().catch(() => {});
          browser = null;
          page = null;
        }
        consoleLogs.length = 0;
        networkRequests.length = 0;
        return {
          content: [{ type: 'text', text: 'Browser closed.' }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (err) {
    return {
      content: [{ type: 'text', text: `Error: ${err.message}` }],
      isError: true,
    };
  }
});

// ==================== CLEANUP ====================
async function cleanup() {
  if (browser) {
    await browser.close().catch(() => {});
    browser = null;
    page = null;
  }
}
process.on('SIGINT', async () => { await cleanup(); process.exit(0); });
process.on('SIGTERM', async () => { await cleanup(); process.exit(0); });
process.on('exit', () => { if (browser) browser.close().catch(() => {}); });

// ==================== START ====================
const transport = new StdioServerTransport();
await server.connect(transport);
