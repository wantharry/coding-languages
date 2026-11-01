import { CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { Product, ProductCardComponent } from './product-card.component';

/**
 * ComponentsDemoComponent — the "smart"/container parent.
 *
 * It owns the state (`products`, `cart`) and the logic for what happens
 * when a child says "add to cart". The child (ProductCardComponent) is
 * intentionally kept ignorant of carts, totals, or where products come
 * from — all it knows is "render this one product, emit when its button
 * is clicked". That separation (container/presentational, aka
 * smart/dumb components) is a very common senior-interview talking point
 * because it's the main lever for making components reusable and testable
 * in isolation.
 */
@Component({
  selector: 'app-components-demo',
  standalone: true,
  imports: [ProductCardComponent, CurrencyPipe],
  template: `
    <h2>Components: &#64;Input down, &#64;Output up</h2>
    <p>
      <code>&lt;app-product-card&gt;</code> below is a reusable child. The parent passes each
      <code>Product</code> in via the <code>[product]</code> input binding; the child never
      fetches or knows about the full catalog. When its button is clicked, it emits
      <code>(addToCart)</code> and the <em>parent</em> decides what that means (push onto a cart
      array). The child has zero knowledge that a cart even exists.
    </p>

    <div class="catalog">
      @for (product of products; track product.id) {
        <app-product-card [product]="product" (addToCart)="onAddToCart($event)" />
      }
    </div>

    <h3>Cart ({{ cart.length }} item(s))</h3>
    @if (cart.length === 0) {
      <p><em>Nothing in the cart yet — click "Add to cart" above.</em></p>
    } @else {
      <ul>
        @for (item of cart; track $index) {
          <li>{{ item.name }} — {{ item.price | currency }}</li>
        }
      </ul>
    }
  `,
})
export class ComponentsDemoComponent {
  products: Product[] = [
    { id: 1, name: 'Mechanical Keyboard', price: 129 },
    { id: 2, name: 'Ultrawide Monitor', price: 449 },
    { id: 3, name: 'Ergonomic Chair', price: 319 },
  ];

  cart: Product[] = [];

  // This is the handler the parent wires up to the child's @Output. The
  // child only knows "something happened"; the parent decides the
  // consequence. Note: we create a NEW array rather than `this.cart.push`
  // in place — see the change-detection demo for why that habit matters
  // once OnPush is involved.
  onAddToCart(product: Product): void {
    this.cart = [...this.cart, product];
  }
}
