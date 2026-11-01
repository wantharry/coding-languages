import { CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface Product {
  id: number;
  name: string;
  price: number;
}

/**
 * ProductCardComponent — the "dumb"/presentational child in a classic
 * parent-child pair.
 *
 * WHY @Input/@Output and not something else:
 * - @Input is how data flows DOWN the component tree. The child never
 *   reaches up into its parent to read state; the parent hands it down
 *   explicitly through a property binding. That keeps the child reusable
 *   and easy to reason about — it only knows about the `Product` it was
 *   given, not where that product came from.
 * - @Output (backed by an `EventEmitter`) is how data/events flow UP. The
 *   child doesn't know or care who's listening, or what they'll do with
 *   the event — it just emits "this happened" and lets the parent decide.
 *
 * This down-data / up-events discipline is what interviewers are really
 * asking about when they say "explain component communication in
 * Angular" — it's the same one-way-data-flow idea React calls "props down,
 * callbacks up".
 */
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <div class="card">
      <h3>{{ product.name }}</h3>
      <p class="price">{{ product.price | currency }}</p>
      <button type="button" (click)="addToCart.emit(product)">Add to cart</button>
    </div>
  `,
  styles: [
    `
      .card {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 1rem;
        width: 180px;
        display: inline-block;
        margin: 0 0.75rem 0.75rem 0;
        text-align: center;
      }
      .price {
        color: #3730a3;
        font-weight: 600;
      }
      button {
        cursor: pointer;
      }
    `,
  ],
})
export class ProductCardComponent {
  // `product` is required data handed down from the parent. Angular sets
  // @Input properties AFTER the constructor runs and BEFORE ngOnInit — see
  // the lifecycle-demo page for why that timing matters.
  @Input({ required: true }) product!: Product;

  // The generic type on EventEmitter is the payload type consumers of
  // (addToCart)="..." will receive as $event.
  @Output() addToCart = new EventEmitter<Product>();
}
