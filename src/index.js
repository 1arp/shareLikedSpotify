const express = require('express')
const app = express()
const PORT = process.env.PORT || 8080

app.use('/',require('./routes'))

app.listen(PORT,()=>console.log(`server started at ${PORT}`))