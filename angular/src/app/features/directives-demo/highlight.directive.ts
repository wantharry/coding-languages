import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

/**
 * appHighlight — a custom ATTRIBUTE directive (as opposed to a
 * STRUCTURAL directive like *ngFor/@for, which adds/removes elements from
 * the DOM; an attribute directive changes the appearance/behavior of an
 * existing element without adding or removing it).
 *
 * This is the canonical "write your own directive" interview exercise:
 * it listens to host events with @HostListener, accepts configuration
 * via @Input, and manipulates the host element through Renderer2 rather
 * than touching `ElementRef.nativeElement` directly.
 *
 * WHY Renderer2 instead of `this.el.nativeElement.style.backgroundColor =
 * ...`: direct DOM manipulation only works when Angular is actually
 * running in a real browser DOM. Renderer2 is a platform-agnostic
 * abstraction, so the same directive still works correctly under
 * server-side rendering (Angular Universal) or a web-worker renderer,
 * where `nativeElement` may not be a real DOM node at all. It's a detail
 * that's easy to skip in a toy example but is exactly what separates a
 * "seen the tutorial" answer from a "actually understands the renderer
 * abstraction" answer in an interview.
 */
@Directive({
  selector: '[appHighlight]',
  standalone: true,
})
export class HighlightDirective {
  // Lets consumers write `<p appHighlight="#ffefc2">` to customize the
  // highlight color, defaulting if they just write bare `appHighlight`.
  @Input() appHighlight = '#fff6b3';

  constructor(
    private readonly el: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2
  ) {}

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.renderer.setStyle(this.el.nativeElement, 'background-color', this.appHighlight);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.renderer.removeStyle(this.el.nativeElement, 'background-color');
  }
}
