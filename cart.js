//不能用 ESM 引入Vue
//import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.31/vue.esm-browser.min.js';

const apiUrl = 'https://vue3-course-api.hexschool.io/v2';
const apiPath = 'amberlin';

//區域註冊元件: 解構的寫法
const { defineRule, Form, Field, ErrorMessage, configure } = VeeValidate;
const { required, email, min, max,  numeric} = VeeValidateRules;
const { localize, loadLocaleFromURL } = VeeValidateI18n;

//VeeValidate 提供的Function('規則名稱',規則), 用來定義規則
//依照需求放入特定規則
defineRule('required', required);
defineRule('email', email);
defineRule('min', min);
defineRule('max', max);
defineRule('num',numeric);



//提供中文的驗證資訊 
loadLocaleFromURL('https://unpkg.com/@vee-validate/i18n@4.1.0/dist/locale/zh_TW.json');
//設定語系
configure({ // 用來做一些設定
    generateMessage: localize('zh_TW'), //啟用 locale 
    validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
});



const app=Vue.createApp({
    data() {
        return{
            cartData: {
                carts: [],
            },
            products: [],
            productId: '',
            isLoadingItem: '',
            form: {
                user: {
                    name: '',
                    email: '',
                    tel: '',
                    address: '',
                },
                message: '',
            },
            errors:{},
            isLoadingAll: false,
        }
    },
    components: {
        //:前面是自訂名稱
        VForm: Form,
        VField: Field,
        ErrorMessage: ErrorMessage,
    },
    methods: {
        getProducts() {
            axios.get(`${apiUrl}/api/${apiPath}/products/all`)
                .then((res) => {
                    console.log(res);
                    this.products = res.data.products;
                }
                )
        },
        //利用id取得特定產品
        openProductModal(id) {
            this.productId = id;
            this.$refs.productModal.openModal();
        },
        getCart() {
            axios.get(`${apiUrl}/api/${apiPath}/cart`)
                .then((res) => {
                    console.log(res);
                    this.cartData = res.data.data;
                });
        },
        addToCart(id, qty = 1) {
            const data = {
                product_id: id,
                qty,
            };
            this.isLoadingItem = id;
            //要記得在api 後面帶入 data (api規定的)
            axios.post(`${apiUrl}/api/${apiPath}/cart`, { data })
                .then((res) => {
                    //console.log(res);
                    alert('商品已成功加入購物車');
                    this.getCart();
                    this.$refs.productModal.closeModal();
                    this.isLoadingItem = '';
                })
                .catch((err) => {
                    console.log(err);
                })

        },
        removeCartItem(id) {
            this.isLoadingItem = id;
            axios.delete(`${apiUrl}/api/${apiPath}/cart/${id}`)
                .then((res) => {
                    //console.log(res);
                    alert('商品已從購物車刪除');
                    this.getCart();
                    this.isLoadingItem = '';
                })
                .catch((err) => {
                    console.log(err);
                })
        },
        removeAllCartItem() {

            axios.delete(`${apiUrl}/api/${apiPath}/carts`)
                .then((res) => {
                    //console.log(res);
                    alert('已清空購物車');
                    this.getCart();
                })

        },
        updateCart(item) {
            const data = {
                product_id: item.id,
                qty: item.qty,
            };
            this.isLoadingItem = item.id;
            //要記得在api 後面帶入 data (api規定的)
            axios.put(`${apiUrl}/api/${apiPath}/cart/${item.id}`, { data })
                .then((res) => {
                    //console.log(res);
                    //alert('商品數量已更新');
                    this.addLoading();
                    this.getCart();
                    this.isLoadingItem = '';
                })
                .catch((err) => {
                    console.log(err);
                })
        },
        createOrder() {
            const order = this.form;
            axios.post(`${apiUrl}/api/${apiPath}/order`, { order })
                .then((res) => {
                    console.log(res);
                    alert('訂單已成立');
                    this.addLoading();
                    //清空表單內容
                    this.$refs.form.resetForm();
                    this.getCart();
                })
                .catch((err) => {
                    alert(err);
                })
        },
        addLoading() {
            this.isLoadingAll = true;
            setTimeout(() => {
                this.isLoadingAll = false
            }, 3000)
        },
    },
    mounted() {
        this.getProducts();
        this.getCart();
    }
});

//用$ref
app.component('product-modal', {
    props: ['id'],
    template: '#userProductModal',
    data() {
        return {
            modal: {},
            product: {},
            qty: 1,
        };
    },
    watch: {
        //監控 id,若id變動時,則觸發id()
        id() {
            this.getProduct();
        },
    },
    methods: {
        openModal() {
            this.modal.show();
        },
        closeModal() {
            this.modal.hide();
        },
        getProduct() {
            axios.get(`${apiUrl}/api/${apiPath}/product/${this.id}`)
                .then((res) => {
                    console.log(res);
                    this.product = res.data.product;
                }
                )
        },
        //把product model 的input 資料往外傳
        addToCart() {
            //console.log(this.qty);
            this.$emit('add-cart', this.product.id, this.qty);
        },
    },
    mounted() {
        //html ref="modal"
        this.modal = new bootstrap.Modal(this.$refs.modal);
    },
});

//全域註冊
/* app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage); */
app.component('Loading', VueLoading.Component);
app.mount('#app');