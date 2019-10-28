//any library we need to create the projects
const axios = require('axios');
const fs = require('fs');

const Ejs = require('ejs');
const Hapi = require('@hapi/hapi');
const Vision = require('@hapi/vision');
const Joi = require('joi');

const xml2js = require('xml2js');
const pg = require('pg');
const conString = "postgres://postgres:postgres@localhost:5432/elevania";
//const client = new pg.Client(conString);

const moduleController = require('./controller/items-controller')
//end of library

//config api
var config = {
    headers: {
        'openapikey': '721407f393e84a28593374cc2b347a98',
        'Accept-Charset': 'utf-8',
        'Content-type': 'text/xml'
    }
}

//get the data from api and write to xml file
fs.exists(__dirname + '/tmp/products.xml',(data)=>{
    if (data) console.log('xml product has been created and updated into table')
    else {
        console.log('create xml file...')
        axios.get( 
            'http://api.elevenia.co.id/rest/prodservices/product/listing',
            config
        )
         .then(response  => {
            // console.log(response.data)
            fs.writeFileSync('D:/elevania/tmp/products.xml',response.data)
            //insert to table 
            const client = new pg.Client(conString);

            client.connect();
            if(client.connect) console.log('Connection to db ok')

            let productXML = fs.readFileSync('./tmp/products.xml',(err,data)=>{
                if (err) throw err
                console.log(data)
            })
            
            xml2js.parseString(productXML, { explicitArray : false }, function (err, result) {
                //const jsonProducts = JSON.stringify(result);
                let responseProducts = result.Products.product
                console.log('Banyak produk :' + responseProducts.length)
                responseProducts.forEach(element => {
                    console.log('Nama Produk :' + element.prdNm,'| Stock : ' + element.prdSelQty , 'Harga : ' + element.selPrc , 'Deskripsi : ' + element.dispCtgrNm) 
                    client.query("INSERT INTO items (id, item_name, stock ,picture, description,price) values ($1,$2,$3,$4,$5,$6)",[parseInt(element.prdNo),element.prdNm,parseInt(element.prdSelQty),element.dispCtgrNm,element.dispCtgrNm,parseInt(element.selPrc)])
                    .then(data=>{
                        console.log(data)
                    })
                    .catch(e=>{
                        console.log(e)
                    })
                })
                
            });
            
         })
         .catch(e =>{
            console.log('hit to ' + e.hostname  + ' error! . XML file not created')
         })
    }
})
//end of process create xml products [xml products has been created]

//create server variable from hapi instance
const server = Hapi.server({'port':3000})

//main function to running the server
const runServer = async()=>{
    
    await server.register(Vision)
    server.views({
        engines : {ejs : Ejs},
        relativeTo : __dirname,
        path : 'views'
    })

    await server.start();
    console.log('Server running on => ' + server.info.uri)

    server.route({
        method:'GET',
        path:'/',
        handler: moduleController.Item.rootHandler
    })

    server.route({
        method:'GET',
        path:'/product',
        handler: moduleController.Item.getAllProducts
    })

    server.route({
        method:'GET',
        path:'/other',
        handler: moduleController.Item.other
    })

    server.route({
        method:'GET',
        path:'/product/add',
        handler: moduleController.Item.addProductPage
    })

    server.route({
        method:'POST',
        path:'/product/add',
        handler: moduleController.Item.addProduct
    })


    // server.route({ 
    //     method: 'GET',
    //     path: '/product/edit/{id}',
    //      handler: function (request, reply) { 
    //       const id = request.params.id; 
    //       request.pg.client.query('SELECT * FROM items where id = $1', [id], (err, result) => { 
    //         if (err) { 
    //           return reply(err).code(500); 
    //         } 
    //         if (!result ||  !result.rows || result.rows.length === 0) { 
    //           return reply({
    //             body: 'Not Found'
    //           }).code(404); 
    //         } 
    //         return reply(result.rows); 
    //       }); 
    //     },
    //      config: { 
    //       validate: { 
    //         params: Joi.object({ 
    //           id: Joi.number().integer().required() 
    //         }) 
    //       } 
    //     }
    //   });

}

runServer()
