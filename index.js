const express = require("express");
const dotenv = require("dotenv");
const instagramRouter = require("./routes/InstagramRouter");
const port = 80;

let data = [];

const app = express();

app.use(express.json());


<script>
  window.fbAsyncInit = function() {
    FB.init({
      appId      : '{your-app-id}',
      cookie     : true,
      xfbml      : true,
      version    : '{api-version}'
    });
      
    FB.AppEvents.logPageView();   
      
  };

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "https://connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));
</script>

app.use("/instagram", instagramRouter);

// app.use("/twitter", twitterRouter);

app.get("/verify", (req, res) => {
  console.log(req);
  res.send("Hello world");
});

app.listen(port, () => {
  console.log("Server listening on port ", port);
});
