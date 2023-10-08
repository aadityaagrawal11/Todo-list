import express from 'express'
import mongoose from 'mongoose'

const app = express();

app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))  // use static css and pages

 mongoose.connect("mongodb+srv://aadityaagrawal11:Aditya%4004@cluster0.7wcn7ro.mongodb.net/todo" )
    const todoSchema = new mongoose.Schema({
        name:{
            type:String,
            
        }
    });

    const Item = mongoose.model("Item", todoSchema);
    
      //Default Todo List Items
    const item1 = new Item({
        name: " Go to Market at 5PM to pick up the parcel"
    });
    const item2 = new Item({
        name: " English Assignment Deadline tomorrow!! "
    });
    const item3 = new Item({
        name: " Call Ashish for advice after dinner"
    });

    const todolistArray = [item1, item2, item3];

    // other List Schema 
    const listSchema=({
        name: String,
        items:[todoSchema]
    })
   
    const List= mongoose.model('List',listSchema);

app.get('/', function(req, res){

    Item.find({}).then( ( result )=> {
        if(result.length === 0){  // If no list in the database
            Item.insertMany( todolistArray ).then( () => { 
                console.log("Data inserted in the Todo List");
                res.redirect('/'); 
               })
           
        }
        else{
            res.render("list", { listTitle: "Today", newlistItems: result});
        }
    } )
    
  
});

// Custom List
app.get("/:customName", function(req, res){
const customName = req.params.customName;

 List.findOne({ name: customName }).then((foundlist => {
    if(!foundlist){
        const list = new List({
            name: customName,
            items:todolistArray
        });
       list.save();
       res.redirect("/"+customName);
    }
    else {
        res.render("list", { listTitle: foundlist.name, newlistItems: foundlist.items});
    }
 }))

  
})

app.post('/', function(req, res){
    
    const itemName = req.body.newItem
    const ListName = req.body.list
    const item = new Item({
        name: itemName
    });
    if(ListName == "Today"){
    item.save();
    res.redirect('/');
    }
    else{
        List.findOne({name:ListName}).then((foundList)=>{
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + ListName);
        })
     }

})

app.post('/delete', ( req, res ) => {
    
    const ListName= req.body.listName;
    const selectedCheckbox = req.body.checkbox;
  
   if(ListName == "Today"){
    Item.findByIdAndRemove(selectedCheckbox).exec();
    res.redirect('/');
    }
    else{
        List.findOneAndUpdate({name:ListName},
            {$pull:{items:{_id:selectedCheckbox}}}).then((foundList)=>{
                 res.redirect("/" + ListName);
        })
     }

})





app.listen(5000, function(){
    console.log('server started on port 5000');
})
