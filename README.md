
# MailAutomation-Backend
This is an automation app that runs on console/backend that read user mails from google's gmail and send an automated email for the mails by classifying them into i) Interested ii) Not Interested & iii) More Information using AI. After Classification a suitable response is generated and the automated email is sent.

# deployment
  1) Clone repo
  2) install dependencies (npm i ***)
  3) initialise a redis docker -> docker run -itd -p 6379:6379 redis
  4) use node or nodemon run start on index.js to add the mails into queue(BullMQ)
  5)  use node or nodemon run start on mailsender.js which is the worker file that dequeue job from the queue(BULLMQ) and send the mails
