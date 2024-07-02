import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductsService } from '../products.service';
import { FormControl, FormGroup } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'QSC-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent implements OnInit {

  /* --------Propiedades-------- */

  // Cargar listado de productos,categorias y tasas
  product:any = {};
  categories:any = [];
  taxes:any = [];
  categoryName:string;
  categoryGetOne:any = [];
  taxesName:string;
  taxesGetOne:any = [];

  // Url
  url:string = "https://quickshopv4.diusframi.tech:39443/api/products/";
  urlCategories:string = "https://quickshopv4.diusframi.tech:39443/api/categories?from=0&size=300&qs=";
  urlTaxes:string = "https://quickshopv4.diusframi.tech:39443/api/taxes?from=0&size=300&qs=";
  urlImages:string = "https://quickshopv4.diusframi.tech:39443/api/images/";

  // Modal
  modal = "none";
  modalMessage:string;

  // Mostrar inputs de precio variable, iva exento, iva no sujeto 
  variable:boolean = true;
  exento:boolean = false;
  noSujeto:boolean = false;

  // Añadir imagen
  image:any = {};
  dataFiles:any = [];

  // Formulario
  formSearch = new FormGroup({
    'name': new FormControl(''),
    'categories': new FormControl(''),
    'code': new FormControl(''),
    'reference': new FormControl (''),
    'description': new FormControl(''),
    'regimeop': new FormControl('01'),
    'epigraph': new FormControl('Apicultura'),
    'priceType': new FormControl(''),
    'price': new FormControl(''),
    'offerPrice': new FormControl(''),
    'since': new FormControl(''),
    'until': new FormControl(''),
    'iva': new FormControl(''),
    'stock': new FormControl(''),
    'image': new FormControl('')
  });

  /* --------Constructor  ngOnInit-------- */

   constructor(private router:Router, private http:HttpClient, private productService: ProductsService){}

  ngOnInit(): void {
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
  formData(){
    console.log(this.image);
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
    
    let values = this.epigraphAndPriceType();

    if(this.categoryGetOne?.CategoryId != null){
      console.log("con category");
        this.product = {
          BarCode: this.formSearch.get("code")?.value,
          Categories: [
            {
              CategoryId: this.categoryGetOne.CategoryId,
              Name: this.formSearch.get("categories")?.value,
              Description: null,
              Created: "",
              CreatedBy: null,
              LastUpdate: "",
              LastUpdateBy: null
            }
          ],
          Images: [
            {
              $id: this.image.$id,
              ImageId: this.image.ImageId,
              Sm: this.image.Sm,
              Md: this.image.Md,
              Extension: this.image.Extension
          }
          ],
          Description: this.formSearch.get("description")?.value,
          ProductId: "",
          Name: this.formSearch.get("name")?.value,
          Price: "Price",
          Reference: this.formSearch.get("reference")?.value,
          RegularPrice: parseInt(this.formSearch.get("price")?.value) * 100,
          SalePrice: parseInt(this.formSearch.get("offerPrice")?.value) * 100,
          DateOnSaleFrom: this.formSearch.get("since")?.value,
          DateOnSaleTo: this.formSearch.get("until")?.value,
          StockQuantity: this.formSearch.get("stock")?.value,
          Tax: {
            TaxId: this.taxesGetOne.TaxId,
            Name: this.formSearch.get("iva")?.value,
            Value: this.taxesGetOne.Value
          },
          TaxRegimen: this.formSearch.get("regimeop")?.value,
          TaxExemptCode: "",
          Epigraph: values.epigraph,
          Type: values.priceType
      }
    } else {
      console.log("sin category");
      let uuid = uuidv4();
        this.product = {
          BarCode: this.formSearch.get("code")?.value,
          Categories: [
            {
              CategoryId: uuid,
              Name: this.formSearch.get("categories")?.value,
              Description: null,
              Created: "",
              CreatedBy: null,
              LastUpdate: "",
              LastUpdateBy: null
            }
          ],
          Images: [
            {
              $id: this.image.$id,
              ImageId: this.image.ImageId,
              Sm: this.image.Sm,
              Md: this.image.Md,
              Extension: this.image.Extension
          }
          ],
          Description: this.formSearch.get("description")?.value,
          ProductId: "",
          Name: this.formSearch.get("name")?.value,
          Price: "Price",
          Reference: this.formSearch.get("reference")?.value,
          RegularPrice: this.formSearch.get("price")?.value,
          SalePrice: this.formSearch.get("offerPrice")?.value,
          DateOnSaleFrom: this.formSearch.get("since")?.value,
          DateOnSaleTo: this.formSearch.get("until")?.value,
          StockQuantity: this.formSearch.get("stock")?.value,
          Tax: {
            TaxId: this.taxesGetOne.TaxId,
            Name: this.formSearch.get("iva")?.value,
            Value: this.taxesGetOne.Value
          },
          TaxRegimen: this.formSearch.get("regimeop")?.value,
          TaxExemptCode: "",
          Epigraph: values.epigraph,
          Type: values.priceType
      }
    }

    //Peticion
    this.addProduct(this.product);
    console.log(this.product);
  }

  // Añadir producto
  addProduct(product:any){

    this.http.post(this.url,product).subscribe(
    response=> {
      console.log("Producto añadido correctamente "+ response);
      this.modalMessage = "se ha añadido correctamente";
      this.openModal();
    },
    error=>{
      this.modalMessage = "no se ha podido añadir correctamente, inténtelo de nuevo";
      this.openModal();
      console.log("error" + error);
    }
    );

  }

  // Modal
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
  
}
