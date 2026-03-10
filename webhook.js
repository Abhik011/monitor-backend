router.post("/razorpay", async (req,res)=>{

  const event = req.body;

  if(event.event === "payment.captured"){

     const email = event.payload.payment.entity.email;

     const org = await Organization.findOne({email});

     org.plan = "GROWTH";

     await org.save();

  }

  res.json({received:true});

});