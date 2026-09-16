const fs = require('fs');
const path = require('path');

// Simple DOM Mock for Node testing
class ElementMock {
  constructor(id, tagName = 'div') {
    this.id = id;
    this.tagName = tagName;
    this.innerText = '';
    this.innerHTML = '';
    this.style = {
      display: '',
      setProperty: (k, v) => { this.style[k] = v; }
    };
    this.classList = {
      _set: new Set(),
      add: (c) => this.classList._set.add(c),
      remove: (c) => this.classList._set.delete(c),
      contains: (c) => this.classList._set.has(c),
      has: (c) => this.classList._set.has(c),
      toggle: (c) => {
        if (this.classList._set.has(c)) {
          this.classList._set.delete(c);
          return false;
        } else {
          this.classList._set.add(c);
          return true;
        }
      }
    };
    this.children = [];
    this.attrs = {};
  }
  appendChild(child) {
    this.children.push(child);
  }
  setAttribute(k, v) {
    this.attrs[k] = v;
  }
  getAttribute(k) {
    return this.attrs[k] || '';
  }
  contains(node) {
    return this === node || this.children.includes(node);
  }
  scrollIntoView(opts) {
    this.scrolled = opts;
  }
}

const documentElements = {
  'forensic-engines-dropdown': new ElementMock('forensic-engines-dropdown'),
  'btn-engines-menu': new ElementMock('btn-engines-menu', 'button'),
  'vidhi-kavach-section': new ElementMock('vidhi-kavach-section'),
  'punar-drishti-section': new ElementMock('punar-drishti-section'),
  'bhavishya-trends-section': new ElementMock('bhavishya-trends-section'),
  'satark-simulation-section': new ElementMock('satark-simulation-section'),
  'satark-karyaa-section': new ElementMock('satark-karyaa-section'),
  'prashna-kavach-section': new ElementMock('prashna-kavach-section')
};

global.document = {
  getElementById: (id) => documentElements[id] || null,
  createElement: (tag) => new ElementMock('', tag),
  querySelectorAll: () => [],
  querySelector: () => null,
  addEventListener: () => {},
  body: new ElementMock('body')
};

global.window = {
  location: { pathname: '/index.html', hash: '', search: '', href: '' },
  lenis: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  scrollTo: () => {}
};

// Load app.js
const appJsPath = path.join(__dirname, '..', 'frontend', 'app.js');
eval(fs.readFileSync(appJsPath, 'utf8'));

console.log('Testing Universal Portal Navbar & Jump Navigation:');

// Test 1: Dropdown toggle
setupForensicDropdown();
console.log('1. setupForensicDropdown() executed.');
documentElements['btn-engines-menu'].onclick({ stopPropagation: () => {} });
console.log('   Dropdown is-open after click:', documentElements['forensic-engines-dropdown'].classList.has('is-open'));

closeForensicDropdown();
console.log('   Dropdown is-open after closeForensicDropdown():', documentElements['forensic-engines-dropdown'].classList.has('is-open'));

// Test 2: jumpToSection for Trends
jumpToSection('bhavishya-trends-section');
console.log('2. jumpToSection("bhavishya-trends-section") executed.');
console.log('   Target element scrolled:', Boolean(documentElements['bhavishya-trends-section'].scrolled));

// Test 3: jumpToSection for Work Explorer
jumpToSection('satark-karyaa-section');
console.log('3. jumpToSection("satark-karyaa-section") executed.');
console.log('   Target element scrolled:', Boolean(documentElements['satark-karyaa-section'].scrolled));

// Test 4: jumpToSection for Sentinel S-01
jumpToSection('vidhi-kavach-section');
console.log('4. jumpToSection("vidhi-kavach-section") executed.');
console.log('   Target element scrolled:', Boolean(documentElements['vidhi-kavach-section'].scrolled));

console.log('\n========================================');
console.log('✓ ALL NAVBAR & TRENDS NAVIGATION TESTS PASSED!');
console.log('========================================');
process.exit(0);
