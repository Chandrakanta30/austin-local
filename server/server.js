import "@babel/polyfill";
import dotenv from "dotenv";
import "isomorphic-fetch";
import createShopifyAuth, { verifyRequest } from "@shopify/koa-shopify-auth";
import graphQLProxy, { ApiVersion } from "@shopify/koa-shopify-graphql-proxy";
import Koa from "koa";
import next from "next";
import Router from "koa-router";
import session from "koa-session";
import * as handlers from "./handlers/index";
import axios from "axios";
const getRawBody = require('raw-body')
const FormData = require('form-data');
const fs = require('fs');
const https = require('https');
var Promise = require('promise');

dotenv.config();
const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev,
});
const handle = app.getRequestHandler();
const { SHOPIFY_API_SECRET, SHOPIFY_API_KEY, SCOPES,HOST } = process.env;
app.prepare().then(() => {
  const server = new Koa();
  const router = new Router();
  const cors = require('@koa/cors');
  const {receiveWebhook, registerWebhook} = require('@shopify/koa-shopify-webhooks');
  server.use(session({ secure: true, sameSite: 'none' }, server));

  server.keys = [SHOPIFY_API_SECRET];
  server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET,
      scopes: [SCOPES],

      async afterAuth(ctx) {
        //Auth token and shop available in session
        //Redirect to shop upon auth
        const { shop, accessToken } = ctx.session;
        console.log(accessToken);
        console.log(shop);
        const cookieOptions = {
          httpOnly: true,
          secure: true,
          signed: true,
          overwrite: true
        };
        ctx.cookies.set('shopOrigin', shop, {
          httpOnly: false,
          secure: true,
          sameSite: 'none'
      });
      ctx.cookies.set('accessToken', accessToken, {
          httpOnly: false,
          secure: true,
          sameSite: 'none'
      });
        ctx.cookies.set("shopOrigin", shop, cookieOptions);
        ctx.cookies.set("access_token", accessToken, cookieOptions);
        console.log(ctx.session.accessToken);
        const registration2 = await registerWebhook({
          address: `${HOST}/webhooks/orders/create`,
          topic: 'ORDERS_CREATE',
          accessToken,
          shop,
          apiVersion: '2019-10'
          });
          if (registration2.success) {
          console.log('Successfully registered Order webhook!');
          } else {
          console.log('Failed to register Order webhook', registration2.result);
          }


          const webhook = receiveWebhook({secret: SHOPIFY_API_SECRET});
          router.post('/webhooks/orders/create', webhook, (ctx) => {
              console.log('received webhook: ', ctx.state.webhook);
              console.log(JSON.parse(JSON.stringify(ctx.state.webhook.payload)));
              let scriptData=JSON.parse(JSON.stringify(ctx.state.webhook.payload));
              console.log(scriptData)
          var viewData = { 
              line_items : [],
              billing_address:'',
              billing_address:'',
              order_note:'',
              currency:''
              };
          var  product_images=[];
          for (let index = 0; index < scriptData.line_items.length; index++) {
              if(scriptData.line_items[index].sku.includes("IMPNXT")){
                 let product={
                  product_title:scriptData.line_items[index].title,
                  price:scriptData.line_items[index].price,
                  quantity:scriptData.line_items[index].quantity,
                  sku:scriptData.line_items[index].sku,
                  variant_details:scriptData.line_items[index].variant_title,
                }
                viewData.line_items.push(product);
              }
            }
            if(viewData.line_items.length==0){
              return;
            }
            if(scriptData.customer){
              viewData.customer_details={
                
                customer_first_name:scriptData.customer.first_name,
                customer_last_name:scriptData.customer.last_name,
                customer_email:scriptData.customer.email,
                phone:scriptData.customer.phone
              }
            }
            viewData.id=scriptData.id;
          viewData.price=scriptData.total_price;
          viewData.total_tax=scriptData.total_tax;
          viewData.order_date=scriptData.created_at;
          viewData.shipping_method=scriptData.shipping_lines[0].title;
          viewData.shipping_address=scriptData.shipping_address;
          viewData.billing_address=scriptData.billing_address;
          viewData.currency=scriptData.currency;
          console.log(JSON.stringify(JSON.parse(JSON.stringify(viewData))));
          var form = new FormData();
          form.append('data',JSON.stringify(JSON.parse(JSON.stringify(viewData))));
          const config2 = {     
          headers: {
              'content-type': `multipart/form-data; boundary=${form._boundary}`,
              },
          }
          axios.post(`https://dev.imprintnext.io/austin/wc/designer/api/v1/vendor-order`,form, config2).then(function (response) {
            console.log(response);
          });

          });
        ctx.redirect("/");
      },
    })
  );


  router.get('/orders_list',  verifyRequest(), async (ctx) => {
    console.log(ctx.session.shop);
    const config = {     
      headers: {'Content-Type': 'application/json',
              'Access-Control-Allow-Origin' : '*',
              'Access-Control-Allow-Methods' : 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
              "X-Shopify-Access-Token":ctx.session.accessToken,
             }
      }
      console.log(ctx.session.accessToken);
    let scriptData = await axios.get(`https://`+ctx.session.shop+`/admin/api/2020-10/orders.json?status=any`, config);
    // console.log(scriptData.data);
    let imprintnextOrders=[];
    
    scriptData.data.orders.forEach(async (item, i) => {
       if(item.line_items.length>0){
         var temp_lineitels=[];
        for (let index = 0; index < item.line_items.length; index++) {
         if(item.line_items[index].sku.includes("IMPNXT")){
          item.orderstatus="Not Registered";
          temp_lineitels.push(item.line_items[index]);
          
          // imprintnextOrders[i].imprint_order_status=order_detail_status.data.data.order_status;
          // break;
         }
      }
      if(temp_lineitels.length>0){
        item.line_items=temp_lineitels;
        imprintnextOrders.push(item);
      }
      
    } 

    });
   

    ctx.body = {
     code:200,
     status: 'success',
     ordes_list:imprintnextOrders,
     all_orders_list:scriptData.data.orders
   };
   });
   router.get('/order_details',  verifyRequest(), async (ctx) => {
    const config = {     
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin' : '*',
        'Access-Control-Allow-Methods' : 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
        "X-Shopify-Access-Token":ctx.session.accessToken,
      }
    }
    console.log(ctx.session.shopOrigin);
    if(ctx.request.query.order_id==''){
      ctx.body = {
        code:400,
        status: 'error',
        message:"Order id not found"
      };
    }
    let scriptData = await axios.get(`https://`+ctx.session.shop+`/admin/api/2020-10/orders/`+ctx.request.query.order_id+`.json`, config);
    console.log(scriptData);
    console.log(ctx.cookies.get('shopOrigin'));
    console.log(ctx.session.accessToken);
    console.log(ctx.session.shop);
    var viewData = { 
      line_items : [],
      billing_address:'',
      billing_address:'',
      order_note:'',
      currency:''
    };
    var  product_images=[];
    var imprintnextproducts=[];
    for (let index = 0; index < scriptData.data.order.line_items.length; index++) {
      if(scriptData.data.order.line_items[index].sku.includes("IMPNXT")){
        const product_data = await axios.get(`https://`+ctx.session.shop+`/admin/api/2020-10/products/`+scriptData.data.order.line_items[index].product_id+`/images.json`, config);
        console.log(product_data.data);
        let product={
          product_title:scriptData.data.order.line_items[index].title,
          price:scriptData.data.order.line_items[index].price,
          quantity:scriptData.data.order.line_items[index].quantity,
          sku:scriptData.data.order.line_items[index].sku,
          variant_details:scriptData.data.order.line_items[index].variant_title,
        }
        product_images.push(product_data.data.images[0]);
        // viewData.line_items.push(product);
        imprintnextproducts.push(scriptData.data.order.line_items[index]);
      }
    }
    scriptData.data.order.line_items=imprintnextproducts;
    if(viewData.line_items.length==0){
      ctx.body = {
        code:400,
        status: 'error',
        message:"No line items found in this order"
      };
    }
    if(scriptData.data.order.customer){
      viewData.customer_details={
        
        customer_first_name:scriptData.data.order.customer.first_name,
        customer_last_name:scriptData.data.order.customer.last_name,
        customer_email:scriptData.data.order.customer.email,
        phone:scriptData.data.order.customer.phone
      }
    }
    viewData.id=scriptData.data.order.id;
    viewData.price=scriptData.data.order.total_price;
    viewData.total_tax=scriptData.data.order.total_tax;
    viewData.order_date=scriptData.data.order.created_at;
    viewData.shipping_method=scriptData.data.order.shipping_lines[0].title;
    viewData.shipping_address=scriptData.data.order.shipping_address;
    viewData.billing_address=scriptData.data.order.billing_address;
    viewData.currency=scriptData.data.order.currency;
    console.log(JSON.stringify(JSON.parse(JSON.stringify(viewData))));
    // let formData = new FormData();
    var form = new FormData();
    form.append('data',JSON.stringify(JSON.parse(JSON.stringify(viewData))));
    const config2 = {     
      headers: {
        'content-type': `multipart/form-data; boundary=${form._boundary}`,
        },
    }
    // const webhook_responce = await axios.post(`https://dev.imprintnext.io/austin/wc/designer/api/v1/vendor-order`,form, config2);
    // console.log(webhook_responce.data);
    ctx.body = {
     code:200,
     status: 'success',
     order_details: scriptData.data.order,
     order_details_to_send:viewData,
     images:product_images,
    //  webhook_responce:webhook_responce.data
   };
   });
  server.use(
    graphQLProxy({
      version: ApiVersion.October19,
    })
  );
  router.get("(.*)", verifyRequest(), async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;

  });
  
  
  server.use(cors());
  server.use(router.allowedMethods());
  server.use(router.routes());

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
