
const app ={
    //data
    data:{
        productsData:[],//全部產品資料
        orderData:[],//購物車資料
        selectProductData:'全部',
        productsListStr:'',
        api_path: 'v268018', 
        baseUrl: 'https://hexschoollivejs.herokuapp.com',
    },
    //methods
    //目標
    //篩選購物車種類
    //取得購物車清單
    //把產品加入購物車
    //刪除購物車的東西
    //客戶資料驗證
    //送出客戶資料給後台
    sendUserData(){//送出客戶資料
        const url=`${this.data.baseUrl}/api/livejs/v1/customer/${this.data.  api_path}/orders`;
        const userName=document.querySelector('#userName');
        const userPhone=document.querySelector('#userPhone');
        const userEmail=document.querySelector('#userEmail');
        const userAddress=document.querySelector('#userAddress');
        const userPay=document.querySelector('#userPay');
        axios.post(url,{
            "data": {
                "user": {
                  "name": userName.value,
                  "tel":  userPhone.value,
                  "email": userEmail.value,
                  "address": userAddress.value,
                  "payment": userPay.value,
                }
            }
        }).then(res=>{
            userName.value='';
            userPhone.value='';
            userEmail.value='';
            userAddress.value='';
            userPay.value='';
            swal("已送出訂單", "感謝您的訂購","success");
            this.getCartData();
        }).catch(err=>{
            swal("送出訂單失敗", "請重新確認","warning");
            console.log(err);
        })
    },
    checkForm(){//檢查表單內容
        const constraints = {
            "姓名": {
                presence:{
                    allowEmpty: false,//不可以空白
                    message:"必填",
                },
            },
            "電話": {
                presence:{
                    allowEmpty: false,
                    message:"必填"
                },
                // format: {
                //     pattern: /^09\d{2}-?\d{3}-?\d{3}$/,//檢查台灣手機格式
                //     message: "格式有錯誤",
                // },
                length:{
                        minimum: 8,
                        message: "需超過 8 碼"
                },
            },
            "Email": {
                presence:{message:"必填"},
                email:{message:"格式錯誤"},
            },
            "寄送地址":{
                presence:{
                    allowEmpty: false,
                    message:"必填"
                },
            },
            "交易方式":{
                presence:{message:"必填"},
            }
        };
        const form=document.querySelector('.userForm');
        const sendOrder=document.querySelector('.sendOrder');
        const inputs=document.querySelectorAll("#userName,#userPhone,#userEmail,#userAddress,#userPay");
        sendOrder.addEventListener('click',()=>{//送出訂單按鈕
            const err =validate(form,constraints);
            if(err){//檢查表單是否有錯誤
                Object.keys(err).forEach(item=>{
                 document.querySelector(`.${item}`).textContent=err[item];
                 swal("訂單輸入錯誤", "請重新輸入", "error");
                })
             }else if(this.data.orderData.length===0){//檢查購物車是否有選購
                swal("購物車內沒有東西", "請重新選購", "error");
             }
             else {
                this.sendUserData();
             }
        });
        inputs.forEach(item=>{//input
            item.addEventListener('change',()=>{
                item.nextElementSibling.textContent='';
                const err =validate(form,constraints);
                if(err){
                   Object.keys(err).forEach(item=>{
                    document.querySelector(`.${item}`).textContent=err[item];
                   })
                }
            });
        })
    },
    removeAllCart(){//刪除全部購物車訂單
        const url =`${this.data.baseUrl}/api/livejs/v1/customer/${this.data.api_path}/carts`
        axios.delete(url)
        .then(res=>{
            this.getCartData();
        }).catch(err=>{
            swal("刪除全部購物車失敗", "請重新確認","warning");
            console.log(err.response);
        })
    },
    removeCart(e){//刪除指定的購物車訂單
        e.preventDefault();
        const cartId= e.target.dataset.id;//購物車產品訂單id
        const url=`${this.data.baseUrl}/api/livejs/v1/customer/${this.data.api_path}/carts/${cartId}`
        axios.delete(url)
        .then(res=>{
            this.data.orderData=res.data.carts;
            swal("訂單刪除成功", "歡迎再次下單", "success");
            this.getCartData();
        }).catch(err=>{
            swal("刪除購物車失敗", "請重新確認","warning");
            console.log(err);
        })
    },
    addCart(){//註冊產品加入購物車
        const productsList=document.querySelector('.productsList');//產品列表
        productsList.addEventListener('click',(e)=>{
            console.log(e.target.dataset.id);
            if(e.target.dataset.id===undefined){//檢查是否點擊購物車的按鈕
                return
            };
            let id =e.target.dataset.id;//產品id
            const url=`${this.data.baseUrl}/api/livejs/v1/customer/${this.data.api_path}/carts`;
            let productNum = 1;
            this.data.orderData.forEach(item=>{
                if(item.product.id===id){
                    productNum += item.quantity;
                }
            })
            axios.post(url,{
                    "data": {
                    "productId":id,  
                    "quantity":productNum,
                    }
            }).then(res=>{  
                console.log(res);
                swal("訂單成立", "歡迎再次下單", "success");
                this.getCartData();
            }).catch(err=>{
                console.log(err.response);
            })
        });   
    },
    plusCart(e,index){//修改產品數量++
       const url=`${this.data.baseUrl}/api/livejs/v1/customer/${this.data.api_path}/carts`;
       const id = this.data.orderData[index].id;
       axios.patch(url,
        {
            "data": {
              "id": id,
              "quantity":++this.data.orderData[index].quantity,
            }
        }
       ).then(res=>{
           this.getCartData();
       }).catch(err=>{
           swal("修改產品數量失敗", "請重新確認","warning");
           console.log(err);
       })
    },
    minusCart(e,index){//修改產品數量--
        const url=`${this.data.baseUrl}/api/livejs/v1/customer/${this.data.api_path}/carts`;
        const id = this.data.orderData[index].id;
        if(this.data.orderData[index].quantity===1){//檢查當前產品數量是否等於1防止-1
            swal("產品數量有誤", "請重新確認","warning");
        }else{
            axios.patch(url,
                {
                    "data": {
                      "id": id,
                      "quantity":--this.data.orderData[index].quantity,
                    }
                }
               ).then(res=>{
                   this.getCartData();
               }).catch(err=>{
                swal("修改產品數量失敗", "請重新確認","warning");
                   console.log(err);
               })
        }
       
    },
    selectProductData(){//篩選產品
        const selectProducts =document.querySelector('.selectProducts')//篩選產品
        //篩選商品種類
        selectProducts.addEventListener('change',(e)=>{
            const vm =this;
            this.data.selectProductData=selectProducts.value;//把選擇的類型放入select裏頭
            console.log(selectProducts.value);
            vm.getProductData();
        });
    },
    renderData(item){//印出產品畫面字串
        const productsList=document.querySelector('.productsList');//產品列表
        this.data.productsListStr+= `<li class="card-group col col-sm-6 col-md-3">
        <div class="card border-0">
            <img src="${item.images}" class="card-img-top img-fluid" alt="...">
            <button class='addCart btn-dark btn rounded-0' data-id=${item.id}>加入購物車</button>
            <div class="card-body">
                <p class="card-title font-M text-Bold mb-2">${item.title}</p>
                <p class="card-text  font-M text-Bold mb-2">
                    <del>NT$${this.toThousands(item.origin_price)}</del>
                </p>
                <p class="card-text font-XL text-Bold">NT$${this.toThousands(item.price)}</p>
            </div>
        </div>
        </li>`
    },
    render(){//渲染畫面
        //dom
        const productsList=document.querySelector('.productsList');//產品列表
        //data
        const productsData=this.data.productsData;//產品資料
        this.data.productsListStr='';//避免從整網頁把上一筆組字串的結果組起來
        //渲染產品列表字串
        if(this.data.selectProductData==='全部'){
            productsData.forEach(item=>{
                this.renderData(item);
            });
        }else{
            productsData.forEach(item=>{
                if(item.category===this.data.selectProductData){
                    this.renderData(item);
                }
            });    
        }
        productsList.innerHTML=this.data.productsListStr;  
    },
    getCartData(){//取得購物車列表
        const url =`${this.data.baseUrl}/api/livejs/v1/customer/${this.data. api_path}/carts`;
        const order =document.querySelector('.order');//切換是否購物(購物)
        const noOrder=document.querySelector('.no-Order')//切換是否購物(非購物)
        const orderList =document.querySelector('.orderList');//購物車內容
        let orderListStr='';
        axios.get(url)
        .then(res=>{
            this.data.orderData=res.data.carts;
            //渲染購物車清單
            if(this.data.orderData.length===0){//isOrder判斷是否有購物
                order.classList.add('d-none');
                noOrder.classList.remove('d-none');
            }else{
                order.classList.remove('d-none');
                noOrder.classList.add('d-none');
                let total=0;
                this.data.orderData.forEach(item=>{
                    total+=item.product.price*item.quantity;
                    orderListStr+=
                    `<tr class="border-Bottom font-M">
                        <th scope="row" class="align-middle">
                            <img src=${item.product.images} alt="" class="cart-Img img-fluid mr-3">
                            ${item.product.title}
                        </th>
                        <td class="align-middle">NT$${this.toThousands(item.product.price)}</td>
                        <td class="align-middle">
                            <a href="#" class="minusCart">
                                <i class="fas fa-minus"></i>
                            </a>
                            ${item.quantity}
                            <a href="#" class="plusCart">
                                <i class="fas fa-plus"></i>
                            </a>
                        </td>
                        <td class="align-middle">NT$${this.toThousands(item.product.price*item.quantity)}</td>
                        <td class="align-middle">
                            <a href="#" class="removeOrder">
                                <i class="far fa-trash-alt" data-id=${item.id}></i>   
                            </a>
                        </td>
                    </tr>`
                });
                orderList.innerHTML=orderListStr+`
                    <tr>
                        <th scope="row" class="align-middle" colspan="3">
                            <button class="btn-outline-dark btn removeAllOrder">刪除所有品項</button>
                        </th>
                        <td class="font-M align-middle text-Bold">總金額</td>
                        <td class="font-XL align-middle text-Bold">NT$${this.toThousands(total)}</td>
                </tr>`; 
                //修改購物車++
                const plusCart =document.querySelectorAll('.plusCart');//加數量
                plusCart.forEach((item,index)=>{
                    item.addEventListener('click',(e)=>{
                        e.preventDefault();
                        this.plusCart(e,index);
                      
                    })
                })
                //修改購物車--
                const minusCart =document.querySelectorAll('.minusCart');//減數量
                minusCart.forEach((item,index)=>{
                    item.addEventListener('click',(e)=>{
                        e.preventDefault();
                        this.minusCart(e,index);
                    })
                })
                //刪除全部購物車清單
                const removeAllOrder=document.querySelector('.removeAllOrder');
                removeAllOrder.addEventListener('click',()=>{
                        swal({
                            title:"清除全部購物車",
                            icon:"warning",
                            buttons: {
                                cancel: {
                                  text: "取消",
                                  visible: true
                                },
                                danger: {
                                  text: "確定",
                                  visible: true
                                }
                            }
                        }).then((value) => {//接收到選取到的按鈕
                            if(value==='danger'){
                                this.removeAllCart();
                                swal("已全數刪除購物車", "歡迎再次選購", "success");
                            }
                        });
                });
                //刪除特定購物車清單
                const removeOrder=document.querySelectorAll('.removeOrder');
                removeOrder.forEach(item=>{
                    item.addEventListener('click',(e)=>{
                        this.removeCart(e);
                    });
                })
            }
        }).catch(err=>{
            swal("取得購物車資料錯誤", "請重新確認","warning");
            console.log(err);
        })
    },
    getProductData(){//取得產品資料
        const vm =this;
        axios.get(`${vm.data.baseUrl}/api/livejs/v1/customer/${vm.data.api_path}/products`).
          then(function (response) {
            vm.data.productsData= response.data.products;
            vm.render();
          }).catch(err=>{
            swal("取得產品資料錯誤", "請重新確認","warning");
            console.log(err);
        })
    },
    init(){//初始化
        this.getProductData();//取得產品資料
        this.selectProductData();//註冊選擇類型資料
        this.addCart();//註冊產品加入購物車
        this.getCartData();//取得購物車資料
        this.checkForm();//初始化表單
    },
    //until js
    toThousands(num){//轉千分位
        var parts = num.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    } 
}
app.init();
  
