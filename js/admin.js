

let orderData =[];
const orderPageContent = document.querySelector(".orderPage-content");


function init(){
    getOrderList();
}
init();

//c3
function renderC3(){
    // C3.js
    // console.log(orderData)
    let  total ={};
    orderData.forEach(function(item){
        item.products.forEach(function(productItem){
            // console.log(productItem.category);
            if (total[productItem.category] == undefined){
                total[productItem.category] = productItem.price * productItem.quantity;
            }else{
                total[productItem.category] = productItem.price * productItem.quantity;
            }
        })
    })
   

    //取得物件屬性
    const categoryAry = Object.keys(total);
    // console.log(categoryAry);

    let newCategoryAry =[];
    categoryAry.forEach(function(item){
        let ary = [];
        ary.push(item);
        ary.push(total[item]);
        // console.log(ary);
        newCategoryAry.push(ary);
    })
    // console.log(newCategoryAry);
let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
        type: "pie",
        columns: newCategoryAry,
        colors:{
            "床架":"#DACBFF",
            "收納":"#9D7FEA",
            "窗簾":"#5434A7",
        }
    },
});
}

//取得訂單
function getOrderList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        headers:{
            'Authorization':token,
        }
    })

    .then(function (response) {
        orderData = response.data.orders;
        console.log(orderData);
      
        let str = "";
        orderData.forEach(function(item){

        //組訂單日期 start
        const timeStamp = new Date(item.createdAt*1000); //要變成毫秒
        const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth()+1}/${timeStamp.getDate()}`;
        // console.log(orderTime);


        //組產品字串 start
        let productStr = "";
        item.products.forEach(function(productItem){
            // console.log(productItem.title);
            productStr += `<p>${productItem.title}x${productItem.quantity}</p>`
        })
        //組產品字串 end
    
        //處理訂單狀態 start
        let orderStatus = "";
        if (item.paid == false){
            orderStatus = "未處理";
        }else if (item.paid == true){
            orderStatus = "已處理";
        }
        //處理訂單狀態 end

        //組訂單列表
            str += `
            <tr>
                <td>${item.id}</td>
                <td>
                <p>${item.user.name}</p>
                <p>${item.user.tel}</p>
                </td>
                <td>${item.user.address}</td>
                <td>${item.user.email}</td>
                <td>
                ${productStr}
                </td>
                <td>${orderTime}</td>
                <td class="orderStatus">
                <a class="js-orderStatus" href="#" data-status="${item.paid}" data-id="${item.id}">${orderStatus}</a>
                </td>

                <td>
                <input type="button" class="delSingleOrder-Btn js-orderDelete" value="刪除" data-id="${item.id}">
                </td>
            </tr>`
        })
        orderPageContent.innerHTML = str;
        renderC3();
   
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
}

//判斷點擊到 狀態處理 or 刪除
orderPageContent.addEventListener("click",function(e){
    e.preventDefault();
    let targetClass = e.target.getAttribute("class");
    let id = e.target.dataset.id;
    if(targetClass == "js-orderStatus"){
        let status = e.target.dataset.status;
   
        changeOrderStatus(status,id);
        return
    }

    if(targetClass == "delSingleOrder-Btn js-orderDelete"){
        alert("你點到刪除按鈕囉");
        deleteOrderItem(id);
        return
    }

})

//更改訂單狀態
function changeOrderStatus(status,id){
    //點擊後的狀態判斷
    let newStatus;
    if(status == true){
        newStatus =false;
    }else{
        newStatus =true;
    }

    let data ={
        "data": {
            "id": id,
            "paid": newStatus
          }
    }
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,data,{
        headers:{
            'Authorization':token,
        }
    })
    .then(function(response){
        alert("修改訂單成功");
        getOrderList();
    })
    .catch(function (error) {
        // handle error
        console.log(error);
      })


}

//刪除單筆訂單
function deleteOrderItem(id){
    
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/potato1204/orders/${id}`,{
        headers:{
            'Authorization':token,
        }
    })
    .then(function(response){
        alert("刪除該筆訂單成功");
        getOrderList();
    })
}

//刪除全部訂單
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click",function(){
    e.preventDefault()
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/potato1204/orders`,{
        headers:{
            'Authorization':token,
        }
    })
    .then(function(response){
        alert("刪除全部訂單成功");
        getOrderList();
    })

})
