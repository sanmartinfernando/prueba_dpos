import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../products.service';
import { FormControl, FormGroup } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'QSC-edit-product',
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.css']
})
export class EditProductComponent implements OnInit{

  /*---------Propiedades------*/
  
  // Cargar listado de productos,categorias y tasas
  productId:string;
  product:any = [];
  categories:any = [];
  taxes:any = [];

  // Url
  url:string = "https://quickshopv4.diusframi.tech:39443/api/products/";
  urlCategories:string = "https://quickshopv4.diusframi.tech:39443/api/categories?from=0&size=300&qs=";
  urlTaxes:string = "https://quickshopv4.diusframi.tech:39443/api/taxes?from=0&size=300&qs=";
  urlImages:string = "https://quickshopv4.diusframi.tech:39443/api/images/";

  updateProduct:any;
  
  // Mostrar categoria y tasas en el select
  categoryName:string;
  categoryGetOne:any = [];
  taxesName:string;
  taxesGetOne:any = [];
  
  // Modal
  modal = "none";
  modalMessage:string;

  // Mostrar inputs de precio variable, iva exento, iva no sujeto 
  variable:boolean = true;
  exento:boolean = false;
  noSujeto:boolean = false;

  // Añadir imagenes
  image:any = {};
  dataFiles:any = [];
  
  /* --------Constructor  ngOnInit-------- */

  constructor(private paramsUrl:ActivatedRoute, private router:Router, private http:HttpClient, private productService: ProductsService){}

  ngOnInit(): void {
    this.productId = this.paramsUrl.snapshot.params['id'];
    
    this.productService.showProducts(this.url+this.productId).subscribe(editFormProduct=>{
      this.product = editFormProduct;
      console.log(this.product);
      this.formSearch.get('name')?.setValue(this.product.Name);
      this.formSearch.get("categories")?.setValue(this.product.Categories[0].Name);
      this.formSearch.get("code")?.setValue(this.product.BarCode);
      this.formSearch.get("reference")?.setValue(this.product.Reference);
      this.formSearch.get("description")?.setValue(this.product.Description);
      this.formSearch.get("regimeop")?.setValue(this.product.TaxRegimen);

      if(this.product.Epigraph=="106200"){
        this.formSearch.get("epigraph")?.setValue("Apicultura");
      } else if(this.product.Epigraph=="101100") {
        this.formSearch.get("epigraph")?.setValue("Explotación extensiva de ganado bovino");
      }

      if(this.product.Type == 0){
        this.formSearch.get("priceType")?.setValue("Fijo");
      } else {
        this.formSearch.get("priceType")?.setValue("Variable");
      }
    
      let price = parseInt(this.product.Price) / 100;
      this.formSearch.get("price")?.setValue(price.toString());

      let offerPrice = parseInt(this.product.SalePrice)/100;
      this.formSearch.get("offerPrice")?.setValue(offerPrice.toString());

      this.formSearch.get("since")?.setValue(this.product.DateOnSaleFrom);
      this.formSearch.get("until")?.setValue(this.product.DateOnSaleTo);
      this.formSearch.get("iva")?.setValue(this.product.Tax.Name);
      this.formSearch.get("stock")?.setValue(this.product.StockQuantity);
    });

    this.productService.showProducts(this.urlCategories).subscribe(listCategories=>{
      this.categories=listCategories;
      this.categories.Data.sort((a, b) => a.Name.localeCompare(b.Name));
    });

    this.productService.showProducts(this.urlTaxes).subscribe(listTaxes=>{
      this.taxes=listTaxes;
      this.taxes.Data.sort((a, b) => a.Name.localeCompare(b.Name));
    });
    
  }

  /*---------Funciones------*/

  // Formulario
  formSearch = new FormGroup({
    'name': new FormControl(''),
    'categories': new FormControl(''),
    'code': new FormControl(''),
    'reference': new FormControl (''),
    'description': new FormControl(''),
    'regimeop': new FormControl(''),
    'epigraph': new FormControl(''),
    'priceType': new FormControl(''),
    'price': new FormControl(''),
    'offerPrice': new FormControl(''),
    'since': new FormControl(''),
    'until': new FormControl(''),
    'iva': new FormControl(''),
    'stock': new FormControl(''),
    'image': new FormControl('')
  });

