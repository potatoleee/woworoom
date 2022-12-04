const productWrap = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");
const shoppingCartTableList = document.querySelector(".shoppingCart-tableList");
let productsData ;
let cartData;

//初始化
function init(){
    getProductList()
    getCartList()
}

//取得產品列表
function getProductList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
    
    .then(function (response) {
        productsData = response.data.products; 
        console.log(productsData);
       renderProductList(productsData);
       
   
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
}  

//渲染產品列表
function renderProductList(data){

    let str = "";
    data.forEach(function(item){
        let content = `
         <li class="productCard">
<h4 class="productType">新品</h4>
<img src="${item.images}" alt="">
<a href="#" class="addCardBtn" data-id="${item.id}" >加入購物車</a>
<h3>${item.title}</h3>
<del class="originPrice">NT$${item.origin_price}</del>
<p class="nowPrice">NT$${item.price}</p>
</li>
        `
        str += content;
    })
    productWrap.innerHTML = str;
   
}

//產品篩選
function selectFilter(e){

    select = e.target.value;
    // console.log(select);

    if ( select === "全部"){
        renderProductList(productsData);
        return
    }else{
        tempData =[];//放篩選後的資料
        productsData.forEach(function(item){
            if(item.category === select){
                tempData.push(item)
            }
            renderProductList(tempData);
        })
    }
}

//監聽購物車按鈕，監聽最外面ul效能比較好，而且ul永遠都存在比較好
productWrap.addEventListener("click",function(e){
    e.preventDefault();
    // console.log(e.target);
    let addCardBtnClass = e.target.getAttribute("class");
    // 判斷有無點到 加入購物車按鈕
    if(addCardBtnClass !== "addCardBtn"){
        return
    }
    let productId = e.target.dataset.id;
    // console.log(productId);
    addCartItem(productId);
    
})

//取得購物車列表
function getCartList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    
    .then(function (response) {
        cartData= response.data.carts; 
        renderCartList(cartData);
   
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
}

//渲染購物車列表
function renderCartList(cartData){
    let str = "";
    cartData.forEach(function(item){
        let content = `
        <tr>
            <td>
                <div class="cardItem-title">
                    <img src="${item.product.images}" alt="">
                    <p>${item.product.title}</p>
                </div>
            </td>
            <td>${item.product.price}</td>
            <td>1</td>
            <td>${item.product.price}</td>
            <td class="discardBtn">
                <a href="#" class="material-icons">
                    clear
                </a>
            </td>
        </tr>`
        str += content;
    })
    shoppingCartTableList.innerHTML = str;
}




//加入購物車 
function addCartItem(id){
    let data = {
        "data": {
          "productId": id,
          "quantity": 1
        }
    }
      

    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,data)
    
    .then(function (response) {
        //console.log(response.data);
       getCartList();//記得要再執行getCartList一次才會即時更新
   
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
}

//篩選按鈕監聽事件
productSelect.addEventListener("change",selectFilter);


init();


