// Utility for detecting interactive elements in the DOM (e.g., buttons, inputs, links)
import type React from "react"
// Centralized logic for detecting interactive elements
export class InteractionDetector {
  private static readonly INTERACTIVE_TAGS = ["INPUT", "BUTTON", "SELECT", "TEXTAREA", "A"]
  private static readonly INTERACTIVE_CLASSES = [
    "supabase-auth-ui_ui-button",
    "supabase-auth-ui_ui-input",
    "supabase-auth-ui_ui-anchor",
    "supabase-auth-ui_ui-label",
  ]
  private static readonly INTERACTIVE_ROLES = ["button", "link", "textbox", "combobox", "checkbox", "radio"]

  static isInteractive(element: HTMLElement, containerRef?: React.RefObject<HTMLDivElement>): boolean {
    let current = element
    let depth = 0
    const maxDepth = 15 // Increased depth for nested Supabase components

    while (current && depth < maxDepth) {
      // Stop if we reach the container boundary
      if (containerRef?.current && current === containerRef.current) {
        break
      }

      // Check tag name
      if (this.INTERACTIVE_TAGS.includes(current.tagName)) {
        return true
      }

      // Check role attribute
      const role = current.getAttribute("role")
      if (role && this.INTERACTIVE_ROLES.includes(role)) {
        return true
      }

      // Safely get className as string
      const classNames = this.getClassNameAsString(current)

      // Check for Supabase Auth UI classes (more comprehensive)
      if (this.INTERACTIVE_CLASSES.some((cls) => classNames.includes(cls))) {
        return true
      }

      // Check for any class that contains "button", "input", "form", or "auth"
      if (
        classNames.includes("button") ||
        classNames.includes("input") ||
        classNames.includes("form") ||
        classNames.includes("auth") ||
        classNames.includes("ui-")
      ) {
        return true
      }

      // Check for clickable indicators
      if (current.onclick || current.style.cursor === "pointer") {
        return true
      }

      // Check for form elements or form containers
      if (current.closest("form") || current.tagName === "FORM") {
        return true
      }

      // Check for contentEditable
      if (current.contentEditable === "true") {
        return true
      }

      // Check for tabindex (focusable elements)
      if (current.hasAttribute("tabindex") && current.getAttribute("tabindex") !== "-1") {
        return true
      }

      // Check for data attributes that suggest interactivity
      if (current.hasAttribute("data-testid") || current.hasAttribute("data-supabase-element")) {
        return true
      }

      current = current.parentElement as HTMLElement
      depth++
    }

    return false
  }

  private static getClassNameAsString(element: HTMLElement): string {
    try {
      // Handle different types of className (string, SVGAnimatedString, etc.)
      if (typeof element.className === "string") {
        return element.className.toLowerCase()
      } else if (
        element.className &&
        typeof (element.className as { baseVal?: unknown }).baseVal === "string"
      ) {
        // SVG elements have className.baseVal
        return ((element.className as { baseVal: string }).baseVal).toLowerCase()
      } else if (
        element.className &&
        typeof (element.className as { animVal?: unknown }).animVal === "string"
      ) {
        // SVG elements also have className.animVal
        return ((element.className as { animVal: string }).animVal).toLowerCase()
      } else {
        // Fallback: use classList if available
        return element.classList ? Array.from(element.classList).join(" ").toLowerCase() : ""
      }
    } catch (error) {
      // If all else fails, return empty string
      return ""
    }
  }

  static getElementInfo(element: HTMLElement): object {
    return {
      tagName: element.tagName,
      className: this.getClassNameAsString(element),
      id: element.id,
      role: element.getAttribute("role"),
      type: element.getAttribute("type"),
      cursor: window.getComputedStyle(element).cursor,
      hasOnClick: !!element.onclick,
    }
  }
}
