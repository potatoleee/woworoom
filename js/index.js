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

//加入購物車事件，監聽最外面ul效能比較好，而且ul永遠都存在比較好
productWrap.addEventListener("click",function(e){
    e.preventDefault();
    // console.log(e.target);
    let addCardBtnClass = e.target.getAttribute("class");
    // 判斷有無點到 加入購物車按鈕
    if(addCardBtnClass !== "addCardBtn"){
        return
    }
    let productId = e.target.dataset.id;
    let numCheck = 1;

    //判斷 購物車產品id 是否等於 我點擊的商品id
    cartData.forEach(function(item){
        if(item.product.id === productId ){
            numCheck = item.quantity += 1;
        }
    })
    // console.log(numCheck);

    let data = {
        "data": {
          "productId": productId,
          "quantity": numCheck
        }
    }
      
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,data)
    
    .then(function (response) {
        //console.log(response.data);
        alert("加入購物車成功");
       getCartList();//記得要再執行getCartList一次才會即時更新
   
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
    
})

//取得購物車列表
function getCartList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    
    .then(function (response) {

        //購物車總金額
        // console.log(response.data.finalTotal)
        const shoppingCartTotal = document.querySelector(".shoppingCart-total");
        shoppingCartTotal.textContent = `NT$${response.data.finalTotal}`;

        cartData= response.data.carts; 
        console.log(cartData);
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
            <td>NT$${item.product.price}</td>
            <td>${item.quantity}</td>
            <td>NT$${item.product.price*item.quantity}</td>
            <td class="discardBtn">
                <a href="#" class="material-icons" data-id="${item.id}" >
                    clear
                </a>
            </td>
        </tr>`
        str += content;
    })
    shoppingCartTableList.innerHTML = str;
}

//篩選按鈕監聽事件
productSelect.addEventListener("change",selectFilter);

//刪除單項購物車
shoppingCartTableList.addEventListener("click",function(e){
    e.preventDefault();
    const cartId = e.target.dataset.id;
    //判斷有無點到按鈕
    if (cartId == null){
        alert("你點到其他東西囉");
        return;
    }
    console.log(cartId);

    //刪除api 開始
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
    
    .then(function (response) {
      console.log(response)
      alert("刪除單筆購物車物品成功");
      //再度取資料
      getCartList();
   
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })

})

//刪除全部購物車;
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click",function(e){
    e.preventDefault();
    console.log(e.target);
     //刪除api 開始
     axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    
     .then(function (response) {
       console.log(response)
       alert("刪除全部購物車物品成功");
       //再度取資料
       getCartList();
    
       })
       .catch(function (error) {
         console.log(error);
        alert("購物車已經清空，請勿重複點擊～！")
       })
})

//送出訂單
const orderInfoBtn = document.querySelector(".orderInfo-btn");

orderInfoBtn.addEventListener("click",function(e){
    e.preventDefault();
    
    //送出表單條件 1.詳填訂單資訊 2.購物車是否有品項
    if( cartData.length == 0 ){
        console.log("購物車沒有東西喔！");
        return
    }
    
    const customerName = document.querySelector("#customerName").value;
    const customerPhone = document.querySelector("#customerPhone").value;
    const customerEmail = document.querySelector("#customerEmail").value;
    const customerAddress = document.querySelector("#customerAddress").value;
    const tradeWay = document.querySelector("#tradeWay").value;
    const orderInfoForm = document.querySelector(".orderInfo-form");

    if(customerName=="" || customerPhone=="" || customerEmail=="" || customerAddress=="" || tradeWay=="" ){
        alert("表單請填寫完整");
        return
    } 

    let data = {
        "data": {
            "user": {
              "name": customerName,
              "tel": customerPhone,
              "email": customerEmail,
              "address": customerAddress,
              "payment": tradeWay
            }
          }
    }
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,data)

    .then(function (response) {
        console.log(response);
        //清空表單
        orderInfoForm.reset();
        getCartList();
   
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })

   
})
init();


