/* eslint-disable no-param-reassign */

const ON_RENDER = Symbol('on render internal callback');
const DO_RENDER = Symbol('do render internal method');
const LIFECYCLE_STATE = Symbol('lifecycle state inner prop');

export class Component {
  [LIFECYCLE_STATE] = 'new';

  constructor(props) {
    this.props = props;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this[DO_RENDER]();
  }

  [DO_RENDER]() {
    if (this[ON_RENDER]) {
      this[ON_RENDER](this.render());
      if (this[LIFECYCLE_STATE] === 'new') {
        this[LIFECYCLE_STATE] = 'mount';
        this.componentDidMount();
      }
    }
  }

  componentDidMount() { return this; }

  render() { return this; }
}

export const createRef = () => ({ current: null });

export const createElement = (tagName) => (children) => {
  if (typeof children === 'string' || typeof children === 'number') {
    const textNode = document.createTextNode(children);
    const element = document.createElement(tagName);
    element.appendChild(textNode);
    return element;
  }
  if (children === undefined || children === null) {
    return document.createElement(tagName);
  }
  if (children instanceof Array) {
    const element = document.createElement(tagName);
    children.forEach((el) => {
      if (el instanceof Component) {
        let oldElement;
        el[ON_RENDER] = (newElement) => {
          if (!oldElement) {
            element.appendChild(newElement);
          } else {
            element.replaceChild(newElement, oldElement);
          }
          oldElement = newElement;
        };
        el = el[DO_RENDER]();
      } else {
        element.appendChild(el);
      }
    });
    return element;
  }
  if (children instanceof Component) {
    const element = document.createElement(tagName);
    element.appendChild(children[DO_RENDER]());
    return element;
  }
  const element = document.createElement(tagName);
  element.appendChild(children);
  return element;
};

const allEventListeners = new WeakMap();
const elementRefs = new WeakMap();

export const tag = (tagName) => (props = {}) => (children) => {
  const element = createElement(tagName)(children);
  const propsArray = Object.entries(props);
  propsArray.forEach(([key, value]) => {
    switch (key) {
      case 'className':
        element.className = value;
        break;
      case 'onClick': {
        if (!value) break;
        element.addEventListener('click', value);
        const eventListeners = allEventListeners.get(element) ?? [];
        eventListeners.push(['click', value]);
        allEventListeners.set(element, eventListeners);
        break;
      }
      case 'onMouseDown': {
        if (!value) break;
        element.addEventListener('mousedown', value);
        const eventListeners = allEventListeners.get(element) ?? [];
        eventListeners.push(['mousedown', value]);
        allEventListeners.set(element, eventListeners);
        break;
      }
      case 'onMouseUp': {
        if (!value) break;
        element.addEventListener('mouseup', value);
        const eventListeners = allEventListeners.get(element) ?? [];
        eventListeners.push(['mouseup', value]);
        allEventListeners.set(element, eventListeners);
        break;
      }

      case 'onChange': {
        if (tagName === 'input' || tagName === 'select') {
          if (!value) break;
          const handler = (e) => value(e.target.value);
          element.addEventListener('input', handler);
          const eventListeners = allEventListeners.get(element) ?? [];
          eventListeners.push(['input', handler]);
          allEventListeners.set(element, eventListeners);
        } else {
          element.setAttribute(key, value);
        }
        break;
      }

      case 'value':
        if (tagName === 'textarea') {
          element.appendChild(document.createTextNode(value));
        } else if (tagName === 'select') {
          element.value = value;
        } else {
          element.setAttribute(key, value);
        }
        break;
      case 'ref':
        value.current = element;
        elementRefs.set(element, value);
        break;
      default:
        element.setAttribute(key, value);
    }
  });

  return element;
};

const propsToCopy = ['className', 'placeholder', 'value'];

const syncTrees = (oldTree, newTree) => {
  if (oldTree?.nodeName === newTree?.nodeName) {
    const oldTreeEventListeners = allEventListeners.get(oldTree) ?? [];
    const newTreeEventListeners = allEventListeners.get(newTree) ?? [];

    oldTreeEventListeners.forEach(([eventName, handler]) => {
      oldTree.removeEventListener(eventName, handler, false);
    });
    newTreeEventListeners.forEach(([eventName, handler]) => {
      oldTree.addEventListener(eventName, handler);
    });
    allEventListeners.set(oldTree, newTreeEventListeners);
    propsToCopy.forEach((propName) => {
      oldTree[propName] = newTree[propName];
    });
    if (newTree.style?.cssText) {
      oldTree.style.cssText = newTree.style.cssText;
    }

    if (oldTree.nodeName === '#text' && newTree.nodeName === '#text') {
      return newTree;
    }
    if (oldTree.nodeName === 'TEXTAREA') {
      const { selectionStart, selectionEnd } = oldTree;
      oldTree.value = newTree.value;
      oldTree.selectionStart = selectionStart;
      oldTree.selectionEnd = selectionEnd;
    }

    [...newTree.childNodes].forEach((child, index) => {
      const newChild = syncTrees(oldTree.childNodes[index], child);
      if (newChild !== oldTree.childNodes[index]) {
        oldTree.replaceChild(newChild, oldTree.childNodes[index]);
      }

      if (elementRefs.get(oldTree.childNodes[index])) {
        elementRefs.get(oldTree.childNodes[index]).current = oldTree.childNodes[index];
      }
    });
    return oldTree;
  }
  return newTree;
};

export const render = (element, domNode) => {
  let oldMarkup = [];

  element[ON_RENDER] = (newMarkup) => {
    const newTree = syncTrees(oldMarkup, newMarkup);
    if (newTree !== oldMarkup) {
      domNode.innerHTML = '';
      domNode.appendChild(newTree);
    }
    oldMarkup = newTree;
  };
  element[DO_RENDER]();
};