  formData(){
    this.categoryName = this.formSearch.get("categories")?.value;
    this.categoryGetOne = null;
    
    for (let i = 0; i < this.categories.Data.length; i++) {
      if (this.categories.Data[i].Name === this.categoryName) {
        this.categoryGetOne = this.categories.Data[i];
        break;
      }
    }

    this.taxesName = this.formSearch.get("iva")?.value;
    this.taxesGetOne = null;
    
    for (let i = 0; i < this.taxes.Data.length; i++) {
      if (this.taxes.Data[i].Name === this.taxesName) {
        this.taxesGetOne = this.taxes.Data[i];
        break;
      }
    }

    if (this.product.Categories && this.product.Categories.length > 0) {
      if (this.formSearch.get("categories")) {
        if (this.categoryGetOne?.CategoryId != null) {
          this.product.Categories[0].Name = this.formSearch.get("categories")?.value;
          this.product.Categories[0].CategoryId = this.categoryGetOne.CategoryId;
        } else {
          let uuid = uuidv4();
          this.product.Categories[0].Name = this.formSearch.get("categories")?.value;
          this.product.Categories[0].CategoryId = uuid;
        }
      }
    }

    let values = this.epigraphAndPriceType();

    this.product.Name = this.formSearch.get("name")?.value;
    this.product.BarCode = this.formSearch.get("code")?.value;
    this.product.Reference = this.formSearch.get("reference")?.value;
    this.product.Description = this.formSearch.get("description")?.value;
    this.product.TaxRegimen = this.formSearch.get("regimeop")?.value;
    this.product.Epigraph = values.epigraph;
    this.product.Type = values.priceType;
    this.product.RegularPrice = parseInt(this.formSearch.get("price")?.value) * 100;
    this.product.SalePrice = parseInt(this.formSearch.get("offerPrice")?.value) * 100;
    this.product.Tax.Name = this.formSearch.get("iva")?.value;
    this.product.Tax.TaxId = this.taxesGetOne.TaxId;
    this.product.Tax.Value = this.taxesGetOne.Value;
    this.product.StockQuantity = this.formSearch.get("stock")?.value;
    this.product.Images = [
      {
        $id: "",
        ImageId: this.image.ImageId,
        Sm: this.image.Sm,
        Md: this.image.Md,
      }
    ]
    console.log(this.product);
    
    this.editProduct(this.productId,this.product);
  }
  
  // Editar producto
  editProduct(id:any,product:any){
      console.log(this.product);
      this.url = "https://quickshopv4.diusframi.tech:39443/api/products/" + id;
      this.http.post(this.url,product).subscribe(
      response=>{
        console.log("Producto actualizado correctamente"+ response);
        this.modalMessage = "se ha actualizado correctamente";
        this.openModal();
      },
      error=>{
        console.log("error" + error);
        this.modalMessage = "no se ha podido actualizar correctamente, inténtelo de nuevo";
        this.openModal();
      }
    );
  }

  // Modal de información
  openModal = () => {
    this.modal = "block";
  }

  onCloseHandled() {
    this.modal = "none";
    this.router.navigate(['/products']);
  }

  // Valores del epigrafe y tipo de precio
  epigraphAndPriceType() {
    let epigraph = this.formSearch.get("epigraph")?.value;
    let priceType = this.formSearch.get("priceType")?.value

    let values: any = {};

    if(values.epigraph != ''){
        if (epigraph === 'Explotación extensiva de ganado bovino') {
          values.epigraph = '101100';
        } else if (epigraph === 'Apicultura') {
          values.epigraph = '106200';
        }
    }

    if(values.priceType != ''){
      if (priceType === 'Fijo') {
        values.priceType = '0';
      } else if (priceType === 'Variable') {
        values.priceType = '1';
      }
    }

    return values;
  }

  // Mostrar input tipo precio, exento, no sujeto
  addFields(event: any){
    let selectedValue = event.target.value;

    if (selectedValue === 'Variable') {
      this.variable = false;
    } else {
      this.variable = true;
    }

    if (selectedValue === 'EXENTO') {
      this.exento = true;
    } else {
      this.exento = false;
    }

    if (selectedValue === 'NO SUJETO') {
      this.noSujeto = true;
    } else {
      this.noSujeto = false;
    }
  }

  // Añadir imagen
  captureFile(event): any {
    let uuid = uuidv4();
    this.dataFiles = event.target.files;
    this.image = {
      ImageId: uuid, 
      Content: ""
    };
   
    const reader = new FileReader();
    reader.onload = () => {
      this.image.Content = reader.result as string;
      let base64Content = this.image.Content.split(",")[1];
      this.image.Content = base64Content;
     
      this.sendImage(this.image);
    };
    reader.readAsDataURL(this.dataFiles[0]);

  }

  // Enviar imagen
  sendImage(image){
    
    this.http.post(this.urlImages,image).subscribe(
      response=> {
        console.log("Imagen añadida correctamente "+ response);
        this.image = response;
      },
      error=>{
        console.log("error" + error);
      }
      );
  }

  // Borrar imagen
  deleteImage(){
    this.product.Images = [];
    this.url = "https://quickshopv4.diusframi.tech:39443/api/products/" + this.productId;
        this.http.post(this.url,this.product).subscribe(
        response=>{
          console.log("Producto actualizado correctamente"+ response);
        },
        error=>{
          console.log("error" + error);
        }
      );
  }

}
