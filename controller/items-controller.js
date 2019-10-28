const pg = require('pg');
const conString = "postgres://postgres:postgres@localhost:5432/elevania";

var me = ''

class Item  {
    static rootHandler = (request, h) => {
        return h.view('index', {
            title: 'Elevenia API',
            message: 'Data updated'
        });
    };

    static getAllProducts = (request, h) => {
        const client = new pg.Client(conString);
        
        client.connect();
        
        if(client.connect) console.log('connection to db ok')
    
        const runQuery = async()=>{
            await  client.query("SELECT * FROM items")
            .then(data => {
               me = data.rows
               console.log(me)
            })
            .catch(e=>{ 
                console.log(e)
            })
        }
       
        runQuery()
         
        return h.view('halaman-produk', {
            datanya : me,
            hasilnya: 'ini halaman produk'
        });     
    }


    static other =  (request, h) => {
        return h.view('halaman-other',{hasilnya: 'ini halaman produk'});   
    }

    static addProductPage = (request, h) => {
        return h.view('halaman-add',{hasilnya: 'ini halaman add produk'}); 
    }

    static addProduct = (request, h)=>{
        console.log('masuk')
        var item = request.payload.item
        var stock = request.payload.stock
        var picture = request.payload.picture
        var description = request.payload.description
        var price = request.payload.price
           
        const client = new pg.Client(conString);
        
        client.connect();
        
        if(client.connect) console.log('connection to db ok')
        
        const runQuery = async()=>{
            await  client.query("INSERT INTO items VALUES (" + item + ',' + stock + picture + ',' + description + ',' + price + ")")
            .then(data => {
               console.log(data)
            })
            .catch(e=>{ 
                console.log(e)
            })
        }
       
        runQuery()
         
        return (request,h)=>{
            h.view('halaman-produk',{hasilnya : 'insert data berhasil'})
        }
        
    }

    
}


module.exports = {Item}