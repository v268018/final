//目標
//渲染畫面把資料印出
//編輯訂購人資訊
//刪除特定訂購人資料
//刪除全部訂購人資料
//印出c3圖表
const app = {
    //data
    data:{
        orderData:[],//存放訂購人資訊
        config:{//給後端驗證格式token
            headers:{
                'Authorization':'31kuk1X27zgnWA862m0er6hbrwm1',
            }
        },
    },
    //methods
    //c3圖表
    renderC3(){
        const productsNumObj={};//訂單產品總數量
        const productsPriceObj={};//訂單產品單價
        //收集訂單產品總數量
        this.data.orderData.forEach(item=>{
            item.products.forEach(item=>{
                if(productsNumObj[item.title]===undefined){
                     productsNumObj[item.title]=item.quantity;
                }else{
                     productsNumObj[item.title]+=item.quantity;
                }

            })
        });
        //收集訂單產品單價
        this.data.orderData.forEach(item=>{
            item.products.forEach(item=>{
                if(productsPriceObj[item.title]===undefined){
                    productsPriceObj[item.title]=item.price;
                }
            })
        });
        const productsNum=[];//放入產品數量
        const productsPrice=[];//放入計算產品數量總價
        Object.keys(productsNumObj).forEach(item=>{
            let arr =[];
            arr.push(item);
            arr.push(productsNumObj[item]);
            productsNum.push(arr);
        })
        productsNum.forEach(item=>{
            console.log()
            let arr =[];
            arr.push(item[0]);
            arr.push(item[1]*productsPriceObj[item[0]]);
            productsPrice.push(arr);
        })
        //排序產品數量總價大到小
        productsPrice.sort((a,b)=>{
            return b[1]-a[1]
        })
        //判斷產品排名是否超過三筆
        if(productsPrice.length>3){
            let total =0;
            productsPrice.forEach((item,index)=>{
                if(index>2){
                    total+=productsPrice[index][1];
                }
            })
            productsPrice.splice(3,productsPrice.length);
            productsPrice.push(['其他',total]);
            console.log(productsPrice);
        }
        const chart = c3.generate({
            data: {
                type : 'pie',
                columns:productsPrice,     
            },
            color: {
                pattern: ["#301E5F", "#5434A7", "#9D7FEA", "#DACBFF"],
            }   
        });
    },
    //刪除全部訂購人資料
    removeAllOrder(e,vm){
            const url =`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/v268018/orders
            `
            axios.delete(url,vm.data.config)
            .then(res=>{
                vm.data.orderData=res.data.orders;
                swal("已全數刪除購物車", "歡迎再次選購", "success");
                vm.Render();
            }).catch(err=>{
                console.log(err);
            })
    },
    //刪除特定訂購人資料
    removeOrder(e,vm){
        e.preventDefault();
        const id =e.target.dataset.id;
        const url=`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/v268018/orders/${id}`;
        axios.delete(url,vm.data.config)
        .then(res=>{
            vm.data.orderData=res.data.orders;
            swal("訂單刪除成功", "已清空", "success");
            vm.Render();
        }).catch(err=>{
            console.log(err);
        })
    },
    //編輯訂購人付款
    editOrder(e,vm){
        e.preventDefault();
        const url=`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/v268018/orders
        `;
        const id = e.target.dataset.id //訂購訂單
        let paidState;
        vm.data.orderData.forEach(item=>{//抓取訂單的付款狀況
            if(item.id===id){
                paidState=item.paid;
            }
        })
        axios.put(url,
            {
                "data": {
                "id": id,
                "paid":!paidState,//切換付款
                }
            },
            vm.data.config,
       ).then(res=>{
            vm.data.orderData=res.data.orders;//把修改後的資料放入到訂購人資訊更新
            vm.Render();
        }).catch(err=>{
            console.log(err);
        }) 
    },
    //渲染畫面
    Render(){
        const orderList =document.querySelector('.orderList');
        const noOrder = document.querySelector('.noOrder')
        const chart = document.querySelector('#chart');
        let orderListStr='';
        if(this.data.orderData.length>0){//檢查是否有訂單
            //印出c3圖表
            noOrder.classList.add('d-none');
            chart.classList.remove('d-none');
            this.renderC3();
        }else{//避免刪除全部資料後圖表還在
            chart.classList.add('d-none');
            noOrder.classList.remove('d-none');
        }
        console.log(this.data.orderData);
        //印出訂購人資訊
        this.data.orderData.forEach(item=>{
            let millisecond = Number(item.createdAt + "000");
            let productsStr ='';
            item.products.forEach(item=>{//收集訂購人商品資訊
                productsStr+=`<p class="mb-0">${item.title}x${item.quantity}</p>`;
            })
            orderListStr+=`
                <tr>
                    <th scope="row" class="align-middle">${item.id}</th>
                    <td class="align-middle">${item.user.name}</td>
                    <td class="align-middle">${item.user.address}</td>
                    <td class="align-middle">${item.user.email}</td>
                    <td class="align-middle">${productsStr}</td>
                    <td class="align-middle">${new Date(millisecond).toLocaleDateString()}</td>
                    <td class="align-middle"><a href="#" data-id="${item.id}" class="editOrderBtn">${item.paid?"已支付":"未支付"}</a></td>
                    <td class="align-middle">
                        <button data-id="${item.id}" class="btn btn-outline-danger removeOrderBtn">刪除</button>
                      
                    </td>
                </tr>`;
        });
        orderList.innerHTML= orderListStr;
        //編輯訂單付款
        const editOrderBtn =document.querySelectorAll('.editOrderBtn');
        editOrderBtn.forEach(item=>{
            const vm = this;
            item.addEventListener('click',(e)=>{
                this.editOrder(e,vm);
            });
        })
        //刪除訂購人資料
        const  removeOrderBtn =document.querySelectorAll('.removeOrderBtn');
        removeOrderBtn.forEach(item=>{
            const vm =this;
            item.addEventListener('click',(e)=>{
                this.removeOrder(e,vm);
            })
        })
        //刪除全部訂購人資料
        const removeAllBtn =document.querySelector('.removeAllBtn');
        removeAllBtn.addEventListener('click',(e)=>{
            const vm =this;
            if(this.data.orderData.length<=0){//檢查是否還有訂單數
                alert('尚無訂單');
                return
            }
            swal({//防止使用者全數刪除給予判斷
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
                    vm.removeAllOrder(e,vm);
                }
            });
        });
    },
    //初始化
    init(){
        const url=`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/v268018/orders `;
        axios.get(url,this.data.config).then(res=>{
            this.data.orderData=res.data.orders;//獲取客戶訂單資料
            this.Render();
        }).catch(err=>{
            console.log(err);
        })
    },
}
app.init();