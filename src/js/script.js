/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

class Product {
  constructor(id, data){
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;
    
    console.log('new Product:', thisProduct);
    
    thisProduct.renderInMenu();
    thisProduct.getElmenets();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder(); 
    
  }

  renderInMenu(){
    const thisProduct = this;
  
  // wygenerować kod HTML pojedynczego produktu,
  
  const generatedHTML = templates.menuProduct(thisProduct.data);
  
  //stworzyć element DOM na podstawie tego kodu produktu,
  
  thisProduct.element = utils.createDOMFromHTML(generatedHTML);

  // znaleźć na stronie kontener menu,
  
  const menuContainer = document.querySelector(select.containerOf.menu);  

  //  wstawić stworzony element DOM do znalezionego kontenera menu.
  
  menuContainer.appendChild(thisProduct.element);
  }

  getElmenets () {
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion (){
    const thisProduct = this;  
  
    /* find the clickable trigger (the element that should react to clicking) */

    const clickedElement = thisProduct.element.querySelector(select.menuProduct.clickable);

    /* START: click event listener to trigger */

    clickedElement.addEventListener('click', function(event) {
      /* prevent default action for event */

      event.preventDefault();
      /* toggle active class on element of thisProduct */

      thisProduct.element.classList.toggle('active');

      /* find all active products */

      const activeProducts = document.querySelectorAll('.product.active');

      /* START LOOP: for each active product */

      for(let activeProduct of activeProducts) {
          
        /* START: if the active product isn't the element of thisProduct */
        
        if (activeProduct !== thisProduct.element) {
          /* remove class active for the active product */

          activeProduct.classList.remove('active');
        };
      }
      /* END: click event listener to trigger */
    });
  }

  initOrderForm () {

    const thisProduct = this;

    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });
  
    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }
  
    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });
  }

  processOrder(){
    const thisProduct = this;
  
    /* read all data from the form (using utils.serializeFormToObject) and save it to const formData */
  
    const formData = utils.serializeFormToObject(thisProduct.form);

    /* set variable price to equal thisProduct.data.price */

    let price = thisProduct.data.price;
  
    /* START LOOP: for each paramId in thisProduct.data.params */

    for (let paramId in thisProduct.data.params) {

      /* save the element in thisProduct.data.params with key paramId as const param */

      const param = thisProduct.data.params[paramId];

        /* START LOOP: for each optionId in param.options */
        
        for (let optionId in param.options) {

        /* save the element in param.options with key optionId as const option */
  
        const option = thisProduct.param.option[optionId]; 

        /* START IF: if option is selected and option is not default */

        const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
        if (optionSelected && !option.default) {

          /* add price of option to variable price */
        
          price += option.price;

          /* END IF: if option is selected and option is not default */
          }
          /* START ELSE IF: if option is not selected and option is default */
         
          else if (option.default && !optionSelected) {
         
          /* deduct price of option from price */
        
          price -= option.price;  

        /* END ELSE IF: if option is not selected and option is default */
      }

      // zapisz obrazki w stalej
      const activeImages = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);

      // start if jesli opcja jest zazanczona to wszystkie obrazki powinny dostac klase ..

      if(optionSelected){
        for (activeImage of activeImages) {
          activeImage.classList.add(classNames.menuProduct.imageVisible);
        }
      }  
        // else jesli opcja jest nie zaznaczona to powinny ja utracic
        else {
          for (activeImage of activeImages){
            activeImage.classList.remove(classNames.menuProduct.imageVisible);
          }

        } 
        
      /* END LOOP: for each optionId in param.options */
    }
    /* END LOOP: for each paramId in thisProduct.data.params */
  }
    /* set the contents of thisProduct.priceElem to be the value of variable price */

    price = thisProduct.priceElem.innerHTML;

  }

  class AmountWidget {
    constructor(element){
      const thisWidget = this;

      console.log('AmountWidget:', thisWidget);
      console.log('constructor arguments:', element);

    }

  }

  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
  }

  const app = {
    initMenu: function(){

      const thisApp = this;
      //console.log('thisApp.data:', thisApp.data);

      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }

      /*const testProduct = new Product();
      console.log('testProduct:', testProduct);*/
    },

    initData: function(){
      const thisApp = this;

      thisApp.data = dataSource;
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();

    },
  }

  
  app.init();
}
