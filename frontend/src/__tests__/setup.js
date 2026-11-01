import '@testing-library/jest-dom'

class MockIntersectionObserver {
  static instances = []

  constructor(callback) {
    this.callback = callback
    this.elements = []
    MockIntersectionObserver.instances.push(this)
  }

  observe(element) {
    this.elements.push(element)
  }

  unobserve(element) {
    this.elements = this.elements.filter((el) => el !== element)
  }

  disconnect() {
    this.elements = []
  }

  intersect(element) {
    const index = this.elements.indexOf(element)
    if (index < 0) {
      return
    }
    this.callback([{ isIntersecting: true, target: element }])
    this.unobserve(element)
  }
}

if (typeof window !== 'undefined') {
  window.IntersectionObserver = MockIntersectionObserver

  window.matchMedia = window.matchMedia || function (query) {
    return {
      matches: false,
      media: query,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent() {
        return false
      }
    }
  }
}

if (typeof SVGElement !== 'undefined') {
  SVGElement.prototype.getTotalLength = SVGElement.prototype.getTotalLength || function () {
    return 0
  }
}
