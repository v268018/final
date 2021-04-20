
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
        const productsPriceRank=[];//排序品項價錢排名
        const otherTotal=[];//其他產品總價
        const colors =['#DACBFF','#9D7FEA','#9D7FEA','#301E5F'];
        const productsRankColor={};
        let otherPrice=0;
        //排序品項價錢排名
        if(productsPrice.length===1){//防止沒有第三名
            productsPriceRank.push(productsPrice[0]);
            productsPriceRank.forEach((item,index)=>{
                if(productsRankColor[item[0]]===undefined){        
                    productsRankColor[item[0]]=colors[index];
                } 
            });
        }else if(productsPrice.length===2){//防止沒有第三名
            productsPriceRank.push(productsPrice[0]);
            productsPriceRank.push(productsPrice[1]);
            productsPriceRank.forEach((item,index)=>{
                if(productsRankColor[item[0]]===undefined){        
                    productsRankColor[item[0]]=colors[index];
                } 
            });
        }else if(productsPrice.length===3){//防止沒有第三名
            productsPriceRank.push(productsPrice[0]);
            productsPriceRank.push(productsPrice[1]);
            productsPriceRank.push(productsPrice[2]);
            productsPriceRank.forEach((item,index)=>{
                if(productsRankColor[item[0]]===undefined){        
                    productsRankColor[item[0]]=colors[index];
                } 
            });
        }else{//有第三名之後加入其他
            productsPriceRank.push(productsPrice[0]);
            productsPriceRank.push(productsPrice[1]);
            productsPriceRank.push(productsPrice[2]);
            for (let i = 3; i <productsPrice.length; i++) {
                otherPrice+=productsPrice[i][1];
            }
            otherTotal.push('其他');
            otherTotal.push(otherPrice);
            productsPriceRank.push(otherTotal);
            const productsRank=[];
            productsPriceRank.forEach(item=>{
                productsRank.push(item[0]);
            })
            console.log(productsPriceRank);
            productsPriceRank.forEach((item,index)=>{
                if(productsRankColor[item[0]]===undefined){        
                    productsRankColor[item[0]]=colors[index];
                } 
            });
            console.log(productsRankColor);
        }
        const chart = c3.generate({
            data: {
                type : 'pie',
                columns:productsPriceRank,
                colors:productsRankColor,            
            },
        });
    },
    //刪除全部訂購人資料
    removeAllOrder(e,vm){
        console.log(123);
        const url =`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/v268018/orders
        `
        axios.delete(url,vm.data.config)
        .then(res=>{
            vm.data.orderData=res.data.orders;
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
        axios.put(url,
            {
                "data": {
                "id": id,
                "paid":true,
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
        //印出訂購人資訊
        this.data.orderData.forEach(item=>{
            let millisecond = Number(item.createdAt + "000");
            let productsStr ='';
            item.products.forEach(item=>{//收集訂購人商品資訊
                productsStr+=`<p class="mb-0">${item.title}</p>`;
            })
            orderListStr+=`
                <tr>
                    <th scope="row" class="align-middle">${item.id}</th>
                    <td class="align-middle">${item.user.name}</td>
                    <td class="align-middle">${item.user.address}</td>
                    <td class="align-middle">${item.user.email}</td>
                    <td class="align-middle">${productsStr}</td>
                    <td class="align-middle">${new Date(millisecond).toLocaleDateString()}</td>
                    <td class="align-middle"><a href="#" data-id="${item.id}" class="editOrderBtn">${item.paid?"以處理":"未處理"}</a></td>
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
            this.removeAllOrder(e,vm);
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