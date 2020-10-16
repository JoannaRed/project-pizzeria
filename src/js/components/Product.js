import { select, templates, classNames} from '../settings.js';
import AmountWidget from '../components/AmountWidget.js';
import utils from '../utils.js';


class Product{
  constructor(id, data){
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;
    
    //console.log('new Product:', thisProduct);
    
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
        }
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
      thisProduct.addToCart();
    });
  }

  processOrder(){
    const thisProduct = this;
    thisProduct.parms = {};
  
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
        const option = param.options[optionId]; 

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
          for (let activeImage of activeImages) {
            activeImage.classList.add(classNames.menuProduct.imageVisible);
          }
        }  else {
          // else jesli opcja jest nie zaznaczona to powinny ja utracic
          for (let activeImage of activeImages){
            activeImage.classList.remove(classNames.menuProduct.imageVisible);
          }
        }

      } 
        
    /* END LOOP: for each optionId in param.options */
    }
    /* END LOOP: for each paramId in thisProduct.data.params */
         
    /*multiply price by amount*/

    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;


    /* set the contents of thisProduct.priceElem to be the value of variable price */

    thisProduct.priceElem.innerHTML = thisProduct.price;
  }    
     

  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }

  addToCart(){
    const thisProduct = this;

    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;

    //app.cart.add(thisProduct);

    const event = new CustomEvent('add-to-cart',{
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });

    thisProduct.element.dispatchEvent(event);

  }
}

export default Product;