//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.set('strictQuery' , false);


const MONGODB_URL = 'mongodb+srv://niyatit:abcd@cluster0.oba68wb.mongodb.net/todolistDB?retryWrites=true&w=majority';
// const MONGODB_URL = "mongodb://127.0.0.1:27017/todolistDB";
mongoose.connect(MONGODB_URL)
  .then(()=>{
    console.log("Connected to MongoDB");
  })
  .catch((err)=>{
    console.log(err);
  });


// const url = "mongodb+srv://niyatit:abcd@cluster0.oba68wb.mongodb.net/todolistDB?retryWrites=true&w=majority";
// const connectionParams={
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// };
// mongoose.connect(url,connectionParams)
//     .then( () => {
//         console.log('Connected to the database ')
//     })
//     .catch( (err) => {
//         console.error(`Error connecting to the database. n${err}`);
//     });
//
//     console.log("DEBUG: Connected to database!")
const itemsSchema = mongoose.Schema({
  name: String
});

const Item = new mongoose.model("Item", itemsSchema);

const task1 = new Item({
  name: "Eat fruits"
});

const task2 = new Item({
  name: "Check messages"
});

const task3 = new Item({
  name: "Send Snap"
});

const defaultItems = [task1, task2, task3];

app.get("/", function(req, res) {
  const items = [];

  Item.find({}, function(err, result){
    if(result.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Items add");
        }
      });
      res.redirect("/");
    }else{
      result.forEach(function(i){
        items.push(i);
      });
      res.render("list", {listTitle: "Today", newListItems: items});
    }

  });

});


const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.post("/", function(req, res){
  const listname = req.body.list;
  const newItem = new Item({
    name: req.body.newItem
  });
  console.log(listname);
  if(listname === "Today"){
    newItem.save();
    res.redirect("/");
  }else{
    List.findOne({name : listname}, function(er, lst){
      if(er){
        console.log(er);
      }else{
        lst.items.push(newItem);
        lst.save();
        res.redirect("/"+listname);
      }
    });
  }

    // console.log("added successfully");

});

app.post("/delete", function(req, res){
  const listname = req.body.listN;
  const deleteItem = req.body.deleteItem;
  console.log(listname+" "+deleteItem);
  if(listname == "Today"){
    Item.findByIdAndRemove(deleteItem, function(e){
      if(e){
        console.log(e);
      }else{
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name : listname}, {$pull: {items: {_id: deleteItem}}},function(er, lst){
      if(er){
        console.log(er);
      }else{
        res.redirect("/"+listname);
      }
    });
  }

});

app.get("/:id", function(req, res){
  const listn = _.capitalize(req.params.id);

  List.findOne({name: listn}, function(err,rs){
    if(err){
      console.log(err);
    }else{
      if(rs){
        res.render("list", {listTitle: listn, newListItems: rs.items});
      }else{
        const list = new List({
          name: listn,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+listn);
      }
    }
  });

});
  // console.log("I am called");
  // const listn = req.params.id;
  // let id = "";
  // List.find({name : listn}, function(e, r){
  //   if(e){
  //     console.log(e);
  //   }else{
  //     console.log("Done");
  //   }
  //   id = r[0]._id.toString();
  //   // console.log(id.toString());
  // });
  //
  // console.log(id);

  // console.log(itm[0]);
  // if(itm.length > 0){
  //   console.log("itm"+itm);
  //   console.log("Found")
  //   id = itm._id;
  //   console.log("id"+id);
  // }else{
  //   console.log("creating one");
  //   List.create({
  //     name: listn,
  //     items: []
  //   });

    // console.log("/"+listn);
    // res.redirect("/"+listn);





  // listn.find({}, function(err, result){
  //     result.forEach(function(i){
  //       items.push(i);
  //     res.render("list", {listTitle: listn, newListItems: items});
  //   });
  // });
// });

// app.post("/:id", function(req, res){
// const listName = req.params.id;
//   const newItem = new listName({
//     name: req.body.newItem
//   });
//     newItem.save();
//     console.log("added successfully");
//     res.redirect("/"+listName);
// });
//
// app.post("/:id/delete", function(req, res){
//   const deleteItem = req.body.deleteItem;
//   const listName = req.params.id;
//   listName.deleteOne({id: deleteItem}, function(e){
//     if(e){
//       console.log(e);
//     }else{
//       console.log(deleteItem);
//       console.log("deleted successfully");
//     }
//   });
//   res.redirect("/"+listName);
// });

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

// app.get("/about", function(req, res){
//   res.render("about");
// });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
