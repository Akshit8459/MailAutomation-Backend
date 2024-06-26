const {Worker}=require('bullmq');
const Groq=require("groq-sdk");
const nodemailer=require('nodemailer');


//categorizing emails using groq-sdk ai api 
const groq = new Groq({ apiKey:"gxxxxuwkQ"});

async function categorizeEmail(message) {
    const prompt=groq.chat.completions.create({
        messages: [{
            role: "user",
            content: `Intrested , Not Interested or Insufficient data choose one for the following Email and give one word answer:${message}`,
        }],
        model: "llama3-8b-8192",
        max_tokens:10
    });
    const chatCompletion = await prompt;
    // Print the completion returned by the LLM.
    return (chatCompletion.choices[0]?.message?.content || "");
}

//sending reply to emails
const sendReply = async (email, category) => {
    let reply;
    if (category === 'Interested') {
      reply = 'Thank you for your interest! Are you available for a demo call? Please suggest a time.';
    } else if (category === 'Not Interested') {
      reply = 'Thank you for your response. If you change your mind, feel free to reach out.';
    } else if (category === 'More information') {
      reply = 'Can you please provide more details about your request?';
    }
    else{
        reply="I am not sure what you are asking. Can you please provide more details?";
    }
    console.log(`${category} -> ${email.trim(0,10)} `);
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth:{
          user:"urmail@gmail.com",
          pass:"1234 5678 9ABC DEFG"
        }
      });
    
      const mailOptions = {
        from: 'SOMEMAIL@gmail.com',
        to: tomail@example.com,
        subject: 'Re: ' + email,
        text: reply,
      };
    
      await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('❌ Error:', error.message);
        } else {
          console.log('✅ Email sent:', info.response);
        }});
};



const worker=new Worker('emailQueue',async job=>{
    const category=await categorizeEmail(job.data);
    sendReply(job.data,category);
    setTimeout(()=>{
        console.log('Automated Email sent',job.data);
    },5000);
},{connection:{host:'localhost',port:6379}});

worker.on('completed',job=>{
    job.remove();
    console.log("job removed");
});
