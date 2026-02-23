const connection = require('../../db/userDB')
const util = require("util")

const query = util.promisify(connection.query).bind(connection)



///////////////////
// CREATE PRODUCTS
///////////////////
const createProduct = async (req,res) =>{
    const {name,
        description,
        price,
        stock_quantity,
        category_id,
        subcategory_id,
        image_url,
        status} = req.body;

    // auth middleware
    const user_id = req.user?.id ||null
    
    if(!name || price === undefined){
        return res.status(400).json({
            message:"Name and price required"
        })
    }

    try {
        
        if(category_id){
            const cat = await query(
                'SELECT * FROM categories WHERE category_id = ?',[category_id]
            );

            if(cat.length === 0){
                return res.status(404).json({
                    message:"category not found"
                })
            }

        }

        const result = await query(`INSERT INTO products 
                (name,description,price,stock_quantity,category_id,subcategory_id,user_id,image_url,status)  
                Values (?,?,?,?,?,?,?,?,?)
            `,[
                name,
                description||null,
                price,
                stock_quantity ?? 0,
                category_id||null,
                subcategory_id|| null,
                user_id,
                image_url || null,
                status || "Active"
            ])
        return res.status(200).json({
            message:"Product created",
            productId: result.insertId
        })
        
    } catch (error) {
        console.error(error)
        return res.status(500).json({message:"Server error"}) 
    }

}

module.exports = {createProduct}