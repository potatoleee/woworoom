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
<del class="originPrice">NT$${toThousand(item.origin_price)}</del>
<p class="nowPrice">NT$${toThousand(item.price)}</p>
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
       
        shoppingCartTotal.textContent = `NT$${toThousand(response.data.finalTotal)}`;

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
            <td>NT$${toThousand(item.product.price)}</td>
            <td>${item.quantity}</td>
            <td>NT$${toThousand(item.product.price*item.quantity)}</td>
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
const orderInfoInput = document.querySelectorAll(".orderInfo-input");
const orderInfoForm = document.querySelector(".orderInfo-form");
// 取得所有帶有 data-msg 的 <p> 標籤
const messages = document.querySelectorAll('[data-message]');

// 綁定整個 form 表單，驗證成功才准許送出表單
orderInfoForm.addEventListener("submit", verification, false);

//驗證條件
const constraints = {
    "姓名": {
      presence: {
        message: "必填欄位"
      }
    },
    "電話": {
      presence: {
        message: "必填欄位"
      },
      length: {
        minimum: 8,
        message: "需超過 8 碼"
      }
    },
    "信箱": {
      presence: {
        message: "必填欄位"
      },
      email: {
        message: "格式錯誤"
      }
    },
    "寄送地址": {
      presence: {
        message: "必填欄位"
      }
    },
    "交易方式": {
      presence: {
        message: "必填欄位"
      }
    },
};

//傳送表單
function sendOrder(){

    const customerName = document.querySelector("#customerName").value;
    const customerPhone = document.querySelector("#customerPhone").value;
    const customerEmail = document.querySelector("#customerEmail").value;
    const customerAddress = document.querySelector("#customerAddress").value;
    const tradeWay = document.querySelector("#tradeWay").value;
    const orderInfoForm = document.querySelector(".orderInfo-form");

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


}

//驗證判斷
function verification(e) {
    e.preventDefault();
    let errors = validate(orderInfoForm, constraints);
    // 如果有誤，呈現錯誤訊息  
    if (errors) {
      showErrors(errors);
    }else if( cartData.length == 0 ){
        alert("購物車沒東西喔！");
        return
    }
     else {
      // 如果沒有錯誤，送出表單
      sendOrder();
      alert("成功送出表單")
    }
}  

//錯誤訊息
function showErrors(errors) {
    messages.forEach((item) => {
      item.textContent = "";
      item.textContent = errors[item.dataset.message];
    })
}

// 監控所有 input 的操作
orderInfoInput.forEach((item) => {
    item.addEventListener("change", function(e) {
      e.preventDefault();
      let targetName = item.name;
      let errors = validate(orderInfoForm, constraints);
      item.nextElementSibling.textContent = "";
      // 針對正在操作的欄位呈現警告訊息
      if(errors){
        document.querySelector(`[data-message='${targetName}']`).textContent = errors[targetName];
      }
    });
});


init();


//千分位
function toThousand(x) { 
    var parts = x.toString().split("."); 
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","); 
    return parts.join("."); 
}


