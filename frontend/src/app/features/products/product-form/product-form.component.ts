import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AsyncValidatorFn, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { Product } from '../../../shared/interfaces/product.interface';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent implements OnInit, OnChanges {
  @Input() product: Product | null = null;
  @Output() formSubmitted = new EventEmitter<void>();
  backendBaseUrl = 'http://localhost:3000';

  productForm!: FormGroup;
  isEditMode = false;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private route: ActivatedRoute,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.productForm = this.fb.group({
      master_sku: ['', [Validators.required], [this.skuValidator()]],
      name: ['', Validators.required],
      description: [''],
      price: [null, [Validators.required, Validators.min(0)]],
      quantity: [null, [Validators.required, Validators.min(0)]],
      image_url: [''],
      is_banned: [false]
    });

    // If product ID is in route params (page edit)
    if (this.route.snapshot.params['id']) {
      this.isEditMode = true;
      const productId = this.route.snapshot.params['id'];
      this.productService.getProduct(productId).subscribe(product => {
        const { image_url, ...productWithoutImage } = product;
        this.productForm.patchValue(productWithoutImage);
        this.product = product; // Store for later use if needed
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && changes['product'].currentValue) {
      // If product is passed as input (modal edit)
      console.log('Product received in modal:', changes['product'].currentValue);
      this.isEditMode = true;
      if (this.productForm) { // Ensure form is initialized
        const { image_url, ...productWithoutImage } = changes['product'].currentValue;
        this.productForm.patchValue(productWithoutImage);
      }
    }
  }

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      this.selectedFile = fileList[0];
    }
  }

  skuValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.valueChanges || control.pristine) {
        return of(null);
      }
      return control.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(sku => {
          // If in edit mode and SKU hasn't changed, no validation needed
          if (this.isEditMode && this.product && this.product.master_sku === sku) {
            return of(null);
          }
          return this.productService.checkSkuExists(sku).pipe(
            map(response => (response.exists ? { skuTaken: true } : null)),
            catchError(() => of(null)) // Handle error, e.g., network issue, by not showing validation error
          );
        })
      );
    };
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      return;
    }

    const formData = new FormData();
    Object.keys(this.productForm.value).forEach(key => {
      console.log('key', key)
      if (key === 'is_banned') {
        formData.append(key, this.productForm.value[key] ? '1' : '0');
      } else if (key === 'image_url' && this.selectedFile) {
        // Do not append image_url from form if a file is selected, as it will be appended separately
      }
      else {
        formData.append(key, this.productForm.value[key]);
      }
    });

    if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    }

    this.saveProduct(formData);
  }

  private saveProduct(formData: FormData): void {
    if (this.isEditMode && this.product) {
      console.log('Updating product with ID:', this.product.id);
      this.productService.updateProduct(this.product.id!, formData).subscribe(() => {
        this.formSubmitted.emit();
        if (!this.product) { // Only navigate if not in modal context
          this.router.navigate(['/products']);
        }
      });
    } else {
      this.productService.addProduct(formData).subscribe((res) => {
        console.log('res', res);
        
        this.formSubmitted.emit();
        if (!this.product) { // Only navigate if not in modal context
          this.router.navigate(['/products']);
        }
      });
    }
  }

  getFullImageUrl(relativePath: string | null | undefined): string {
    if (!relativePath) {
      return ''; // Or a placeholder image URL
    }
    return `${this.backendBaseUrl}${relativePath}`;
  }
}
