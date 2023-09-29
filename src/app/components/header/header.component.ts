import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, Subject, EMPTY, concat, of } from 'rxjs';
import { debounceTime, delay, switchMap, tap, catchError, map, share, take, filter, distinctUntilChanged } from 'rxjs/operators';
import { ProductService } from 'src/app/_service/product.service';
import { Product } from 'src/app/interface/product';
import { EventEmitter, Output } from '@angular/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  @Input() bradcrumb!: any;
  Products$: Observable<Product[]>;
  ProductInput$: Subject<string>;
  ProductSearchLoading: boolean;
  SelectedProduct?: Product;

  @Output() tabSelected: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private router: Router,
    private auth: AngularFireAuth,
    private productService: ProductService,
  ) {
    this.ProductInput$ = new Subject<string>();
    this.ProductSearchLoading = false;
    this.SelectedProduct = undefined;
    this.Products$ = this.ProductInput$.pipe(
      filter(res => {
        return res !== null && res.length >= 1
      }),
      distinctUntilChanged(),
      debounceTime(500),
      tap(() => this.ProductSearchLoading = true),
      switchMap(term => {
        return this.productService.searchProduct({
          Markets: ["US"],
          Keyword: term
        }).pipe(
          catchError(() => of([])), // empty list on error
          tap(() => this.ProductSearchLoading = false)
        )
      })
    );
  }

  isMenuCollapsed = false as boolean;
  displayName = '' as any;

  toggleCollapseMenu(): void {
    this.isMenuCollapsed = !this.isMenuCollapsed;
    console.log("clicked")
  }

  selectTab(tab: string) {
    this.tabSelected.emit(tab);
  }
  sidebar_show(): void {
    // alert("hello world");
    $('.LftMain').toggleClass('display_custom');
    $('.RgtMain').toggleClass('display_width');
  }
  logoutUser(): void {
    localStorage.removeItem('firebase-uid');
    localStorage.removeItem('displayname');
    localStorage.removeItem('user-credential');
    this.router.navigate(['/']);
  }

  searchProductTrackByFn(item: Product) {
    return item.ProductId;
  }

  onProductSelected(item: Product) {
    console.log(item.Symbol);
    console.log(this.SelectedProduct);
  }

  ngOnInit(): void {
    this.displayName = (localStorage.getItem('displayname') !== null ? localStorage.getItem('displayname') : '');
  }
}